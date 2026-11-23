"""離線驗證有效 Bob post-commit 的 opt-in gate；只執行暫存副本與 stub Git。"""

import argparse
import hashlib
import json
import os
from pathlib import Path
import re
import shlex
import shutil
import subprocess
import sys
from tempfile import TemporaryDirectory


ROOT = Path(__file__).absolute().parent.parent
AUDITED_HOOK_SHA256 = "43429f96444e2b9e0d632a63147635a0aa5b6adee7c068cbbdcdd2b5b31b0761"
GATE = 'if [ "${BOB_NOTES_REMOTE_SYNC:-}" != "1" ]; then\n        return 0\n    fi'
UTILITIES = ("grep", "cut", "tr", "mktemp", "mv", "rm")
GIT_STUB = r'''
import json
import os
from pathlib import Path
import sys

sys.stdout.reconfigure(newline=chr(10))
state = Path(os.environ["BOB_TEST_STATE"])
args = sys.argv[1:]
with (state / "calls.jsonl").open("a", encoding="utf-8") as output:
    output.write(json.dumps(args) + "\n")

if args == ["rev-parse", "HEAD"]:
    print("1" * 40)
elif args == ["rev-parse", "--show-toplevel"]:
    print(os.environ["BOB_TEST_REPO"])
elif args == ["diff-tree", "--no-commit-id", "--name-only", "-r", "1" * 40]:
    print("src/committed.ts")
elif args == ["show", "1" * 40, "--", os.environ["BOB_TEST_REPO"] + "/src/committed.ts"]:
    print("+synthetic change")
elif len(args) == 8 and args[:6] == ["notes", "--ref", "refs/notes/bob", "add", "-f", "-F"] and args[7] == "1" * 40:
    temporary_prefix = os.environ["BOB_TEST_REPO"].removesuffix("/repo") + "/tmp/"
    if not args[6].startswith(temporary_prefix):
        raise SystemExit("stub Git 拒絕讀取暫存目錄外的 payload")
    payload = (Path(os.environ["BOB_TEST_TEMP"]) / args[6][len(temporary_prefix):]).resolve()
    if not payload.is_relative_to(Path(os.environ["BOB_TEST_TEMP"]).resolve()):
        raise SystemExit("stub Git 拒絕讀取暫存目錄外的 payload")
    (state / "attached.jsonl").write_bytes(payload.read_bytes())
else:
    with (state / "denied.jsonl").open("a", encoding="utf-8") as output:
        output.write(json.dumps(args) + "\n")
    raise SystemExit(97)
'''


class Skipped(RuntimeError):
    pass


def local_file(path):
    path = Path(os.path.abspath(path))
    if not path.is_relative_to(ROOT):
        raise Skipped("hook 位於 workspace 外；不跟隨或執行")
    component = ROOT
    for part in ("", *path.relative_to(ROOT).parts):
        if part:
            component = component / part
        try:
            stat = component.lstat()
        except FileNotFoundError as error:
            raise Skipped("缺少本機 hook；不代表安全驗證通過") from error
        if component.is_symlink() or getattr(stat, "st_file_attributes", 0) & 0x400:
            raise Skipped("hook 路徑包含 symlink／junction；不跟隨")
    return path


def effective_hook():
    result = subprocess.run(
        ["git", "rev-parse", "--path-format=absolute", "--git-path", "hooks/post-commit"],
        cwd=ROOT,
        capture_output=True,
        text=True,
        check=False,
    )
    if result.returncode:
        raise Skipped("無法以唯讀 Git 查詢定位有效 hook")
    return local_file(result.stdout.strip())


def run_bash(bash, arguments, **kwargs):
    kwargs.setdefault(
        "env",
        {
            key: os.environ[key]
            for key in ("PATH", "SystemRoot", "WINDIR", "TEMP", "TMP", "TMPDIR")
            if key in os.environ
        },
    )
    return subprocess.run(
        [bash, "--noprofile", "--norc", *arguments],
        capture_output=True,
        text=True,
        encoding="utf-8",
        timeout=30,
        check=False,
        **kwargs,
    )


def write_executable(path, content):
    path.write_text(content, encoding="utf-8", newline="\n")
    path.chmod(0o700)


def exercise(bash, tools, source, pending_state, opt_in):
    with TemporaryDirectory(prefix="bob-hook-offline-") as temporary:
        fixture = Path(temporary)
        repo = fixture / "repo"
        repo.mkdir()
        (fixture / "bin").mkdir()
        (fixture / "tmp").mkdir()
        (fixture / "state").mkdir()
        pending = repo / ".bob/notes/pending-notes.txt"
        pending.parent.mkdir(parents=True)
        copied_hook = fixture / "post-commit"
        copied_hook.write_text(source, encoding="utf-8", newline="\n")
        stub = fixture / "git-stub.py"
        stub.write_text(GIT_STUB, encoding="utf-8", newline="\n")
        position = run_bash(
            bash,
            ["-c", 'cd -- "$1" && printf "%s" "$PWD"', "offline-test", fixture.as_posix()],
        )
        if position.returncode:
            raise RuntimeError("無法取得合成目錄的 Bash 路徑")
        posix = position.stdout
        synthetic_repo = f"{posix}/repo"
        matching = json.dumps(
            {"path": f"{synthetic_repo}/src/committed.ts", "bobDiff": "", "synthetic": True},
            separators=(",", ":"),
        ) + "\n"
        other = json.dumps(
            {"path": f"{synthetic_repo}/src/not-committed.ts", "bobDiff": "", "synthetic": True},
            separators=(",", ":"),
        ) + "\n"
        if pending_state != "missing":
            pending.write_text(
                {"empty": "", "unmatched": other, "matching": matching + other}[pending_state],
                encoding="utf-8",
                newline="\n",
            )
        write_executable(
            fixture / "bin/git",
            '#!/bin/bash\nexport MSYS2_ENV_CONV_EXCL=BOB_TEST_REPO\n'
            'export MSYS2_ARG_CONV_EXCL="*"\n'
            'exec "$BOB_TEST_PYTHON" -I "$BOB_TEST_STUB" "$@"\n',
        )
        write_executable(fixture / "bin/timeout", '#!/bin/bash\nshift\nexec "$@"\n')
        for name, executable in tools.items():
            write_executable(
                fixture / f"bin/{name}", f'#!/bin/bash\nexec {shlex.quote(executable)} "$@"\n'
            )
        # PATH 僅含 stub 與明列的文字／暫存檔工具；無真 Git 或網路工具可供查找。
        environment = {key: os.environ[key] for key in ("SystemRoot", "WINDIR") if key in os.environ}
        environment.update(
            PATH=f"{posix}/bin",
            HOME=synthetic_repo,
            TMPDIR=f"{posix}/tmp",
            TMP=f"{posix}/tmp",
            TEMP=f"{posix}/tmp",
            BOB_TEST_STATE=(fixture / "state").as_posix(),
            BOB_TEST_REPO=synthetic_repo,
            BOB_TEST_TEMP=(fixture / "tmp").as_posix(),
            BOB_TEST_PYTHON=Path(sys.executable).as_posix(),
            BOB_TEST_STUB=stub.as_posix(),
        )
        if opt_in is not None:
            environment["BOB_NOTES_REMOTE_SYNC"] = opt_in
        result = run_bash(bash, [copied_hook.as_posix()], cwd=repo, env=environment)
        if result.returncode or result.stderr:
            raise AssertionError("hook 副本執行失敗；未呼叫真 Git")
        denied = fixture / "state/denied.jsonl"
        attached = fixture / "state/attached.jsonl"
        calls = [
            json.loads(line)
            for line in (fixture / "state/calls.jsonl").read_text(encoding="utf-8").splitlines()
        ]
        if pending_state == "missing":
            assert not pending.exists(), "不應建立原本不存在的 pending"
        else:
            expected_pending = "" if pending_state == "empty" else other
            actual_pending = pending.read_text(encoding="utf-8")
            assert actual_pending == expected_pending, (
                f"未提交的合成 notes 應原樣保留：{actual_pending!r} != {expected_pending!r}"
            )
        if pending_state == "matching":
            assert attached.read_text(encoding="utf-8") == matching, "本機 notes 應保留完整合成 JSONL"
            assert sum(call[:1] == ["notes"] for call in calls) == 1
        else:
            assert not attached.exists(), "沒有 matching 時不應附加 notes"
        return denied.exists()


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--hook", type=Path, help="指定 workspace 內待測的本機 hook；預設查詢有效路徑")
    args = parser.parse_args()
    hook = local_file(args.hook) if args.hook else effective_hook()
    source = hook.read_text(encoding="utf-8")
    function = re.search(r"(?ms)^sync_notes_with_remote\(\) \{\n(.*?)^\}", source)
    if not function:
        raise AssertionError("找不到待驗證的同步函式；請重新稽核安裝版本")
    executable_lines = [
        line.strip()
        for line in function[1].splitlines()
        if line.strip() and not line.lstrip().startswith("#")
    ]
    assert executable_lines[:3] == [GATE.splitlines()[0], "return 0", "fi"], (
        "opt-in gate 必須是同步函式的第一個可執行敘述"
    )
    assert hashlib.sha256(source.encode("utf-8")).hexdigest() == AUDITED_HOOK_SHA256, (
        "hook 與已人工稽核的版本不同；請先重查內容，不執行未知副本"
    )
    bash = shutil.which("bash")
    if not bash:
        raise Skipped("缺少 Bash；不安裝工具，未驗證安全性")
    discovery = run_bash(
        bash, ["-c", 'for tool in "$@"; do command -v "$tool" || exit 1; done', "tools", *UTILITIES]
    )
    if discovery.returncode:
        raise Skipped("缺少 hook 所需的文字／暫存檔工具")
    tools = dict(zip(UTILITIES, discovery.stdout.splitlines(), strict=True))
    with TemporaryDirectory(prefix="bob-hook-syntax-") as temporary:
        copy = Path(temporary) / "post-commit"
        copy.write_text(source, encoding="utf-8", newline="\n")
        assert run_bash(bash, ["-n", copy.as_posix()]).returncode == 0, "hook 副本語法錯誤"
    for pending_state in ("missing", "empty", "unmatched", "matching"):
        for opt_in in (None, "0"):
            assert not exercise(bash, tools, source, pending_state, opt_in), (
                "未 opt-in 時發生 remote discovery 或未允許的 Git 呼叫"
            )
            print(f"PASS pending={pending_state}, opt-in={'unset' if opt_in is None else opt_in}")
    # 只在合成環境設為 1，remote discovery 仍只能進入拒絕所有遠端呼叫的 stub。
    assert exercise(bash, tools, source, "matching", "1"), "明確 opt-in 未進入既有同步流程"
    print("PASS 合成 opt-in=1 僅到達 stub 的 remote discovery 拒絕點")
    # 在合成副本移除 gate，確認測試真的會抓到既有 remote discovery 行為。
    mutation = source.replace(GATE, ":", 1)
    assert mutation != source
    assert exercise(bash, tools, mutation, "matching", None), "測試未偵測到移除 gate 的回歸"
    print("PASS 8/8 預設拒絕案例；本機 notes／pending 保留；2/2 正反探針；真 remote commands=0")
    return 0


if __name__ == "__main__":
    try:
        sys.exit(main())
    except Skipped as error:
        print(f"SKIP：{error}（skip 不算安全通過）")
        sys.exit(2)
    except (AssertionError, OSError, RuntimeError, subprocess.SubprocessError) as error:
        print(f"FAIL：{error}", file=sys.stderr)
        sys.exit(1)

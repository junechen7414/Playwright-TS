#### 步驟 1：專案初始化

首先，建立一個新的專案資料夾並初始化一個 Node.js 專案。

1.  **建立專案目錄：**
    開啟終端機，並執行以下指令來為專案建立一個新資料夾並進入該資料夾：

    ```bash
    mkdir my-playwright-project
    cd my-playwright-project
    ```

2.  **初始化 npm 專案：**
    此指令將建立一個預設的 `package.json` 檔案，管理專案依賴套件。

    ```bash
    npm init -y
    ```

3.  **設定 ES 模組支援：**
    為利用現代 JavaScript 模組語法 (ES 模組)，可在 `package.json` 檔案中加入一行特定的設定。在 `package.json` 中加入以下這行：

    ```json
    "type": "module"
    ```

---

## 步驟 2：安裝核心依賴套件

接下來，安裝 Playwright、TypeScript。

```bash
npm install --save-dev \
  playwright \
  typescript 
```

加入專案的話:
根據 package.json 安裝所有必要的 Node.js 套件（dependencies），包括 @playwright/test 和 TypeScript 相關的套件。

---

## 步驟3: 安裝playwright 擴充工具，並安裝playwright browser等
第一次建立專案執行以下指令，會有互動式指令介面詢問，依序設定要安裝哪些套件:
```bash
npm init playwright@latest
```

若是加入專案的話執行以下指令來安裝瀏覽器，加上參數可以選擇安裝的瀏覽器如firefox,chromium:
```bash
npx playwright install
```

## 步驟4: 設定 TypeScript

設定 TypeScript 以正確編譯測試檔案。

1.  **產生 TypeScript 設定檔：**
    執行此指令以在專案根目錄中建立一個 `tsconfig.json` 檔案。此檔案將包含所有的 TypeScript 編譯器設定。

    ```bash
    npx tsc --init
    ```

2.  **更新 `tsconfig.json`：**
    可將新建立的 `tsconfig.json` 內容替換為以下設定。此設定啟用了嚴格的型別檢查，並包含了 Playwright和Node.js 的型別定義。

    ```json
    {
      "compilerOptions": {
        "module": "nodenext",
        "target": "es2022",
        "lib": ["es2022", "dom"],
        "types": ["playwright/test", "node"],
        "esModuleInterop": true,
        "strict": true,
        "forceConsistentCasingInFileNames": true,
        "skipLibCheck": true
      },
      "include": ["**/*.ts"]
    }
    ```

---
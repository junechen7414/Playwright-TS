# 專案概述

> 本文件說明專案的核心技術棧與架構原則

## 專案簡介

這是一個使用 **Playwright + TypeScript** 開發的 E2E 自動化測試專案，採用 **Business-Layer Page Object Model** 架構模式。專案整合了 Docker Compose 進行環境管理，並支援 CI/CD 自動化測試流程。

## 核心技術棧

- **測試框架**: Playwright v1.57.0
- **程式語言**: TypeScript (ES Modules)
- **套件管理**: pnpm
- **容器管理**: Podman/Docker Compose
- **CI/CD**: GitHub Actions
- **測試目標**: 
  - UI 測試 (SauceDemo)
  - API 測試 (Spring Boot + Oracle DB)

## 專案架構原則

本專案遵循 **Business-Layer Page-Object Pattern**，核心理念是：
- 測試腳本應該讀起來像商業流程，而非技術操作
- 封裝低階操作細節（Locators、Clicks）
- 使用語意化的方法名稱
- 讓非技術人員也能理解測試內容

## 相關文件

- [環境準備](./02-environment-setup.md)
- [快速開始](./03-quick-start.md)
- [架構設計](./07-architecture-overview.md)
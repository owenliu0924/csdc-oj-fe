---
name: mock-oj-problem
description: 學習如何在 csdc-oj-fe 前端專案中新增或模擬測試題目，以利進行畫面與 Markdown 渲染測試。
---

# 如何在 csdc-oj-fe 中新增/模擬測試題目

在進行前端 UI 測試（特別是 Markdown 與 LaTeX 數學公式渲染）時，可依據後端伺服器的狀態選擇以下兩種方式：

## 方法一：後端未開啟時（純前端 Mock）
如果 `127.0.0.1:8080` 後端未啟動，可以透過修改前端元件來強行注入假資料：
1. 目標檔案：`src/components/oj/problem-detail.tsx`
2. 修改位置：在 `loadProblem` 函式的最前方攔截特定的 `problemID`（例如 `test-math`）。
3. 程式碼範例：
   ```tsx
   if (problemID === "test-math") {
     setProblem({
       id: 9999,
       _id: "test-math",
       title: "測試 Markdown 與 LaTeX 數學公式",
       description: "您的測試 Markdown 內容...",
       // 補齊其他必要欄位...
     } as any);
     setLoading(false);
     return;
   }
   ```
4. 測試方式：瀏覽器直接存取 `http://localhost:3000/problem/test-math`。

## 方法二：後端已開啟時（API 自動化腳本）
如果後端正常運作，可以在專案根目錄下建立一個 Node.js 腳本（例如 `scratch/add-problem.mjs`）透過 API 自動新增題目：
1. 透過 `POST http://localhost:3000/api/login` 登入（預設帳密 `root` / `rootroot`），並獲取 `set-cookie` 與 `X-CSRFToken`。
2. 帶著 Cookie 與 CSRF Token，發送 `POST http://localhost:3000/api/admin/problem` 建立題目。
3. 問題描述 (`description`) 可放入含有 HTML 與 `$$math$$` 的測試字串。

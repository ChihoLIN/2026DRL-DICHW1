# 強化學習網格地圖 (Reinforcement Learning Grid Map - HW1)

這是一個基於 Flask 框架開發的現代化互動式網頁應用程式，用於視覺化與實作強化學習的**策略評估 (Policy Evaluation)** 以及 **價值迭代 (Value Iteration)** 演算法。

## 🌐 Demo 網址

> **Repository 網址:** [https://github.com/ChihoLIN/2026DRL-DICHW1](https://github.com/ChihoLIN/2026DRL-DICHW1)
> 
> **Demo 網址:** [http://localhost:8000/](http://localhost:8000/)

---

## 🌟 作業功能展示 (Features)

### HW1-1: 動態網格地圖開發
* 提供輸入介面允許設定網格大小 $N$ (範圍為 5 ~ 9)，生成對應的 $N \times N$ 地圖。
* 提供循序漸進的互動設定：
  1. 點擊生成**起點** (綠色標示)。
  2. 點擊生成**終點** (紅色標示)。
  3. 點擊生成 $N-2$ 個**障礙物** (灰色標示)。

### HW1-2: 策略預估與價值顯示 (Policy Evaluation)
* 自動為地圖中尚未設定的狀態隨機產生策略動作 (上、下、左、右箭頭)。
* 運用 Policy Evaluation 策略評估，計算並顯示每一個網格的期望價值 $V(s)$。

### HW1-3: 最佳策略與路徑推導 (Value Iteration)
* 採用 Value Iteration 價值迭代演算法，計算整個 MDP 的最佳策略與最佳價值函數。
* 自動更新所有的箭頭方向以取代隨機動作，並同步顯示每一個單元格的最優期望回報。
* **彩蛋功能**：在地圖上自動高亮標示從起點抵達終點的「最佳路徑」。

---

## 🚀 快速開始 (Quick Start)

### 1. 安裝套件
請確保您的環境裝有 Python 3。接著安裝必要的 Flask 套件：
```bash
pip install flask
```

### 2. 啟動伺服器
進入專案資料夾並執行應用程式：
```bash
python app.py
```

### 3. 開啟網頁
伺服器啟動後，請於瀏覽器中開啟以下網址：
```
http://localhost:8000/
```

---

## 📁 檔案結構
* `app.py`: Flask 後端伺服器 (包含 Policy Evaluation / Value Iteration 演算法的實作)
* `templates/index.html`: 前端使用者介面
* `static/style.css`: 現代網頁樣式與配色 (Dark Mode)
* `static/main.js`: 處理網頁按鈕點擊、動態更新地圖與呼叫 API 等邏輯

## 👤 作者
* **GitHub:** [ChihoLIN](https://github.com/ChihoLIN)
* **Email:** aaa911016@gmail.com

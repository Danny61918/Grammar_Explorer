
# 📚 Grammar Explorer - Fun English Learning
# 📚 語法探險家 - 趣味英文學習

An interactive English grammar learning web application designed for children to bridge the gap between school homework and fun practice.
這是一款專為兒童設計的互動式英文語法學習網頁應用，旨在將枯燥的學校作業轉化為有趣的探險練習。

---

## 🌟 Key Features / 主要特色

### 🧒 Learner Mode (學生模式)
- **Interactive Quizzes**: Multiple choice and spelling challenges with immediate feedback.
  **互動測驗**：包含選擇題與拼寫挑戰，並提供即時反饋。
- **Mix All Challenge**: A "Mix All" button to randomly pull questions from all topics for a comprehensive review.
  **隨機挑戰**：一鍵開啟「全部隨機」模式，從所有主題中抽取題目進行全面複習。
- **Kid-Friendly UI**: Vibrant colors, playful fonts, and smooth animations to keep children engaged.
  **兒童友善介面**：使用活潑的色彩、可愛的字體與流暢的動畫，提升學習動機。

### 👨‍👩‍👧 Parent Mode (家長模式)
- **Learning Dashboard**: Track progress with visual charts showing accuracy by topic and total practice counts.
  **學習儀表板**：透過視覺化圖表追蹤各主題的正確率與總練習量。
- **Question Bank Manager**: Manually add, edit, or delete questions used in the learner mode.
  **題庫管理**：手動新增、編輯或刪除測驗題目。
- **Magic Scan ✨**: Use Gemini AI to scan photos of worksheets and instantly digitize them into the question bank.
  **魔法掃描 ✨**：利用 Gemini AI 技術將考卷照片自動辨識並轉換為數位題庫。
- **Google Sheets Sync**: Connect to your personal Google Sheet to manage questions remotely.
  **雲端同步**：連結 Google 試算表，實現跨裝置的題庫管理。

---

## 🛠️ Technical Stack / 技術架構

- **Frontend**: React 19, TypeScript, Tailwind CSS.
- **Charts**: Recharts for progress visualization.
- **AI Engine**: Google Gemini API (gemini-3-flash-preview) for OCR, question analysis, and content generation.
- **Build Tool**: Vite.

---

## 🚀 How to Use / 如何使用

1. **Set Up API Key**: 
   - Go to Parent Mode > Cloud Sync Settings.
   - Enter your personal API Key and Google Spreadsheet ID for full functionality.
   **設定金鑰**：進入家長模式 > 雲端同步設定，輸入您的 API Key 以啟用完整 AI 與同步功能。

2. **Manage Content**:
   - Use the "Magic Scan" to import school homework or sync from a shared spreadsheet.
   **內容管理**：使用「魔法掃描」匯入作業，或從試算表同步題目。

3. **Start Learning**:
   - Switch back to Learner Mode and click "Start Now" to begin an adventure!
   **開始學習**：切換回學生模式，點擊「現在開始」即可啟動測驗！

---

## 🔒 Privacy & Data / 隱私與資料

- All question bank data and user records are stored locally in your browser's `localStorage`.
- API keys and sync settings are strictly kept on your device.
- 所有題庫資料與練習紀錄皆儲存在您瀏覽器的本地空間（localStorage）。
- API 金鑰與設定資訊僅保留在您的裝置中，確保隱私安全。

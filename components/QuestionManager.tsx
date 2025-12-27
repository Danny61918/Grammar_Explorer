
import React, { useState, useRef, useEffect } from 'react';
import { Question, QuestionType } from '../types';
import { Language, translations } from '../translations';
import { extractQuestionsFromImage, analyzeQuestion } from '../services/geminiService';

interface QuestionManagerProps {
  questions: Question[];
  onAdd: (q: Question) => void;
  onUpdate: (q: Question) => void;
  onImport: (qs: Question[]) => void;
  onDelete: (id: string) => void;
  lang: Language;
}

const QuestionManager: React.FC<QuestionManagerProps> = ({ questions, onAdd, onUpdate, onImport, onDelete, lang }) => {
  const t = translations[lang];
  const [importText, setImportText] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showMagicScan, setShowMagicScan] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isOcrLoading, setIsOcrLoading] = useState(false);
  const [ocrResults, setOcrResults] = useState<Question[]>([]);
  const formRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [cloudSettings, setCloudSettings] = useState(() => {
    const saved = localStorage.getItem('ge_cloud_settings');
    return saved ? JSON.parse(saved) : { apiKey: '', sheetId: '', range: 'Sheet1!A2:F' };
  });

  useEffect(() => {
    localStorage.setItem('ge_cloud_settings', JSON.stringify(cloudSettings));
  }, [cloudSettings]);

  const [newQ, setNewQ] = useState<Partial<Question>>({
    question: '',
    type: 'MCQ',
    category: 'General',
    answer: '',
    explanation: '',
    options: [],
    original_text: ''
  });

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setNewQ({ question: '', type: 'MCQ', category: 'General', options: [] });
  };

  const handleManualSave = () => {
    if (newQ.question && newQ.answer) {
      const qData: Question = {
        ...newQ as Question,
        id: editingId || 'user_' + Date.now(),
        options: newQ.type === 'MCQ' ? (newQ.options || []) : null
      };
      if (editingId) onUpdate(qData);
      else onAdd(qData);
      resetForm();
    }
  };

  const syncFromSheets = async () => {
    if (!cloudSettings.apiKey || !cloudSettings.sheetId) {
      alert(lang === 'ZH' ? "請輸入 API Key 與 Spreadsheet ID" : "Please input API Key and Sheet ID");
      return;
    }

    setIsSyncing(true);
    try {
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${cloudSettings.sheetId}/values/${encodeURIComponent(cloudSettings.range)}?key=${cloudSettings.apiKey}`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.error) {
        let errorMsg = data.error.message;
        if (data.error.status === "PERMISSION_DENIED") {
          errorMsg = lang === 'ZH' ? "存取被拒。請確保試算表已設為『知道連結的任何人都可以檢視』，且 API Key 正確。" : "Permission Denied. Ensure the sheet is shared as 'Anyone with the link can view'.";
        } else if (data.error.status === "NOT_FOUND") {
          errorMsg = lang === 'ZH' ? "找不到試算表或分頁範圍。請檢查 Spreadsheet ID 與範圍名稱（如 Sheet1）。" : "Sheet or Range not found. Check Spreadsheet ID and Range name.";
        }
        throw new Error(errorMsg);
      }

      if (data.values && data.values.length > 0) {
        const cloudQuestions: Question[] = data.values.map((row: any[], index: number) => ({
          id: `cloud_${Date.now()}_${index}`,
          category: row[0] || 'Uncategorized',
          type: row[1] || 'MCQ',
          question: row[2] || '',
          options: row[3] ? row[3].split(',').map((s: string) => s.trim()) : null,
          answer: row[4] || '',
          explanation: row[5] || ''
        })).filter((q: Question) => q.question && q.answer);

        if (cloudQuestions.length > 0) {
          onImport(cloudQuestions);
          alert(`${t.syncSuccess} (${cloudQuestions.length} questions)`);
        } else {
          alert(lang === 'ZH' ? "找到資料但沒有有效的題目內容（請檢查 C 欄與 E 欄）。" : "No valid questions found in data rows.");
        }
      } else {
        alert(lang === 'ZH' ? "此範圍內沒有任何資料。" : "No data found in this range.");
      }
    } catch (err: any) {
      console.error("Sync Error:", err);
      alert(`${t.syncError}\n${err.message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleMagicScan = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsOcrLoading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64 = event.target?.result as string;
        const results = await extractQuestionsFromImage(base64);
        setOcrResults(results);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      alert(t.ocrError);
    } finally {
      setIsOcrLoading(false);
    }
  };

  const copyToClipboardAsCsv = () => {
    if (questions.length === 0) return;
    const rows = questions.map(q => [
      q.category,
      q.type,
      q.question,
      q.options ? q.options.join(', ') : '',
      q.answer,
      q.explanation || ''
    ].map(field => `"${String(field).replace(/"/g, '""')}"`).join('\t'));
    navigator.clipboard.writeText(rows.join('\n'));
    alert(lang === 'ZH' ? "已複製為表格格式！" : "Copied as table format!");
  };

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8">
      <div className="flex flex-wrap gap-4 justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 kid-font">{t.manageBank}</h2>
          <p className="text-slate-500 text-sm">先使用魔法掃描獲取題目，校對後複製到 Google Sheets 維護。</p>
        </div>
        <div className="flex space-x-3">
          <button onClick={() => setShowMagicScan(true)} className="bg-purple-600 text-white px-5 py-2.5 rounded-xl hover:bg-purple-700 font-bold shadow-lg flex items-center transition-all active:scale-95">
            <span className="mr-2">✨</span> {t.magicScan}
          </button>
          <button onClick={() => { setShowForm(true); setEditingId(null); }} className="bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 font-bold shadow-lg transition-all active:scale-95">
            + {t.addQuestion}
          </button>
        </div>
      </div>

      {/* 雲端同步卡片 */}
      <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border-t-8 border-green-500 mb-10">
        <div className="flex items-center mb-6">
           <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3 text-xl">☁️</div>
           <h3 className="text-xl font-bold text-slate-800">{t.cloudSync}</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
           <div className="space-y-2">
             <label className="text-xs font-black text-slate-400 uppercase tracking-widest">{t.googleSheetsApi}</label>
             <input 
               type="password" 
               className="w-full p-3 bg-slate-50 border-2 border-transparent focus:border-green-400 rounded-xl outline-none transition-all" 
               placeholder="API Key" 
               value={cloudSettings.apiKey}
               onChange={e => setCloudSettings({...cloudSettings, apiKey: e.target.value})}
             />
           </div>
           <div className="space-y-2">
             <label className="text-xs font-black text-slate-400 uppercase tracking-widest">{t.spreadsheetId}</label>
             <input 
               type="text" 
               className="w-full p-3 bg-slate-50 border-2 border-transparent focus:border-green-400 rounded-xl outline-none transition-all" 
               placeholder="試算表 ID" 
               value={cloudSettings.sheetId}
               onChange={e => setCloudSettings({...cloudSettings, sheetId: e.target.value})}
             />
           </div>
           <div className="space-y-2">
             <label className="text-xs font-black text-slate-400 uppercase tracking-widest">{t.sheetRange}</label>
             <input 
               type="text" 
               className="w-full p-3 bg-slate-50 border-2 border-transparent focus:border-green-400 rounded-xl outline-none transition-all" 
               placeholder="Sheet1!A2:F" 
               value={cloudSettings.range}
               onChange={e => setCloudSettings({...cloudSettings, range: e.target.value})}
             />
           </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <button 
            disabled={isSyncing}
            onClick={syncFromSheets} 
            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-black py-4 rounded-2xl transition-all shadow-lg active:scale-95 disabled:opacity-50"
          >
            {isSyncing ? 'Syncing...' : t.syncNow}
          </button>
          <button 
            onClick={copyToClipboardAsCsv}
            className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black py-4 rounded-2xl transition-all border-2 border-slate-200"
          >
            📋 {t.copyOcrCsv}
          </button>
        </div>
        
        {/* 除錯清單 */}
        <div className="mt-8 p-6 bg-slate-50 rounded-2xl border border-slate-100">
           <p className="text-xs font-bold text-slate-400 uppercase mb-3">排錯檢查清單 (Troubleshooting):</p>
           <ul className="text-xs text-slate-600 space-y-2 list-disc ml-4">
             <li>試算表需設定為「知道連結的任何人都可以檢視」。</li>
             <li>必須在 Google Cloud 啟用 「Google Sheets API」。</li>
             <li>分頁名稱必須正確（例如：<code className="bg-white px-1 font-bold">工作表1!A2:F</code>）。</li>
             <li>欄位順序：A分類, B類型, C題目, D選項, E答案, F解析。</li>
           </ul>
        </div>
      </div>

      {/* 其他 UI 保持不變... */}
      {showMagicScan && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            <div className="p-8 border-b flex justify-between items-center">
              <h3 className="text-2xl font-bold text-slate-800 kid-font">{t.magicScan}</h3>
              <button onClick={() => { setShowMagicScan(false); setOcrResults([]); }} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <div className="p-8 overflow-y-auto custom-scrollbar flex-1">
              {!isOcrLoading && ocrResults.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-6xl mb-6">📸</div>
                  <p className="text-slate-500 mb-8">{t.scanDesc}</p>
                  <button onClick={() => fileInputRef.current?.click()} className="bg-purple-600 text-white px-8 py-4 rounded-2xl font-black text-lg shadow-xl hover:bg-purple-700 transition-all">
                    {t.uploadPhoto}
                  </button>
                  <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleMagicScan} />
                </div>
              )}
              {isOcrLoading && (
                <div className="text-center py-20">
                  <div className="animate-spin text-5xl mb-6 inline-block">✨</div>
                  <p className="text-xl font-bold text-purple-600">{t.readingImage}</p>
                </div>
              )}
              {ocrResults.length > 0 && (
                <div className="space-y-4">
                  <h4 className="font-bold text-slate-700 mb-4">{t.foundQuestions} ({ocrResults.length})</h4>
                  {ocrResults.map((q, idx) => (
                    <div key={idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-sm">
                      <p className="font-bold mb-1">{q.question}</p>
                      <p className="text-green-600 text-xs font-bold">Ans: {q.answer}</p>
                    </div>
                  ))}
                  <button onClick={() => { onImport(ocrResults); setShowMagicScan(false); setOcrResults([]); }} className="w-full bg-green-600 text-white py-4 rounded-2xl font-black mt-6 shadow-lg hover:bg-green-700 transition-all">
                    {t.importSelected}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showForm && (
        <div ref={formRef} className="bg-white p-10 rounded-[2.5rem] shadow-2xl border-4 border-slate-50 mb-10 animate-fade-in">
          <div className="flex justify-between items-start mb-8">
            <h3 className="text-2xl font-bold text-slate-800 kid-font">{editingId ? t.editQuestion : t.addQuestion}</h3>
            <div className="flex space-x-2">
              <button disabled={isAnalyzing} onClick={async () => {
                if (!newQ.question) return;
                setIsAnalyzing(true);
                const result = await analyzeQuestion(newQ.question);
                setNewQ(prev => ({...prev, ...result}));
                setIsAnalyzing(false);
              }} className="bg-yellow-100 text-yellow-700 px-5 py-2.5 rounded-xl font-bold hover:bg-yellow-200 transition-all">
                {isAnalyzing ? 'Analyzing...' : t.aiAssist}
              </button>
              <button onClick={resetForm} className="text-slate-400 hover:text-slate-600 p-2">✕</button>
            </div>
          </div>
          <div className="space-y-6">
            <textarea className="w-full p-5 bg-slate-50 border-2 border-transparent focus:border-blue-400 rounded-3xl outline-none transition-all text-lg font-bold" rows={2} value={newQ.question || ''} onChange={e => setNewQ({...newQ, question: e.target.value})} placeholder="輸入題目內容..." />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <input className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-blue-400 rounded-2xl outline-none" placeholder="正確答案" value={newQ.answer || ''} onChange={e => setNewQ({...newQ, answer: e.target.value})} />
              <input className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-blue-400 rounded-2xl outline-none" placeholder="分類 (例如 Grammar)" value={newQ.category || ''} onChange={e => setNewQ({...newQ, category: e.target.value})} />
            </div>
            <button onClick={handleManualSave} className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black shadow-xl hover:bg-blue-700 transition-all active:scale-95 text-xl">
              {editingId ? t.updateQuestion : t.saveToDb}
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-50 overflow-hidden">
        <div className="px-10 py-8 bg-slate-50/50 border-b border-slate-100 flex justify-between items-center">
          <h3 className="font-black text-xl text-slate-800 kid-font">已辨識/儲存的題目 ({questions.length})</h3>
          <button onClick={() => onDelete('all')} className="text-red-400 text-xs hover:underline">清空暫存題庫</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50/50">
              <tr>
                <th className="px-10 py-5 text-left text-xs font-black text-slate-400 uppercase tracking-widest">分類</th>
                <th className="px-10 py-5 text-left text-xs font-black text-slate-400 uppercase tracking-widest">題目</th>
                <th className="px-10 py-5 text-right text-xs font-black text-slate-400 uppercase tracking-widest">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {questions.map(q => (
                <tr key={q.id} className="hover:bg-slate-50/80 transition-all">
                  <td className="px-10 py-6"><span className="text-xs font-black text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full">{q.category}</span></td>
                  <td className="px-10 py-6"><p className="text-sm text-slate-700 font-bold truncate max-w-sm">{q.question}</p></td>
                  <td className="px-10 py-6 text-right space-x-4">
                    <button onClick={() => { setNewQ(q); setEditingId(q.id); setShowForm(true); }} className="text-blue-600 hover:text-blue-800 font-black text-sm">編輯</button>
                    <button onClick={() => onDelete(q.id)} className="text-red-400 hover:text-red-600 font-black text-sm">刪除</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default QuestionManager;

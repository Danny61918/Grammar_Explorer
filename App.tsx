
import React, { useState, useEffect, useMemo } from 'react';
import { Question, UserRecord, AppMode, QuizMode } from './types';
import { INITIAL_QUESTIONS } from './constants';
import { Language, translations } from './translations';
import Quiz from './components/Quiz';
import ParentDashboard from './components/ParentDashboard';
import QuestionManager from './components/QuestionManager';

const App: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>(() => {
    const saved = localStorage.getItem('ge_questions');
    return saved ? JSON.parse(saved) : INITIAL_QUESTIONS;
  });

  const [records, setRecords] = useState<UserRecord[]>(() => {
    const saved = localStorage.getItem('ge_records');
    return saved ? JSON.parse(saved) : [];
  });

  const [lang, setLang] = useState<Language>(() => {
    const saved = localStorage.getItem('ge_lang');
    return (saved as Language) || 'ZH';
  });

  const t = translations[lang];
  const [appMode, setAppMode] = useState<AppMode>(AppMode.LEARNER);
  const [activeQuiz, setActiveQuiz] = useState<{
    mode: QuizMode;
    questions: Question[];
  } | null>(null);
  
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  const dynamicCategories = useMemo(() => {
    const counts: Record<string, number> = {};
    questions.forEach(q => {
      const cat = q.category || 'General';
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return Object.entries(counts).sort(([a], [b]) => a.localeCompare(b));
  }, [questions]);

  useEffect(() => {
    if (dynamicCategories.length > 0 && !selectedCategory) {
      setSelectedCategory(dynamicCategories[0][0]);
    }
  }, [dynamicCategories]);

  useEffect(() => {
    localStorage.setItem('ge_questions', JSON.stringify(questions));
  }, [questions]);

  useEffect(() => {
    localStorage.setItem('ge_records', JSON.stringify(records));
  }, [records]);

  useEffect(() => {
    localStorage.setItem('ge_lang', lang);
  }, [lang]);

  const toggleLang = () => setLang(prev => prev === 'EN' ? 'ZH' : 'EN');

  const startBasicQuiz = () => {
    const filtered = questions.filter(q => q.category === selectedCategory);
    if (filtered.length === 0) {
      alert(lang === 'ZH' ? "此分類沒有題目！" : "No questions in this category!");
      return;
    }
    setActiveQuiz({
      mode: QuizMode.BASIC,
      questions: [...filtered].sort(() => Math.random() - 0.5).slice(0, 10)
    });
  };

  const handleDeleteQuestion = (id: string) => {
    if (id === 'all') {
      if (window.confirm(lang === 'ZH' ? "確定要清空所有題目嗎？" : "Clear all questions?")) {
        setQuestions([]);
      }
    } else {
      setQuestions(questions.filter(q => q.id !== id));
    }
  };

  if (activeQuiz) {
    return (
      <Quiz 
        questions={activeQuiz.questions} 
        onComplete={(newRecords) => setRecords(prev => [...prev, ...newRecords])}
        onExit={() => setActiveQuiz(null)}
        lang={lang}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <header className="bg-white/80 backdrop-blur-md border-b sticky top-0 z-50 px-6 py-4 flex flex-wrap gap-4 justify-between items-center shadow-sm">
        <h1 className="text-2xl font-bold text-blue-600 kid-font flex items-center">
          <span className="mr-3 text-3xl">📚</span> {t.appName}
        </h1>
        <div className="flex items-center space-x-4">
          <button onClick={toggleLang} className="text-xs font-bold px-4 py-2 bg-slate-100 rounded-xl text-slate-600">{t.langSwitch}</button>
          <div className="flex bg-slate-100 p-1.5 rounded-2xl">
            <button onClick={() => setAppMode(AppMode.LEARNER)} className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${appMode === AppMode.LEARNER ? 'bg-blue-600 text-white' : 'text-slate-500'}`}>{t.learnerMode}</button>
            <button onClick={() => setAppMode(AppMode.PARENT)} className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${appMode === AppMode.PARENT ? 'bg-blue-600 text-white' : 'text-slate-500'}`}>{t.parentMode}</button>
          </div>
        </div>
      </header>

      {appMode === AppMode.LEARNER ? (
        <main className="max-w-4xl mx-auto px-6 py-12">
          <div className="text-center mb-12">
            <h2 className="text-5xl font-bold text-slate-800 kid-font mb-6">{t.readyAdventure}</h2>
            <p className="text-slate-500 text-xl font-medium">{t.pickTopic}</p>
          </div>
          
          <div className="bg-white p-8 rounded-[2.5rem] shadow-xl mb-12 border border-blue-50">
            <h3 className="text-xl font-bold mb-6 text-slate-700">{t.step1}</h3>
            <div className="flex flex-wrap gap-3">
              {dynamicCategories.length > 0 ? dynamicCategories.map(([cat, count]) => (
                <button 
                  key={cat} 
                  onClick={() => setSelectedCategory(cat)} 
                  className={`px-6 py-3 rounded-2xl border-2 transition-all font-bold text-sm ${selectedCategory === cat ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-100 text-slate-500 bg-slate-50/50'}`}
                >
                  {cat} ({count})
                </button>
              )) : (
                <p className="text-slate-400 italic">No topics available. Add some in Parent Mode!</p>
              )}
            </div>
          </div>

          <div className="flex justify-center">
            {/* 僅顯示練習模式 */}
            <div 
              className="bg-white p-10 rounded-[3rem] shadow-2xl border-b-[16px] border-green-500 cursor-pointer hover:translate-y-[-10px] transition-all group w-full max-w-xl text-center" 
              onClick={startBasicQuiz}
            >
              <div className="text-7xl mb-8 group-hover:scale-110 transition-transform inline-block">📖</div>
              <h3 className="text-3xl font-bold text-slate-800 mb-4">{t.schoolPractice}</h3>
              <p className="text-slate-500 mb-10 text-lg leading-relaxed">{t.schoolPracticeDesc}</p>
              <button className="w-full bg-green-500 text-white font-black py-5 rounded-3xl text-2xl shadow-xl shadow-green-100 transition-all active:scale-95">
                {t.startNow}
              </button>
            </div>
          </div>
        </main>
      ) : (
        <div className="space-y-16 py-12">
          <ParentDashboard records={records} onReset={() => setRecords([])} lang={lang} />
          <QuestionManager 
            questions={questions} 
            onAdd={q => setQuestions([...questions, q])}
            onUpdate={updated => setQuestions(questions.map(q => q.id === updated.id ? updated : q))}
            onImport={qs => setQuestions(qs)}
            onDelete={handleDeleteQuestion}
            lang={lang}
          />
        </div>
      )}
    </div>
  );
};

export default App;

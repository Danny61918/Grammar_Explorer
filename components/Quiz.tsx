
import React, { useState } from 'react';
import { Question, QuestionType, UserRecord } from '../types';
import { Language, translations } from '../translations';

interface QuizProps {
  questions: Question[];
  onComplete: (records: UserRecord[]) => void;
  onExit: () => void;
  lang: Language;
}

const Quiz: React.FC<QuizProps> = ({ questions, onComplete, onExit, lang }) => {
  const t = translations[lang];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [records, setRecords] = useState<UserRecord[]>([]);
  const [isFinished, setIsFinished] = useState(false);

  const currentQuestion = questions[currentIndex];

  const handleAnswerSubmit = () => {
    if (!selectedAnswer.trim()) return;

    const isCorrect = selectedAnswer.trim().toLowerCase() === currentQuestion.answer.toLowerCase();
    const newRecord: UserRecord = {
      timestamp: Date.now(),
      questionId: currentQuestion.id,
      isCorrect,
      userAnswer: selectedAnswer,
      category: currentQuestion.category
    };

    setRecords([...records, newRecord]);
    setShowFeedback(true);
  };

  const handleNext = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(currentIndex + 1);
      setSelectedAnswer('');
      setShowFeedback(false);
    } else {
      setIsFinished(true);
      onComplete(records);
    }
  };

  if (isFinished) {
    const score = records.filter(r => r.isCorrect).length;
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-white rounded-[2.5rem] shadow-2xl max-w-lg mx-auto mt-20 border-8 border-yellow-100">
        <h2 className="text-5xl font-bold text-blue-600 kid-font mb-4">{t.finished}</h2>
        <div className="text-8xl mb-8 animate-bounce">🏆</div>
        <p className="text-3xl mb-8 text-slate-700">{t.yourScore} <span className="font-black text-green-500">{score}</span> / {questions.length}</p>
        <button onClick={onExit} className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 rounded-3xl font-bold text-xl transition-all shadow-xl active:scale-95">
          {t.goBackHome}
        </button>
      </div>
    );
  }

  const isSpelling = currentQuestion.type === 'spelling_correction';

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-8">
      <div className="mb-6 flex justify-between items-center bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
        <span className="text-blue-600 font-black kid-font text-lg">{t.question} {currentIndex + 1} {t.of} {questions.length}</span>
        <button onClick={onExit} className="text-slate-400 hover:text-red-500 font-bold transition-colors">{t.quit}</button>
      </div>

      <div className="bg-white rounded-[3rem] p-10 shadow-2xl border-4 border-blue-50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-16 -mt-16 opacity-50"></div>
        
        <div className="mb-6 flex flex-wrap gap-2">
          <span className="bg-blue-100 text-blue-700 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider">
            {currentQuestion.category}
          </span>
          {currentQuestion.isAI && <span className="bg-purple-100 text-purple-700 text-xs font-black px-3 py-1 rounded-full uppercase">✨ AI</span>}
          <span className="bg-slate-100 text-slate-500 text-xs font-black px-3 py-1 rounded-full uppercase">
            {currentQuestion.type}
          </span>
        </div>
        
        <h3 className="text-3xl font-bold text-slate-800 mb-10 leading-relaxed kid-font">
          {currentQuestion.question}
        </h3>

        <div className="space-y-4 relative z-10">
          {isSpelling ? (
            <div className="space-y-4">
              <input 
                type="text"
                disabled={showFeedback}
                value={selectedAnswer}
                onChange={(e) => setSelectedAnswer(e.target.value)}
                placeholder="Type your answer here..."
                className={`w-full p-6 text-2xl font-bold rounded-3xl border-4 outline-none transition-all ${
                  showFeedback 
                  ? 'bg-slate-50 border-slate-200' 
                  : 'border-blue-100 focus:border-blue-500 bg-blue-50/30'
                }`}
                onKeyPress={(e) => e.key === 'Enter' && !showFeedback && handleAnswerSubmit()}
              />
              <p className="text-sm text-slate-400 font-medium italic">Hint: Look at the brackets in the question.</p>
            </div>
          ) : (
            currentQuestion.options?.map((option, idx) => (
              <button
                key={idx}
                disabled={showFeedback}
                onClick={() => setSelectedAnswer(option)}
                className={`w-full p-6 rounded-3xl text-left border-4 transition-all flex items-center group ${
                  selectedAnswer === option 
                  ? 'border-blue-500 bg-blue-50 shadow-inner' 
                  : 'border-slate-50 hover:border-blue-200 bg-white'
                } ${showFeedback ? 'opacity-50 cursor-not-allowed' : 'active:scale-[0.98]'}`}
              >
                <span className={`w-10 h-10 rounded-2xl flex items-center justify-center mr-6 font-black text-lg transition-colors ${
                  selectedAnswer === option ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-blue-100'
                }`}>
                  {String.fromCharCode(65 + idx)}
                </span>
                <span className="text-xl font-bold text-slate-700">{option}</span>
              </button>
            ))
          )}
        </div>

        {showFeedback ? (
          <div className={`mt-10 p-8 rounded-[2rem] animate-fade-in border-4 ${
            selectedAnswer.trim().toLowerCase() === currentQuestion.answer.toLowerCase() 
            ? 'bg-green-50 border-green-200' 
            : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-center mb-4">
               <span className="text-4xl mr-4">
                {selectedAnswer.trim().toLowerCase() === currentQuestion.answer.toLowerCase() ? '🌟' : '💡'}
               </span>
               <h4 className={`text-2xl font-black ${
                selectedAnswer.trim().toLowerCase() === currentQuestion.answer.toLowerCase() ? 'text-green-700' : 'text-red-700'
               }`}>
                {selectedAnswer.trim().toLowerCase() === currentQuestion.answer.toLowerCase() ? t.correct : t.incorrect}
               </h4>
            </div>
            
            <div className="mb-6 space-y-2">
              <p className="text-slate-600 font-bold">
                Correct Answer: <span className="text-green-600 underline decoration-2">{currentQuestion.answer}</span>
              </p>
              <p className="text-slate-700 leading-relaxed font-medium">{currentQuestion.explanation}</p>
            </div>

            <button
              onClick={handleNext}
              className="w-full bg-slate-800 hover:bg-slate-900 text-white font-black py-5 rounded-2xl shadow-xl transition-all active:scale-95 text-lg"
            >
              {currentIndex + 1 < questions.length ? t.nextQuestion : t.seeResults}
            </button>
          </div>
        ) : (
          <button
            onClick={handleAnswerSubmit}
            disabled={!selectedAnswer.trim()}
            className={`mt-10 w-full font-black py-6 rounded-[2rem] shadow-xl transition-all text-xl ${
              selectedAnswer.trim() 
              ? 'bg-yellow-400 hover:bg-yellow-500 text-blue-900 active:scale-95 shadow-yellow-100' 
              : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            }`}
          >
            {t.checkAnswer}
          </button>
        )}
      </div>
    </div>
  );
};

export default Quiz;

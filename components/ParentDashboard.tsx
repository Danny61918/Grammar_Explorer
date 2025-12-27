
import React, { useMemo } from 'react';
import { UserRecord, Statistics } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Language, translations } from '../translations';

interface ParentDashboardProps {
  records: UserRecord[];
  onReset: () => void;
  lang: Language;
}

const ParentDashboard: React.FC<ParentDashboardProps> = ({ records, onReset, lang }) => {
  const t = translations[lang];
  const stats: Statistics = useMemo(() => {
    const s: Statistics = {
      totalAttempted: records.length,
      correctCount: records.filter(r => r.isCorrect).length,
      categoryAccuracy: {}
    };

    records.forEach(r => {
      if (!s.categoryAccuracy[r.category]) {
        s.categoryAccuracy[r.category] = { attempted: 0, correct: 0 };
      }
      s.categoryAccuracy[r.category].attempted++;
      if (r.isCorrect) s.categoryAccuracy[r.category].correct++;
    });

    return s;
  }, [records]);

  const chartData = Object.entries(stats.categoryAccuracy).map(([name, data]) => ({
    name,
    accuracy: Math.round((data.correct / data.attempted) * 100)
  }));

  const weakAreas = Object.entries(stats.categoryAccuracy)
    .filter(([_, data]) => (data.correct / data.attempted) < 0.7)
    .map(([name]) => name);

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800">{t.dashboardTitle}</h2>
        <button 
          onClick={onReset}
          className="text-red-500 text-sm hover:underline"
        >
          {t.clearRecords}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 font-semibold mb-1">{t.totalDone}</p>
          <p className="text-4xl font-bold text-blue-600">{stats.totalAttempted}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 font-semibold mb-1">{t.overallAccuracy}</p>
          <p className="text-4xl font-bold text-green-600">
            {stats.totalAttempted > 0 ? Math.round((stats.correctCount / stats.totalAttempted) * 100) : 0}%
          </p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 font-semibold mb-1">{t.streaks}</p>
          <p className="text-4xl font-bold text-yellow-500">{records.filter(r => new Date(r.timestamp).toDateString() === new Date().toDateString()).length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-xl font-bold mb-6">{t.accuracyByTopic}</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" fontSize={10} interval={0} angle={-15} textAnchor="end" />
                <YAxis hide />
                <Tooltip />
                <Bar dataKey="accuracy" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.accuracy < 70 ? '#ef4444' : '#10b981'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-xl font-bold mb-4">{t.focusRec}</h3>
          {weakAreas.length > 0 ? (
            <div className="space-y-4">
              <p className="text-gray-600">{t.needMorePractice}</p>
              {weakAreas.map(area => (
                <div key={area} className="flex items-center p-3 bg-red-50 text-red-700 rounded-xl border border-red-100">
                  <span className="mr-3">⚠️</span>
                  <span className="font-semibold">{area}</span>
                </div>
              ))}
              <div className="mt-4 p-4 bg-blue-50 text-blue-800 rounded-xl">
                <p className="text-sm"><strong>{t.tipTitle}</strong> {t.tipDesc}</p>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">🌟</div>
              <p className="text-green-600 font-bold text-lg">{t.greatJob}</p>
              <p className="text-gray-500">{t.noWeakSpots}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ParentDashboard;

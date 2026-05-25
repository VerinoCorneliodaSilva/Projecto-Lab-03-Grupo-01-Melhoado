import { eventsData, categoryLabels } from '../data/eventsData';
import { Calendar as CalendarIcon, Flame, Filter } from 'lucide-react';
import { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';

export function CalendarPage() {
  const [filter, setFilter] = useState<string>('all');
  const { t, formatDate } = useLanguage();

  const filtered = eventsData.filter((e) => filter === 'all' || e.category === filter);
  const sorted = [...filtered].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const categories = Object.keys(categoryLabels) as Array<keyof typeof categoryLabels>;

  const impactColors = {
    low: 'bg-slate-500/10 text-slate-400 border-slate-500/30',
    medium: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
    high: 'bg-red-500/10 text-red-400 border-red-500/30',
  };

  const impactLabels = { low: t('calendar.low'), medium: t('calendar.medium'), high: t('calendar.high') };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 flex items-center gap-3">
          <CalendarIcon className="w-8 h-8 text-indigo-400" />
          {t('calendar.title')}
        </h1>
        <p className="text-slate-400">{t('calendar.subtitle')}</p>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        <Filter className="w-4 h-4 text-slate-400" />
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
            filter === 'all' ? 'bg-indigo-500 text-white' : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          {t('calendar.filterAll')}
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
              filter === cat ? 'bg-indigo-500 text-white' : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {categoryLabels[cat]}
          </button>
        ))}
      </div>

      {/* Timeline */}
      <div className="relative">
        <div className="absolute left-5 top-0 bottom-0 w-px bg-slate-800" />
        <div className="space-y-4">
          {sorted.map((event) => {
            const date = new Date(event.date);
            const daysLeft = Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
            const isSoon = daysLeft <= 7;

            return (
              <div key={event.id} className="relative pl-14">
                <div
                  className="absolute left-3 top-5 w-5 h-5 rounded-full border-4 border-slate-950"
                  style={{ backgroundColor: event.color }}
                />
                <div className={`bg-slate-900/60 border rounded-xl p-5 ${isSoon ? 'border-orange-500/30' : 'border-slate-800'}`}>
                  <div className="flex items-start justify-between gap-4 flex-wrap mb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                        {categoryLabels[event.category]}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${impactColors[event.impact]}`}>
                        {t('calendar.impact', { level: impactLabels[event.impact] })}
                      </span>
                      {event.crypto && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
                          {event.crypto}
                        </span>
                      )}
                      {isSoon && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/30 flex items-center gap-1">
                          <Flame className="w-3 h-3" />
                          {t('calendar.soon')}
                        </span>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-white">
                        {formatDate(date, { day: '2-digit', month: 'long', year: 'numeric' })}
                      </div>
                      <div className={`text-xs ${isSoon ? 'text-orange-400' : 'text-slate-500'}`}>
                        {daysLeft > 0 ? t('calendar.inDays', { days: daysLeft, plural: daysLeft > 1 ? 's' : '' }) : t('calendar.today')}
                      </div>
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-1">{event.title}</h3>
                  <p className="text-sm text-slate-400">{event.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

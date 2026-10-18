import React, { useState } from 'react';
import { Week } from '../types';
import { translations, Language } from '../utils/language';
import { X, CalendarPlus } from 'lucide-react';

interface Props {
  lang: Language;
  nextWeekNumber: number;
  seasonId: string;
  defaultTarget: number;
  onSave: (week: Omit<Week, 'id'>) => void;
  onClose: () => void;
}

export const CreateWeekModal: React.FC<Props> = ({
  lang,
  nextWeekNumber,
  seasonId,
  defaultTarget,
  onSave,
  onClose,
}) => {
  const t = translations[lang];
  const isBangla = lang === 'bn';

  const [title, setTitle] = useState(`Week ${nextWeekNumber}`);
  const [titleBangla, setTitleBangla] = useState(`সপ্তাহ ${nextWeekNumber}`);
  const [target, setTarget] = useState<number>(defaultTarget || 5000);
  const [startDate, setStartDate] = useState(new Date().toLocaleDateString('en-GB'));
  const [endDate, setEndDate] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    onSave({
      seasonId,
      weekNumber: nextWeekNumber,
      title,
      titleBangla: titleBangla || title,
      weeklyTarget: Number(target) || 5000,
      startDate: startDate || new Date().toLocaleDateString('en-GB'),
      endDate: endDate || 'Upcoming',
      isClosed: false,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <CalendarPlus className="w-5 h-5 text-emerald-600" />
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
              {t.create_week}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3.5">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Title (English)
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Week 5"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                নাম (বাংলা)
              </label>
              <input
                type="text"
                value={titleBangla}
                onChange={(e) => setTitleBangla(e.target.value)}
                placeholder="সপ্তাহ ৫"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
              {t.weekly_target} (৳)
            </label>
            <input
              type="number"
              min="1000"
              step="500"
              required
              value={target}
              onChange={(e) => setTarget(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-bold text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                {isBangla ? 'শুরুর তারিখ' : 'Start Date'}
              </label>
              <input
                type="text"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                placeholder="DD/MM/YYYY"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                {isBangla ? 'সমাপ্তির তারিখ' : 'End Date'}
              </label>
              <input
                type="text"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                placeholder="DD/MM/YYYY"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex gap-2 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-500/20"
            >
              {t.save}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { Season } from '../types';
import { translations, Language } from '../utils/language';
import { X, Trophy } from 'lucide-react';

interface Props {
  lang: Language;
  onSave: (season: Omit<Season, 'id'>) => void;
  onClose: () => void;
}

export const CreateSeasonModal: React.FC<Props> = ({ lang, onSave, onClose }) => {
  const t = translations[lang];
  const isBangla = lang === 'bn';

  const [name, setName] = useState('Badminton Season 2027');
  const [weeklyTarget, setWeeklyTarget] = useState<number>(5500);
  const [defaultWeeklyFee, setDefaultWeeklyFee] = useState<number>(350);
  const [startDate, setStartDate] = useState('01/01/2027');
  const [endDate, setEndDate] = useState('31/12/2027');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    onSave({
      name,
      isActive: true,
      startDate,
      endDate,
      weeklyTarget: Number(weeklyTarget) || 5000,
      defaultWeeklyFee: Number(defaultWeeklyFee) || 350,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-emerald-600" />
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
              {t.create_season}
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
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
              {t.season_name}
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Badminton Season 2027"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                {t.weekly_target} (৳)
              </label>
              <input
                type="number"
                min="1000"
                step="500"
                required
                value={weeklyTarget}
                onChange={(e) => setWeeklyTarget(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-bold text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                {t.weekly_amount} (৳)
              </label>
              <input
                type="number"
                min="100"
                step="50"
                required
                value={defaultWeeklyFee}
                onChange={(e) => setDefaultWeeklyFee(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-bold text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
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

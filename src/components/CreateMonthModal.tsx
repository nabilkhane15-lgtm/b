import React, { useState } from 'react';
import { MonthRecord } from '../types';
import { Language } from '../utils/language';
import { X, CalendarCheck2 } from 'lucide-react';

interface Props {
  lang: Language;
  seasonId: string;
  defaultTarget: number;
  onSave: (month: Omit<MonthRecord, 'id'>) => void;
  onClose: () => void;
}

const MONTH_NAMES = [
  { num: 1, en: 'January', bn: 'জানুয়ারি' },
  { num: 2, en: 'February', bn: 'ফেব্রুয়ারি' },
  { num: 3, en: 'March', bn: 'মার্চ' },
  { num: 4, en: 'April', bn: 'এপ্রিল' },
  { num: 5, en: 'May', bn: 'মে' },
  { num: 6, en: 'June', bn: 'জুন' },
  { num: 7, en: 'July', bn: 'জুলাই' },
  { num: 8, en: 'August', bn: 'আগস্ট' },
  { num: 9, en: 'September', bn: 'সেপ্টেম্বর' },
  { num: 10, en: 'October', bn: 'অক্টোবর' },
  { num: 11, en: 'November', bn: 'নভেম্বর' },
  { num: 12, en: 'December', bn: 'ডিসেম্বর' },
];

export const CreateMonthModal: React.FC<Props> = ({
  lang,
  seasonId,
  defaultTarget,
  onSave,
  onClose,
}) => {
  const isBangla = lang === 'bn';
  const currentMonthIdx = new Date().getMonth(); // 0 to 11
  const currentYear = new Date().getFullYear();

  const [selectedMonthNum, setSelectedMonthNum] = useState<number>(currentMonthIdx + 1);
  const [year, setYear] = useState<number>(currentYear);
  const [target, setTarget] = useState<number>(defaultTarget || 16800);

  const monthObj = MONTH_NAMES.find((m) => m.num === selectedMonthNum) || MONTH_NAMES[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      seasonId,
      monthNumber: selectedMonthNum,
      year: Number(year),
      title: `${monthObj.en} ${year}`,
      titleBangla: `${monthObj.bn} ${year}`,
      targetAmount: Number(target) || 16800,
      isClosed: false,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
          <div className="flex items-center gap-2">
            <CalendarCheck2 className="w-5 h-5 text-emerald-600" />
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
              {isBangla ? 'নতুন মাস শুরু করুন' : 'Add New Month'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
              {isBangla ? 'মাস নির্বাচন করুন' : 'Select Month'}
            </label>
            <select
              value={selectedMonthNum}
              onChange={(e) => setSelectedMonthNum(Number(e.target.value))}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
            >
              {MONTH_NAMES.map((m) => (
                <option key={m.num} value={m.num}>
                  {isBangla ? m.bn : m.en}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
              {isBangla ? 'সাল' : 'Year'}
            </label>
            <input
              type="number"
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              required
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
              {isBangla ? 'মাসিক সংগ্রহের লক্ষ্যমাত্রা (টাকা)' : 'Monthly Target Amount (BDT)'}
            </label>
            <input
              type="number"
              min="0"
              value={target}
              onChange={(e) => setTarget(Number(e.target.value))}
              required
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {isBangla ? 'বাতিল' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md transition-all"
            >
              {isBangla ? 'মাস যুক্ত করুন' : 'Create Month'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

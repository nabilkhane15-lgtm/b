import React, { useState } from 'react';
import { Expense, ExpenseCategory } from '../types';
import { translations, Language } from '../utils/language';
import { X, PlusCircle } from 'lucide-react';

interface Props {
  lang: Language;
  onSave: (expense: Omit<Expense, 'id'>) => void;
  onClose: () => void;
  seasonId: string;
}

const CATEGORIES: ExpenseCategory[] = [
  'Court Rent',
  'Shuttlecock',
  'Lighting / Electricity',
  'Tournament',
  'Equipment',
  'Food / Drinks',
  'Other',
];

export const AddExpenseModal: React.FC<Props> = ({
  lang,
  onSave,
  onClose,
  seasonId,
}) => {
  const t = translations[lang];
  const isBangla = lang === 'bn';

  const [category, setCategory] = useState<ExpenseCategory>('Shuttlecock');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState<number | ''>('');
  const [addedBy, setAddedBy] = useState('Admin');
  const [date, setDate] = useState(new Date().toLocaleDateString('en-GB'));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount || Number(amount) <= 0) return;

    onSave({
      seasonId,
      category,
      description,
      amount: Number(amount),
      addedBy: addedBy || 'Admin',
      date: date || new Date().toLocaleDateString('en-GB'),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <PlusCircle className="w-5 h-5 text-orange-600" />
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
              {t.add_expense}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Category */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
              {t.category}
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold focus:ring-2 focus:ring-orange-500 focus:outline-none"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
              {t.description}
            </label>
            <input
              type="text"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Yonex Aerosensa Feather Shuttles (2 tubes)"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-orange-500 focus:outline-none"
            />
          </div>

          {/* Amount */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
              {t.amount} (৳)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                ৳
              </span>
              <input
                type="number"
                min="1"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="1500"
                className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-bold text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Added By & Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                {t.added_by}
              </label>
              <input
                type="text"
                value={addedBy}
                onChange={(e) => setAddedBy(e.target.value)}
                placeholder="Admin"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-orange-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                {t.date}
              </label>
              <input
                type="text"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                placeholder="DD/MM/YYYY"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-orange-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              className="flex-1 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs shadow-md shadow-orange-500/20"
            >
              {t.save}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { Expense, ExpenseCategory } from '../types';
import { translations, Language, formatCurrency, formatNumber } from '../utils/language';
import {
  ReceiptText,
  Plus,
  Trash2,
  Filter,
  DollarSign,
  TrendingDown,
  Layers,
  Calendar,
  User,
} from 'lucide-react';

interface Props {
  expenses: Expense[];
  lang: Language;
  isAdmin: boolean;
  onOpenAddExpense: () => void;
  onDeleteExpense: (id: string) => void;
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

export const ExpensesView: React.FC<Props> = ({
  expenses,
  lang,
  isAdmin,
  onOpenAddExpense,
  onDeleteExpense,
}) => {
  const t = translations[lang];
  const isBangla = lang === 'bn';

  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const getCategoryLabel = (cat: ExpenseCategory): string => {
    switch (cat) {
      case 'Court Rent':
        return t.cat_court;
      case 'Shuttlecock':
        return t.cat_shuttle;
      case 'Lighting / Electricity':
        return t.cat_light;
      case 'Tournament':
        return t.cat_tourney;
      case 'Equipment':
        return t.cat_equip;
      case 'Food / Drinks':
        return t.cat_food;
      default:
        return t.cat_other;
    }
  };

  const getCategoryColor = (cat: ExpenseCategory): string => {
    switch (cat) {
      case 'Court Rent':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300';
      case 'Shuttlecock':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300';
      case 'Lighting / Electricity':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300';
      case 'Tournament':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300';
      case 'Equipment':
        return 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300';
      case 'Food / Drinks':
        return 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300';
      default:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300';
    }
  };

  const filtered =
    selectedCategory === 'ALL'
      ? expenses
      : expenses.filter((e) => e.category === selectedCategory);

  const totalExpenseSum = expenses.reduce((acc, e) => acc + e.amount, 0);
  const filteredSum = filtered.reduce((acc, e) => acc + e.amount, 0);

  return (
    <div className="space-y-4 pb-24">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <span>{t.expenses_title}</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300">
              {formatNumber(expenses.length, isBangla)} {isBangla ? 'টি ভাউচার' : 'items'}
            </span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {isBangla
              ? 'কোর্ট ভাড়া, শাটলকক ও টুর্নামেন্ট খরচের স্বচ্ছ হিসাব'
              : 'Track court bookings, shuttlecocks, lights and operational expenses'}
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={onOpenAddExpense}
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs shadow-md shadow-orange-600/20 transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>{t.add_expense}</span>
          </button>
        )}
      </div>

      {/* Total Sum Card */}
      <div className="rounded-2xl bg-gradient-to-br from-orange-500 to-rose-600 p-5 text-white shadow-lg shadow-orange-500/10 flex items-center justify-between">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-orange-100 block">
            {t.total_expenses}
          </span>
          <span className="text-3xl font-black font-mono tracking-tight text-white mt-1 block">
            {formatCurrency(totalExpenseSum, isBangla)}
          </span>
          {selectedCategory !== 'ALL' && (
            <span className="text-xs text-orange-200 mt-0.5 block">
              {isBangla ? 'ফিল্টারকৃত খাতে খরচ' : 'Filtered Category Sum'}:{' '}
              <strong>{formatCurrency(filteredSum, isBangla)}</strong>
            </span>
          )}
        </div>
        <div className="p-3 rounded-2xl bg-white/20 text-white backdrop-blur-sm">
          <TrendingDown className="w-7 h-7" />
        </div>
      </div>

      {/* Category Filter Chips */}
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        <button
          onClick={() => setSelectedCategory('ALL')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            selectedCategory === 'ALL'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
          }`}
        >
          {t.filter_all} ({formatNumber(expenses.length, isBangla)})
        </button>

        {CATEGORIES.map((cat) => {
          const count = expenses.filter((e) => e.category === cat).length;
          const isSelected = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                isSelected
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
              }`}
            >
              {getCategoryLabel(cat)} ({formatNumber(count, isBangla)})
            </button>
          );
        })}
      </div>

      {/* Expenses Table / List */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs italic">
            {isBangla ? 'কোন খরচের হিসাব নেই' : 'No expenses in this category'}
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {filtered.map((expense) => (
              <div
                key={expense.id}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-orange-50 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 shrink-0 mt-0.5">
                    <ReceiptText className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                        {expense.description}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${getCategoryColor(
                          expense.category
                        )}`}
                      >
                        {getCategoryLabel(expense.category)}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {expense.date}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5" />
                        {expense.addedBy}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                  <span className="text-base font-black font-mono text-orange-600 dark:text-orange-400">
                    {formatCurrency(expense.amount, isBangla)}
                  </span>

                  {isAdmin && (
                    <button
                      onClick={() => {
                        if (
                          confirm(
                            isBangla
                              ? `আপনি কি নিশ্চিত যে এই খরচটি মুছে ফেলতে চান? (${expense.description})`
                              : `Delete expense: ${expense.description}?`
                          )
                        ) {
                          onDeleteExpense(expense.id);
                        }
                      }}
                      title={t.delete}
                      className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

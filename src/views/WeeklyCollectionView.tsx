import React, { useState } from 'react';
import {
  Week,
  MonthRecord,
  Payment,
  MonthlyPayment,
  SavingsDeposit,
  Member,
  Season,
} from '../types';
import {
  translations,
  Language,
  formatCurrency,
  formatNumber,
} from '../utils/language';
import {
  CalendarDays,
  CalendarCheck2,
  PiggyBank,
  Plus,
  CheckCircle2,
  AlertCircle,
  Clock,
  ChevronRight,
  Trash2,
  ArrowDownRight,
  ArrowUpRight,
  Search,
  Wallet,
  Coins,
} from 'lucide-react';

interface Props {
  season: Season;
  weeks: Week[];
  months: MonthRecord[];
  payments: Payment[];
  monthlyPayments: MonthlyPayment[];
  savingsDeposits: SavingsDeposit[];
  members: Member[];
  activeWeekId: string;
  activeMonthId: string;
  lang: Language;
  isAdmin: boolean;
  onSelectWeek: (weekId: string) => void;
  onSelectMonth: (monthId: string) => void;
  onOpenCreateWeek: () => void;
  onOpenCreateMonth: () => void;
  onDeleteWeek?: (weekId: string) => void;
  onDeleteMonth?: (monthId: string) => void;
  onOpenMonthlyPaymentModal: (payment: MonthlyPayment, month: MonthRecord, member: Member) => void;
  onOpenAddSavings: (memberId?: string) => void;
  onDeleteSavings?: (savingsId: string) => void;
}

export const WeeklyCollectionView: React.FC<Props> = ({
  season,
  weeks,
  months,
  payments,
  monthlyPayments,
  savingsDeposits,
  members,
  activeWeekId,
  activeMonthId,
  lang,
  isAdmin,
  onSelectWeek,
  onSelectMonth,
  onOpenCreateWeek,
  onOpenCreateMonth,
  onDeleteWeek,
  onDeleteMonth,
  onOpenMonthlyPaymentModal,
  onOpenAddSavings,
  onDeleteSavings,
}) => {
  const t = translations[lang];
  const isBangla = lang === 'bn';

  // Sub-tabs: 'weekly' | 'monthly' | 'savings'
  const [collectionTab, setCollectionTab] = useState<'weekly' | 'monthly' | 'savings'>('weekly');
  const [savingsSearch, setSavingsSearch] = useState('');

  // Active month
  const activeMonth = months.find((m) => m.id === activeMonthId) || months[0] || {
    id: 'm-default',
    seasonId: season.id,
    monthNumber: 2,
    year: 2026,
    title: 'February 2026',
    titleBangla: 'ফেব্রুয়ারি ২০২৬',
    targetAmount: 16800,
    isClosed: false,
  };

  // Total Club Savings Pool calculation
  const totalSavingsPool = savingsDeposits.reduce(
    (acc, d) => (d.type === 'DEPOSIT' ? acc + d.amount : acc - d.amount),
    0
  );

  // Filtered members for savings ledger
  const filteredMembers = members.filter((m) => {
    const q = savingsSearch.toLowerCase();
    return (
      m.name.toLowerCase().includes(q) ||
      (m.banglaName && m.banglaName.toLowerCase().includes(q)) ||
      m.phone.includes(q)
    );
  });

  return (
    <div className="space-y-5 pb-24">
      {/* 1. View Header with Segmented Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <span>{isBangla ? 'তহবিল ও সঞ্চয় সংগ্রহ' : 'Collections & Sonsoy Vault'}</span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
              {collectionTab === 'weekly'
                ? `${formatNumber(weeks.length, isBangla)} ${isBangla ? 'সপ্তাহ' : 'weeks'}`
                : collectionTab === 'monthly'
                ? `${formatNumber(months.length, isBangla)} ${isBangla ? 'মাস' : 'months'}`
                : `${formatCurrency(totalSavingsPool, isBangla)}`}
            </span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {isBangla
              ? 'সাপ্তাহিক চাঁদা, প্রতি মাসের সাধারণ ফান্ড এবং সদস্যদের সঞ্চয় ডিপিএস হিসাব'
              : 'Weekly dues, monthly club funds, and member personal savings ledger'}
          </p>
        </div>

        {/* Action button depending on active sub-tab */}
        {isAdmin && (
          <div className="flex items-center gap-2 self-start sm:self-auto">
            {collectionTab === 'weekly' && (
              <button
                onClick={onOpenCreateWeek}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>{t.create_week}</span>
              </button>
            )}
            {collectionTab === 'monthly' && (
              <button
                onClick={onOpenCreateMonth}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>{t.create_month}</span>
              </button>
            )}
            {collectionTab === 'savings' && (
              <button
                onClick={() => onOpenAddSavings()}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all"
              >
                <PiggyBank className="w-4 h-4" />
                <span>{t.deposit_savings}</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* 2. Top Segmented Navigation Tabs */}
      <div className="flex p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
        <button
          onClick={() => setCollectionTab('weekly')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
            collectionTab === 'weekly'
              ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <CalendarDays className="w-4 h-4" />
          <span>{t.tab_weekly}</span>
        </button>

        <button
          onClick={() => setCollectionTab('monthly')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
            collectionTab === 'monthly'
              ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <CalendarCheck2 className="w-4 h-4" />
          <span>{t.tab_monthly}</span>
        </button>

        <button
          onClick={() => setCollectionTab('savings')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
            collectionTab === 'savings'
              ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <PiggyBank className="w-4 h-4 text-emerald-500" />
          <span>{t.tab_savings}</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: WEEKLY COLLECTION */}
      {/* ========================================================================= */}
      {collectionTab === 'weekly' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {weeks
            .slice()
            .reverse()
            .map((week) => {
              const isCurrent = week.id === activeWeekId;
              const weekPayments = payments.filter((p) => p.weekId === week.id);
              const collected = weekPayments.reduce((acc, p) => acc + p.paidAmount, 0);
              const target = week.weeklyTarget || 5000;
              const remaining = Math.max(target - collected, 0);
              const percentage = target > 0 ? Math.min(Math.round((collected / target) * 100), 100) : 0;

              const paidCount = weekPayments.filter((p) => p.status === 'PAID').length;
              const unpaidCount = weekPayments.filter((p) => p.status === 'UNPAID').length;
              const partialCount = weekPayments.filter((p) => p.status === 'PARTIAL').length;
              const weekTitle = isBangla && week.titleBangla ? week.titleBangla : week.title;

              return (
                <div
                  key={week.id}
                  onClick={() => onSelectWeek(week.id)}
                  className={`cursor-pointer rounded-2xl p-5 transition-all border shadow-sm hover:shadow-md flex flex-col justify-between ${
                    isCurrent
                      ? 'bg-gradient-to-br from-emerald-50/70 to-teal-50/70 dark:from-emerald-950/40 dark:to-slate-900 border-emerald-500/70 dark:border-emerald-700 shadow-emerald-500/10'
                      : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800'
                  }`}
                >
                  <div>
                    {/* Card Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm ${
                            isCurrent
                              ? 'bg-emerald-600 text-white shadow-sm'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          <CalendarDays className="w-4 h-4" />
                        </div>
                        <div>
                          <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                            <span>{weekTitle}</span>
                            {isCurrent && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-600 text-white">
                                {isBangla ? 'সক্রিয়' : 'Active'}
                              </span>
                            )}
                          </h3>
                          <span className="text-xs text-slate-400">
                            {week.startDate} - {week.endDate}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="text-right">
                          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 block">
                            {formatNumber(percentage, isBangla)}%
                          </span>
                          <span className="text-[10px] text-slate-400 block">
                            {t.completed}
                          </span>
                        </div>

                        {isAdmin && onDeleteWeek && weeks.length > 1 && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (
                                confirm(
                                  isBangla
                                    ? `আপনি কি নিশ্চিত যে "${weekTitle}" এবং এর পেমেন্ট তথ্য মুছে ফেলতে চান?`
                                    : `Delete "${weekTitle}"?`
                                )
                              ) {
                                onDeleteWeek(week.id);
                              }
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                            title={t.delete_week}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Target and Numbers */}
                    <div className="grid grid-cols-3 gap-2 my-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 block">{t.target}</span>
                        <span className="font-bold text-slate-700 dark:text-slate-300">
                          {formatCurrency(target, isBangla)}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">{t.collected}</span>
                        <span className="font-black text-emerald-600 dark:text-emerald-400 font-mono">
                          {formatCurrency(collected, isBangla)}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">{t.remaining}</span>
                        <span className="font-bold text-amber-600 dark:text-amber-400 font-mono">
                          {formatCurrency(remaining, isBangla)}
                        </span>
                      </div>
                    </div>

                    {/* Progress Line */}
                    <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden mb-4">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>

                  {/* Member Counts & Selection CTA */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                    <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400 font-medium text-[11px]">
                      <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {formatNumber(paidCount, isBangla)} {t.status_paid}
                      </span>
                      {partialCount > 0 && (
                        <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                          <Clock className="w-3.5 h-3.5" />
                          {formatNumber(partialCount, isBangla)}
                        </span>
                      )}
                      <span className="flex items-center gap-1 text-rose-600 dark:text-rose-400">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {formatNumber(unpaidCount, isBangla)} {t.status_unpaid}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                      <span>{isCurrent ? (isBangla ? 'ড্যাশবোর্ডে সক্রিয়' : 'Active') : (isBangla ? 'নির্বাচন করুন' : 'Select')}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: MONTHLY COLLECTION */}
      {/* ========================================================================= */}
      {collectionTab === 'monthly' && (
        <div className="space-y-4">
          {/* Months Horizontal Selection */}
          <div className="flex items-center gap-2.5 overflow-x-auto pb-1 scrollbar-none">
            {months.map((m) => {
              const isSelected = m.id === activeMonth.id;
              const mPayments = monthlyPayments.filter((p) => p.monthId === m.id);
              const mCollected = mPayments.reduce((acc, p) => acc + p.paidAmount, 0);
              const mTarget = m.targetAmount || 16800;
              const mPct = mTarget > 0 ? Math.min(Math.round((mCollected / mTarget) * 100), 100) : 0;

              return (
                <button
                  key={m.id}
                  onClick={() => onSelectMonth(m.id)}
                  className={`flex-shrink-0 p-3.5 rounded-2xl border text-left transition-all min-w-[170px] ${
                    isSelected
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:border-emerald-500'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-xs font-black ${isSelected ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                      {isBangla && m.titleBangla ? m.titleBangla : m.title}
                    </span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                      {formatNumber(mPct, isBangla)}%
                    </span>
                  </div>
                  <div className={`text-[11px] font-semibold ${isSelected ? 'text-emerald-100' : 'text-slate-500'}`}>
                    {formatCurrency(mCollected, isBangla)} / {formatCurrency(mTarget, isBangla)}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Active Month Status Banner */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                <CalendarCheck2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  {isBangla && activeMonth.titleBangla ? activeMonth.titleBangla : activeMonth.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {isBangla ? 'সদস্যদের নির্ধারিত মাসিক ফি ও আদায় স্থিতি' : 'Monthly contributions and payment records'}
                </p>
              </div>
            </div>

            {isAdmin && onDeleteMonth && months.length > 1 && (
              <button
                onClick={() => {
                  if (confirm(isBangla ? `আপনি কি "${activeMonth.title}" মুছে ফেলতে চান?` : `Delete month "${activeMonth.title}"?`)) {
                    onDeleteMonth(activeMonth.id);
                  }
                }}
                className="self-end sm:self-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900 transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isBangla ? 'মাস মুছুন' : 'Delete Month'}</span>
              </button>
            )}
          </div>

          {/* Monthly Members Payments Table */}
          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                {isBangla ? 'মাসিক চাঁদা প্রদান তালিকা' : 'Monthly Dues Register'}
              </span>
              <span className="text-xs text-slate-400">
                {isBangla ? 'সদস্যের উপর ক্লিক করে পেমেন্ট আপডেট করুন' : 'Click row to update payment'}
              </span>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {members.map((member) => {
                const p = monthlyPayments.find(
                  (mp) => mp.monthId === activeMonth.id && mp.memberId === member.id
                ) || {
                  id: `mp-${activeMonth.id}-${member.id}`,
                  seasonId: season.id,
                  monthId: activeMonth.id,
                  memberId: member.id,
                  expectedAmount: member.monthlyAmount || 1400,
                  paidAmount: 0,
                  status: 'UNPAID' as const,
                  paymentDate: '',
                  paymentMethod: 'bKash',
                };

                const memberName = isBangla && member.banglaName ? member.banglaName : member.name;
                const due = Math.max(p.expectedAmount - p.paidAmount, 0);

                return (
                  <div
                    key={member.id}
                    onClick={() => isAdmin && onOpenMonthlyPaymentModal(p, activeMonth, member)}
                    className={`p-3.5 flex items-center justify-between gap-3 transition-colors ${
                      isAdmin ? 'cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/60' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center justify-center">
                        {memberName.charAt(0)}
                      </div>
                      <div className="truncate">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {memberName}
                        </h4>
                        <span className="text-[11px] text-slate-400">
                          {member.phone}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-right">
                      <div>
                        <span className="text-xs font-black text-slate-900 dark:text-white block">
                          {formatCurrency(p.paidAmount, isBangla)}
                        </span>
                        <span className="text-[10px] text-slate-400 block">
                          {isBangla ? 'ফি:' : 'Fee:'} {formatCurrency(p.expectedAmount, isBangla)}
                        </span>
                      </div>

                      <div className="min-w-[70px] text-right">
                        {p.status === 'PAID' && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                            {t.status_paid}
                          </span>
                        )}
                        {p.status === 'PARTIAL' && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
                            {t.status_partial}
                          </span>
                        )}
                        {p.status === 'UNPAID' && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300">
                            {t.status_unpaid}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: SONSOY / SAVINGS VAULT & LEDGER */}
      {/* ========================================================================= */}
      {collectionTab === 'savings' && (
        <div className="space-y-4">
          {/* Sonsoy Highlights Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-lg shadow-emerald-700/20">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-emerald-100">
                  {isBangla ? 'ক্লাবের মোট সঞ্চয় তহবিল (ভল্ট)' : 'Total Club Savings Vault'}
                </span>
                <PiggyBank className="w-5 h-5 text-emerald-200" />
              </div>
              <div className="text-2xl sm:text-3xl font-black font-mono tracking-tight">
                {formatCurrency(totalSavingsPool, isBangla)}
              </div>
              <p className="text-[11px] text-emerald-100/90 mt-1">
                {isBangla ? 'জরুরি চিকিৎসা, স্পোর্টস গিয়ার ও রিজার্ভ ফান্ড' : 'Member emergency & gear reserve pool'}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">
                  {isBangla ? 'মোট সঞ্চয়কারী সদস্য' : 'Active Contributors'}
                </span>
                <Wallet className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-xl font-extrabold text-slate-900 dark:text-white my-1">
                {formatNumber(members.length, isBangla)} {isBangla ? 'জন' : 'members'}
              </div>
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
                {isBangla ? 'নিয়মিত মাসিক সঞ্চয় জমা দিচ্ছেন' : 'Depositing regular monthly savings'}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">
                  {isBangla ? 'গড় সদস্য সঞ্চয়' : 'Average Savings'}
                </span>
                <Coins className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-xl font-extrabold text-slate-900 dark:text-white my-1">
                {formatCurrency(members.length > 0 ? Math.round(totalSavingsPool / members.length) : 0, isBangla)}
              </div>
              <span className="text-[11px] text-slate-400">
                {isBangla ? 'প্রতি সদস্যের মোট সঞ্চিত স্থিতি' : 'Per active member'}
              </span>
            </div>
          </div>

          {/* Members Personal Savings Ledger */}
          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                  {isBangla ? 'সদস্যদের সঞ্চয় খাতা ও মোট জমা স্থিতি' : 'Member Personal Savings Ledger'}
                </h3>
                <p className="text-xs text-slate-500">
                  {isBangla ? 'সদস্যের সঞ্চয় ব্যালেন্স দেখতে বা জমা নিতে সিলেক্ট করুন' : 'View or record savings deposits per member'}
                </p>
              </div>

              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={savingsSearch}
                  onChange={(e) => setSavingsSearch(e.target.value)}
                  placeholder={isBangla ? 'সদস্য খুঁজুন...' : 'Search member...'}
                  className="pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none w-48"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 p-4">
              {filteredMembers.map((member) => {
                const memberSavings = savingsDeposits
                  .filter((d) => d.memberId === member.id)
                  .reduce((acc, d) => (d.type === 'DEPOSIT' ? acc + d.amount : acc - d.amount), 0);

                const memberDepositsCount = savingsDeposits.filter((d) => d.memberId === member.id).length;
                const memberName = isBangla && member.banglaName ? member.banglaName : member.name;

                return (
                  <div
                    key={member.id}
                    className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex flex-col justify-between"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                          {memberName}
                        </h4>
                        <span className="text-[11px] text-slate-400">{member.phone}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 font-mono">
                          {formatCurrency(memberSavings, isBangla)}
                        </span>
                        <span className="text-[10px] text-slate-400 block">
                          {formatNumber(memberDepositsCount, isBangla)} {isBangla ? 'টি কিস্তি' : 'deposits'}
                        </span>
                      </div>
                    </div>

                    {isAdmin && (
                      <button
                        onClick={() => onOpenAddSavings(member.id)}
                        className="mt-3 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-700 dark:text-emerald-300 text-xs font-bold transition-all"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>{isBangla ? 'সঞ্চয় জমা নিন' : 'Deposit'}</span>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Savings Transaction Records */}
          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <span>{isBangla ? 'সর্বশেষ সঞ্চয় জমার লেনদেনসমূহ' : 'Recent Savings Transactions'}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                  {formatNumber(savingsDeposits.length, isBangla)}
                </span>
              </h3>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-96 overflow-y-auto">
              {savingsDeposits
                .slice()
                .reverse()
                .map((deposit) => {
                  const m = members.find((x) => x.id === deposit.memberId);
                  const mName = isBangla && m?.banglaName ? m.banglaName : m?.name || 'Member';

                  return (
                    <div
                      key={deposit.id}
                      className="p-3.5 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold ${
                            deposit.type === 'DEPOSIT'
                              ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400'
                              : 'bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400'
                          }`}
                        >
                          {deposit.type === 'DEPOSIT' ? (
                            <ArrowDownRight className="w-4 h-4" />
                          ) : (
                            <ArrowUpRight className="w-4 h-4" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                            <span>{mName}</span>
                            <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                              {deposit.monthPeriod}
                            </span>
                          </h4>
                          <span className="text-[11px] text-slate-400">
                            {deposit.date} • {deposit.paymentMethod} {deposit.notes ? `• ${deposit.notes}` : ''}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5">
                        <span
                          className={`font-black font-mono text-sm ${
                            deposit.type === 'DEPOSIT'
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-rose-600 dark:text-rose-400'
                          }`}
                        >
                          {deposit.type === 'DEPOSIT' ? '+' : '-'}
                          {formatCurrency(deposit.amount, isBangla)}
                        </span>

                        {isAdmin && onDeleteSavings && (
                          <button
                            onClick={() => {
                              if (confirm(isBangla ? 'এই সঞ্চয় রেকর্ড মুছে ফেলতে চান?' : 'Delete deposit entry?')) {
                                onDeleteSavings(deposit.id);
                              }
                            }}
                            className="p-1 rounded text-slate-400 hover:text-rose-600 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

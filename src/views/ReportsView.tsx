import React, { useState } from 'react';
import {
  Season,
  Member,
  Week,
  Payment,
  Expense,
  CustomFund,
  FundContribution,
  FundExpense,
} from '../types';
import { translations, Language, formatCurrency, formatNumber } from '../utils/language';
import {
  BarChart3,
  Share2,
  Trophy,
  Wallet,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Award,
  Calendar,
  CheckCircle2,
  Coins,
  Users,
  Building2,
} from 'lucide-react';

interface Props {
  season: Season;
  members: Member[];
  weeks: Week[];
  payments: Payment[];
  expenses: Expense[];
  activeWeek: Week;
  lang: Language;
  funds?: CustomFund[];
  fundContributions?: FundContribution[];
  fundExpenses?: FundExpense[];
}

type ReportTimeframe = 'ENTIRE_SEASON' | 'THIS_MONTH' | 'THIS_WEEK' | 'FUNDS_DEMOGRAPHICS' | 'LEADERBOARD';

export const ReportsView: React.FC<Props> = ({
  season,
  members,
  weeks,
  payments,
  expenses,
  activeWeek,
  lang,
  funds = [],
  fundContributions = [],
  fundExpenses = [],
}) => {
  const t = translations[lang];
  const isBangla = lang === 'bn';

  const [timeframe, setTimeframe] = useState<ReportTimeframe>('ENTIRE_SEASON');

  // Compute values according to timeframe
  let targetCollection = 0;
  let targetExpenses = 0;
  let targetDue = 0;

  if (timeframe === 'THIS_WEEK') {
    const weekPayments = activeWeek ? payments.filter((p) => p.weekId === activeWeek.id) : [];
    targetCollection = weekPayments.reduce((acc, p) => acc + p.paidAmount, 0);
    const expected = weekPayments.reduce((acc, p) => acc + p.expectedAmount, 0);
    targetDue = Math.max(expected - targetCollection, 0);
    // Recent 2 week expenses as week proxy
    targetExpenses = expenses.slice(-2).reduce((acc, e) => acc + e.amount, 0);
  } else if (timeframe === 'THIS_MONTH') {
    targetCollection = payments.reduce((acc, p) => acc + p.paidAmount, 0) * 0.85;
    targetExpenses = expenses.reduce((acc, e) => acc + e.amount, 0) * 0.75;
    const expected = payments.reduce((acc, p) => acc + p.expectedAmount, 0);
    targetDue = Math.max(expected - targetCollection, 0);
  } else {
    // ENTIRE_SEASON
    targetCollection = payments.reduce((acc, p) => acc + p.paidAmount, 0);
    targetExpenses = expenses.reduce((acc, e) => acc + e.amount, 0);
    const expected = payments.reduce((acc, p) => acc + p.expectedAmount, 0);
    targetDue = Math.max(expected - targetCollection, 0);
  }

  // Mandatory formula: Current Balance = Total Collection - Total Expenses
  const balance = targetCollection - targetExpenses;

  // Category expense breakdown
  const categoryTotals: Record<string, number> = {};
  expenses.forEach((e) => {
    categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
  });

  // Contribution Leaderboard calculation
  const memberRankings = members
    .map((m) => {
      const memberPayments = payments.filter((p) => p.memberId === m.id);
      const paid = memberPayments.reduce((acc, p) => acc + p.paidAmount, 0);
      const expected = memberPayments.reduce((acc, p) => acc + p.expectedAmount, 0);
      const due = Math.max(expected - paid, 0);
      const paidWeeks = memberPayments.filter((p) => p.status === 'PAID').length;
      return { member: m, paid, due, paidWeeks };
    })
    .sort((a, b) => b.paid - a.paid);

  const handleShareReport = () => {
    const text = isBangla
      ? `🏸 *স্ম্যাশার্স ব্যাডমিন্টন ক্লাব - আর্থিক প্রতিবেদন*\n━━━━━━━━━━━━━━━━━━━━\nসিজন: ${season.name}\nতারিখ: ${new Date().toLocaleDateString('en-GB')}\n\n💰 মোট সংগ্রহ: ${formatCurrency(targetCollection, true)}\n📉 সর্বমোট খরচ: ${formatCurrency(targetExpenses, true)}\n📊 বর্তমান ফান্ড ব্যালেন্স: ${formatCurrency(balance, true)}\n⚠️ সর্বমোট অপরিশোধিত বকেয়া: ${formatCurrency(targetDue, true)}\n━━━━━━━━━━━━━━━━━━━━\nহিসাব সূত্র: ব্যালেন্স = মোট সংগ্রহ - সর্বমোট খরচ\nব্যাডমিন্টন ক্লাব ফান্ড ম্যানেজার`
      : `🏸 *Smashers Badminton Club - Financial Report*\n━━━━━━━━━━━━━━━━━━━━\nSeason: ${season.name}\nDate: ${new Date().toLocaleDateString('en-GB')}\n\n💰 Total Collection: ${formatCurrency(targetCollection, false)}\n📉 Total Expenses: ${formatCurrency(targetExpenses, false)}\n📊 Current Fund Balance: ${formatCurrency(balance, false)}\n⚠️ Outstanding Due: ${formatCurrency(targetDue, false)}\n━━━━━━━━━━━━━━━━━━━━\nFormula: Current Balance = Total Collection - Total Expenses\nBadminton Club Fund Manager`;

    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-4 pb-24">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <span>{t.reports_title}</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
              {season.name}
            </span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {isBangla
              ? 'সাপ্তাহিক, মাসিক ও মৌসুমভিত্তিক স্বচ্ছ আর্থিক হিসাব ও লিডারবোর্ড'
              : 'Detailed financial statement and member contribution standings'}
          </p>
        </div>

        <button
          onClick={handleShareReport}
          className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all self-start sm:self-auto"
        >
          <Share2 className="w-4 h-4" />
          <span>{t.share_report}</span>
        </button>
      </div>

      {/* Timeframe selector chips */}
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {[
          { key: 'ENTIRE_SEASON', label: t.rep_entire_season },
          { key: 'THIS_MONTH', label: t.rep_this_month },
          { key: 'THIS_WEEK', label: t.rep_this_week },
          { key: 'FUNDS_DEMOGRAPHICS', label: isBangla ? 'বিশেষ ফান্ড ও বয়স অনুপাত' : 'Funds & Demographics', icon: '💎' },
          { key: 'LEADERBOARD', label: t.rep_leaderboard, icon: '🏆' },
        ].map((btn) => {
          const isSelected = timeframe === btn.key;
          return (
            <button
              key={btn.key}
              onClick={() => setTimeframe(btn.key as any)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
              }`}
            >
              {btn.icon && <span>{btn.icon}</span>}
              <span>{btn.label}</span>
            </button>
          );
        })}
      </div>

      {timeframe === 'FUNDS_DEMOGRAPHICS' ? (
        <div className="space-y-4">
          {/* Demographics Overview Card */}
          <div className="rounded-2xl bg-white dark:bg-slate-900 p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2 mb-3">
              <Users className="w-5 h-5 text-emerald-600" />
              <span>{isBangla ? 'সদস্য ডেমোগ্রাফিক ও অংশগ্রহণের বিভাজন' : 'Member Demographics & Roles'}</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-3.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900">
                <span className="text-2xl block mb-1">🧒</span>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                  {isBangla ? 'বাচ্চা (Child)' : 'Child'}
                </span>
                <span className="text-xl font-black font-mono text-amber-700 dark:text-amber-300">
                  {formatNumber(members.filter((m) => m.memberCategory === 'child').length, isBangla)}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900">
                <span className="text-2xl block mb-1">🧑‍🦱</span>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                  {isBangla ? 'কিশোর (Teen)' : 'Teen'}
                </span>
                <span className="text-xl font-black font-mono text-blue-700 dark:text-blue-300">
                  {formatNumber(members.filter((m) => m.memberCategory === 'teen').length, isBangla)}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900">
                <span className="text-2xl block mb-1">👨‍🦱</span>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                  {isBangla ? 'যুবক (Youth)' : 'Youth'}
                </span>
                <span className="text-xl font-black font-mono text-emerald-700 dark:text-emerald-300">
                  {formatNumber(members.filter((m) => (m.memberCategory || 'youth') === 'youth').length, isBangla)}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-purple-50/70 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900">
                <span className="text-2xl block mb-1">🏛️</span>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                  {isBangla ? 'পৃষ্ঠপোষক / শুধু ফান্ডিং' : 'Patron Only'}
                </span>
                <span className="text-xl font-black font-mono text-purple-700 dark:text-purple-300">
                  {formatNumber(members.filter((m) => m.participatesInSports === false).length, isBangla)}
                </span>
              </div>
            </div>

            <div className="mt-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-xs text-slate-600 dark:text-slate-400 flex flex-col sm:flex-row justify-between gap-2">
              <span>
                🏸 <strong>{isBangla ? 'খেলার নিয়মিত সদস্য' : 'Playing Members'}</strong>:{' '}
                {formatNumber(members.filter((m) => m.participatesInSports !== false).length, isBangla)} {isBangla ? 'জন (সাপ্তাহিক চাঁদা প্রদান করেন)' : 'members'}
              </span>
              <span>
                💡 <strong>{isBangla ? 'ফান্ডিং সহযোগী' : 'Funding Patrons'}</strong>:{' '}
                {formatNumber(members.filter((m) => m.participatesInSports === false).length, isBangla)} {isBangla ? 'জন (খেলায় দেন না কিন্তু ফান্ডে দেন)' : 'members'}
              </span>
            </div>
          </div>

          {/* Custom Funds Breakdown List */}
          <div className="rounded-2xl bg-white dark:bg-slate-900 p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
              <Coins className="w-5 h-5 text-purple-600" />
              <span>{isBangla ? 'বিশেষ ফান্ডসমূহের পূর্ণাঙ্গ বিবরণ ও হিসাব' : 'Special Funds Summary & Statement'}</span>
            </h3>

            <div className="space-y-3">
              {funds.map((f) => {
                const fContrs = fundContributions.filter((c) => c.fundId === f.id);
                const fExps = fundExpenses.filter((e) => e.fundId === f.id);
                const raised = fContrs.reduce((acc, c) => acc + c.paidAmount, 0);
                const disbursed = fExps.reduce((acc, e) => acc + e.amount, 0);
                const net = raised - disbursed;
                const fTitle = isBangla && f.titleBangla ? f.titleBangla : f.title;
                const percent = f.targetAmount > 0 ? Math.min(100, Math.round((raised / f.targetAmount) * 100)) : null;

                return (
                  <div
                    key={f.id}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <span className="text-2xl">{f.icon || '💰'}</span>
                        <div>
                          <h4 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                            <span>{fTitle}</span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300">
                              {f.category}
                            </span>
                          </h4>
                          <span className="text-[11px] text-slate-400">
                            {formatNumber(fContrs.length, isBangla)} {isBangla ? 'জন দাতা অংশগ্রহণ করেছেন' : 'donors contributed'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-right">
                        <div>
                          <span className="text-[10px] text-slate-400 block font-semibold">{isBangla ? 'আদায়' : 'Raised'}</span>
                          <span className="text-sm font-black font-mono text-emerald-600 dark:text-emerald-400">
                            {formatCurrency(raised, isBangla)}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block font-semibold">{isBangla ? 'ব্যয়' : 'Disbursed'}</span>
                          <span className="text-sm font-black font-mono text-rose-500">
                            {formatCurrency(disbursed, isBangla)}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block font-semibold">{isBangla ? 'অবশিষ্ট স্থিতি' : 'Net Balance'}</span>
                          <span className="text-sm font-black font-mono text-purple-600 dark:text-purple-400">
                            {formatCurrency(net, isBangla)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {percent !== null && (
                      <div>
                        <div className="flex justify-between text-[11px] font-semibold text-slate-500 mb-1">
                          <span>{isBangla ? 'লক্ষ্য অর্জন' : 'Target Progress'} ({formatNumber(percent, isBangla)}%)</span>
                          <span className="font-mono">{formatCurrency(raised, isBangla)} / {formatCurrency(f.targetAmount, isBangla)}</span>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-purple-600 h-full rounded-full transition-all"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : timeframe !== 'LEADERBOARD' ? (
        <>
          {/* Main Balance Statement Banner */}
          <div className="rounded-2xl bg-gradient-to-br from-emerald-700 via-emerald-800 to-slate-900 p-6 text-white shadow-xl border border-emerald-600/40">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-200">
                  {t.current_balance}
                </span>
                <span className="text-xs text-emerald-100/80 block mt-0.5 font-mono">
                  {t.calc_formula}
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-white/15 text-white backdrop-blur-sm">
                <Wallet className="w-6 h-6" />
              </div>
            </div>

            <div className="mt-4 flex items-baseline justify-between">
              <span className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-white">
                {formatCurrency(balance, isBangla)}
              </span>
              <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-lime-400/20 text-lime-300 border border-lime-400/30">
                {isBangla ? 'হিসাব নিরীক্ষিত' : 'Audited Fund'}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3 mt-6 pt-4 border-t border-emerald-600/40 text-xs">
              <div>
                <span className="text-emerald-200/80 block text-[11px]">{t.season_collection}</span>
                <span className="font-bold text-white font-mono text-sm sm:text-base">
                  {formatCurrency(targetCollection, isBangla)}
                </span>
              </div>
              <div>
                <span className="text-emerald-200/80 block text-[11px]">{t.total_expenses}</span>
                <span className="font-bold text-orange-300 font-mono text-sm sm:text-base">
                  {formatCurrency(targetExpenses, isBangla)}
                </span>
              </div>
              <div>
                <span className="text-emerald-200/80 block text-[11px]">{t.total_due}</span>
                <span className="font-bold text-rose-300 font-mono text-sm sm:text-base">
                  {formatCurrency(targetDue, isBangla)}
                </span>
              </div>
            </div>
          </div>

          {/* Expense Category Breakdown Chart */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-emerald-600" />
              <span>{t.expense_breakdown}</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              {isBangla ? 'কোন খাতে কত শতাংশ খরচ হয়েছে তার তুলনামূলক বিশ্লেষণ' : 'Visual breakdown of club expenditure'}
            </p>

            <div className="space-y-3">
              {Object.entries(categoryTotals).map(([cat, amount]) => {
                const totalExp = Object.values(categoryTotals).reduce((a, b) => a + b, 0);
                const percent = totalExp > 0 ? Math.round((amount / totalExp) * 100) : 0;

                return (
                  <div key={cat} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-700 dark:text-slate-300">{cat}</span>
                      <span className="text-slate-900 dark:text-white font-mono">
                        {formatCurrency(amount, isBangla)} ({formatNumber(percent, isBangla)}%)
                      </span>
                    </div>
                    <div className="h-2.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      ) : (
        /* Contribution Leaderboard */
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" />
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                {isBangla ? 'সর্বোচ্চ অবদানকারী সদস্য তালিকা' : 'Member Contribution Leaderboard'}
              </h3>
            </div>
            <span className="text-xs text-slate-400">
              {formatNumber(memberRankings.length, isBangla)} {isBangla ? 'জন সদস্য' : 'members'}
            </span>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {memberRankings.map((entry, index) => {
              const rank = index + 1;
              const isTop3 = rank <= 3;
              const memberName =
                isBangla && entry.member.banglaName ? entry.member.banglaName : entry.member.name;

              return (
                <div
                  key={entry.member.id}
                  className="p-4 flex items-center justify-between hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs ${
                        rank === 1
                          ? 'bg-amber-400 text-amber-950 shadow-md shadow-amber-400/30'
                          : rank === 2
                          ? 'bg-slate-300 text-slate-900'
                          : rank === 3
                          ? 'bg-amber-700 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                      }`}
                    >
                      {rank}
                    </div>

                    <div>
                      <span className="font-extrabold text-sm text-slate-900 dark:text-white block">
                        {memberName}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {entry.member.role} • {formatNumber(entry.paidWeeks, isBangla)}{' '}
                        {isBangla ? 'সপ্তাহ পরিশোধিত' : 'weeks paid'}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-black text-sm font-mono text-emerald-600 dark:text-emerald-400 block">
                      {formatCurrency(entry.paid, isBangla)}
                    </span>
                    {entry.due > 0 ? (
                      <span className="text-[10px] text-rose-500 font-semibold block">
                        {t.due_amount}: {formatCurrency(entry.due, isBangla)}
                      </span>
                    ) : (
                      <span className="text-[10px] text-emerald-500 font-bold block">
                        {isBangla ? 'বকেয়াহীন ✅' : 'No dues ✅'}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

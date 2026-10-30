import React, { useState } from 'react';
import {
  Season,
  Member,
  Week,
  Payment,
  Expense,
  TabType,
  ClubSettings,
  SavingsDeposit,
  Tournament,
  SportType,
  CustomFund,
  FundContribution,
  FundExpense,
  AdminProfile,
} from '../types';
import { translations, Language, formatCurrency, formatNumber } from '../utils/language';
import { SPORTS_MAP } from '../utils/sports';
import { WeeklyProgressBar } from '../components/WeeklyProgressBar';
import { StatusBadge } from '../components/StatusBadge';
import { isWeekUpcoming } from '../utils/accounting';
import {
  Users,
  Target,
  DollarSign,
  TrendingDown,
  Scale,
  Wallet,
  Calendar,
  Clock,
  AlertCircle,
  PlusCircle,
  ArrowUpRight,
  Receipt,
  Sparkles,
  Award,
  Trophy,
  UtensilsCrossed,
  PiggyBank,
  Coins,
  HeartHandshake,
  MessageCircle,
  Share2,
  Globe,
  Crown,
  ShieldCheck,
  Phone,
  MapPin,
} from 'lucide-react';

interface Props {
  season: Season;
  members: Member[];
  weeks: Week[];
  payments: Payment[];
  expenses: Expense[];
  activeWeek: Week;
  lang: Language;
  isAdmin: boolean;
  clubSettings: ClubSettings;
  savingsDeposits?: SavingsDeposit[];
  tournaments?: Tournament[];
  funds?: CustomFund[];
  fundContributions?: FundContribution[];
  fundExpenses?: FundExpense[];
  onNavigate: (tab: TabType) => void;
  onSelectMember: (member: Member) => void;
  onOpenReceipt: (member: Member, payment: Payment, week: Week) => void;
  onOpenAddExpense: () => void;
  onOpenIdSearch?: () => void;
  onOpenShare?: () => void;
  onOpenSignUp?: () => void;
  adminProfile?: AdminProfile;
  onOpenAdminProfile?: () => void;
}

export const DashboardView: React.FC<Props> = ({
  season,
  members,
  weeks,
  payments,
  expenses,
  activeWeek,
  lang,
  isAdmin,
  clubSettings,
  savingsDeposits = [],
  tournaments = [],
  funds = [],
  fundContributions = [],
  fundExpenses = [],
  onNavigate,
  onSelectMember,
  onOpenReceipt,
  onOpenAddExpense,
  onOpenIdSearch,
  onOpenShare,
  onOpenSignUp,
  adminProfile,
  onOpenAdminProfile,
}) => {
  const t = translations[lang];
  const isBangla = lang === 'bn';

  const [selectedSportFilter, setSelectedSportFilter] = useState<SportType | 'all'>('all');

  // Sonsoy / Savings vault total
  const totalSavingsPool = savingsDeposits.reduce(
    (acc, d) => (d.type === 'DEPOSIT' ? acc + d.amount : acc - d.amount),
    0
  );

  // Custom Funds summary
  const totalFundsCollected = fundContributions.reduce((acc, c) => acc + (c.paidAmount || 0), 0);
  const totalFundsExpected = fundContributions.reduce((acc, c) => acc + (c.expectedAmount || 0), 0);
  const totalFundsDue = fundContributions.reduce(
    (acc, c) => acc + Math.max(0, (c.expectedAmount || 0) - (c.paidAmount || 0)),
    0
  );
  const totalFundsDisbursed = fundExpenses.reduce((acc, e) => acc + (e.amount || 0), 0);
  const netFundsBalance = totalFundsCollected - totalFundsDisbursed;

  // Demographic statistics
  const childCount = members.filter((m) => m.memberCategory === 'child').length;
  const teenCount = members.filter((m) => m.memberCategory === 'teen').length;
  const youthCount = members.filter((m) => (m.memberCategory || 'youth') === 'youth').length;
  const patronsOnlyCount = members.filter((m) => m.participatesInSports === false).length;

  const memberMap = new Map<string, Member>(members.map((m) => [m.id, m]));
  const weekMap = new Map<string, Week>(weeks.map((w) => [w.id, w]));
  const isActiveWeekUpcoming = isWeekUpcoming(activeWeek);

  // Helper: effective weekly expected amount for a payment (0 if member is Funding Patron, Monthly-only, or week is Upcoming and member hasn't paid)
  const getEffectiveWeeklyExpected = (p: Payment): number => {
    const mem = memberMap.get(p.memberId);
    if (
      mem &&
      (mem.participatesInSports === false || mem.contributionType === 'monthly') &&
      (p.paidAmount || 0) === 0
    ) {
      return 0;
    }
    const wk = weekMap.get(p.weekId);
    if (isWeekUpcoming(wk) && (p.paidAmount || 0) === 0) {
      return 0;
    }
    return p.expectedAmount || 0;
  };

  // Current Week Payments
  const currentWeekPayments = activeWeek ? payments.filter((p) => p.weekId === activeWeek.id) : [];
  const collectedThisWeek = currentWeekPayments.reduce((acc, p) => acc + (p.paidAmount || 0), 0);
  const expectedThisWeekFromMembers = currentWeekPayments.reduce(
    (acc, p) => acc + getEffectiveWeeklyExpected(p),
    0
  );
  const weeklyMemberDueThisWeek = currentWeekPayments.reduce(
    (acc, p) => acc + Math.max(0, getEffectiveWeeklyExpected(p) - (p.paidAmount || 0)),
    0
  );
  const weeklyTarget = activeWeek?.weeklyTarget || season?.weeklyTarget || 5000;
  const remainingThisWeek = Math.max(weeklyTarget - collectedThisWeek, 0);

  // Season Overall Totals (Weekly + Custom Funds combined so Fund money always reflects on Dashboard!)
  const weeklyTotalCollection = payments.reduce((acc, p) => acc + (p.paidAmount || 0), 0);
  const weeklyTotalDue = payments.reduce(
    (acc, p) => acc + Math.max(0, getEffectiveWeeklyExpected(p) - (p.paidAmount || 0)),
    0
  );

  const seasonTotalCollection = weeklyTotalCollection + totalFundsCollected;
  const totalOutstandingDue = weeklyTotalDue + totalFundsDue;
  const clubOnlyExpenses = expenses.reduce((acc, e) => acc + (e.amount || 0), 0);
  const totalExpenses = clubOnlyExpenses + totalFundsDisbursed;

  // Explicit Formula: Current Balance = Total Collection (Weekly + Funds) - Total Expenses (Club + Funds)
  const currentBalance = seasonTotalCollection - totalExpenses;

  // Build human-readable explanation of who owes what for the "মোট বকেয়া" card
  const dueBreakdownLabels: string[] = [];
  members.forEach((m) => {
    const mName = isBangla && m.banglaName ? m.banglaName : m.name;
    const mWeeklyDue = payments
      .filter((p) => p.memberId === m.id)
      .reduce((acc, p) => acc + Math.max(0, getEffectiveWeeklyExpected(p) - (p.paidAmount || 0)), 0);
    const mFundDue = fundContributions
      .filter((c) => c.memberId === m.id)
      .reduce((acc, c) => acc + Math.max(0, (c.expectedAmount || 0) - (c.paidAmount || 0)), 0);
    const mTotalDue = mWeeklyDue + mFundDue;
    if (mTotalDue > 0) {
      const typeLabel =
        mWeeklyDue > 0 && mFundDue > 0
          ? isBangla
            ? 'সাপ্তাহিক+ফান্ড'
            : 'Wk+Fund'
          : mWeeklyDue > 0
          ? isBangla
            ? 'সাপ্তাহিক'
            : 'Weekly'
          : isBangla
          ? 'ফান্ড'
          : 'Fund';
      dueBreakdownLabels.push(`${mName}: ${formatCurrency(mTotalDue, isBangla)} (${typeLabel})`);
    }
  });

  // Paid vs Unpaid members this week (excluding non-playing patrons from unpaid count unless they have a fee)
  const paidCountThisWeek = currentWeekPayments.filter((p) => p.status === 'PAID').length;
  const partialCountThisWeek = currentWeekPayments.filter((p) => p.status === 'PARTIAL').length;
  const unpaidCountThisWeek = currentWeekPayments.filter(
    (p) => p.status === 'UNPAID' && getEffectiveWeeklyExpected(p) > 0
  ).length;
  const paidFundMembersCount = new Set(
    fundContributions.filter((c) => c.status === 'PAID').map((c) => c.memberId)
  ).size;

  const currentSportMeta = SPORTS_MAP[clubSettings.sportType || 'multi'];

  return (
    <div className="space-y-6 pb-24">
      {/* 0. Club Sport Identity Banner */}
      <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-emerald-900/10 via-teal-900/10 to-blue-900/10 dark:from-emerald-950/40 dark:to-slate-900 border border-emerald-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {clubSettings?.logoUrl ? (
            <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 p-1 border border-emerald-500/30 shadow-md shadow-emerald-600/10 shrink-0 flex items-center justify-center overflow-hidden">
              <img
                src={clubSettings.logoUrl}
                alt="Club Logo"
                className="w-full h-full object-contain rounded-xl"
              />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center text-xl shadow-md shadow-emerald-600/20">
              {currentSportMeta.emoji}
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
                {isBangla ? clubSettings.clubNameBangla : clubSettings.clubName}
              </h3>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                {isBangla ? currentSportMeta.nameBangla : currentSportMeta.name}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isBangla
                ? 'ব্যাডমিন্টন, ক্রিকেট ও ফুটবল টুর্নামেন্ট ও নিয়মিত সঞ্চয় তহবিল'
                : 'Badminton, Cricket & Football tournaments with monthly & weekly savings'}
            </p>
          </div>
        </div>

        {/* Sports Chips & Share */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {onOpenShare && (
            <button
              onClick={onOpenShare}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black shadow-sm transition-transform active:scale-95 shrink-0"
              title={isBangla ? 'যেকোনো মোবাইল বা ব্রাউজারে লিংক শেয়ার করতে চাপুন' : 'Share public link for any phone or browser'}
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{isBangla ? 'সবার সাথে শেয়ার' : 'Share Link'}</span>
            </button>
          )}
          {isAdmin && (
            <button
              onClick={() => onNavigate('email')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-black shadow-sm transition-transform active:scale-95 shrink-0"
              title={isBangla ? 'বকেয়া ও পরিশোধিত সদস্যদের ইমেইল রিমাইন্ডার পাঠান' : 'Open Email Reminder Dashboard'}
            >
              <span>📧</span>
              <span>{isBangla ? 'ইমেইল রিমাইন্ডার' : 'Email Center'}</span>
            </button>
          )}
          {(['badminton', 'cricket', 'football'] as SportType[]).map((st) => {
            const meta = SPORTS_MAP[st];
            const sportTournamentsCount = tournaments.filter((tr) => tr.sport === st).length;
            return (
              <button
                key={st}
                onClick={() => onNavigate('tournament')}
                className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] font-bold text-slate-700 dark:text-slate-300 hover:border-emerald-500 shadow-sm transition-all whitespace-nowrap"
              >
                <span>{meta.emoji}</span>
                <span>{isBangla ? meta.nameBangla : meta.name}</span>
                {sportTournamentsCount > 0 && (
                  <span className="ml-0.5 px-1.5 py-0.2 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[9px]">
                    {sportTournamentsCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Member Self-Registration Quick Banner */}
      {onOpenSignUp && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative overflow-hidden border border-emerald-400/30">
          <div className="flex items-center gap-3 relative z-10">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-xl shrink-0 font-bold">
              ✨
            </div>
            <div>
              <h4 className="font-black text-sm sm:text-base">
                {isBangla ? 'ক্লাবের নতুন সদস্য হতে চান?' : 'Want to join as a club member?'}
              </h4>
              <p className="text-xs text-emerald-100">
                {isBangla
                  ? 'অনলাইনে সাইন-আপ করে এখনই আপনার ৪ সংখ্যার ইউনিক মেম্বার আইডি সংগ্রহ করুন!'
                  : 'Sign up online and get your unique 4-digit Member ID instantly!'}
              </p>
            </div>
          </div>
          <button
            onClick={onOpenSignUp}
            className="px-4 py-2 bg-white hover:bg-emerald-50 text-emerald-900 rounded-xl text-xs font-black shadow-md flex items-center justify-center gap-1.5 transition-all active:scale-95 shrink-0 relative z-10"
          >
            <span>✨</span>
            <span>{isBangla ? 'অনলাইন সদস্য সাইন-আপ' : 'Sign Up Online'}</span>
          </button>
        </div>
      )}

      {/* 1. Auto-Scrolling Banner Carousel: Active Custom Funds + Weekly Target */}
      <WeeklyProgressBar
        collected={collectedThisWeek}
        target={weeklyTarget}
        weekTitle={isBangla && activeWeek.titleBangla ? activeWeek.titleBangla : activeWeek.title}
        lang={lang}
        paidMembersCount={paidCountThisWeek}
        unpaidMembersCount={unpaidCountThisWeek}
        weeklyMemberDue={weeklyMemberDueThisWeek}
        funds={funds}
        fundContributions={fundContributions}
        fundExpenses={fundExpenses}
        onNavigate={onNavigate}
      />

      {/* 2. Main Financial Dashboard Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Members */}
        <div
          onClick={() => onNavigate('members')}
          className="cursor-pointer group rounded-2xl bg-white dark:bg-slate-900 p-4 shadow-sm hover:shadow-md transition-all border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {t.total_members}
            </span>
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono">
              {formatNumber(members.length, isBangla)}
            </span>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 block mt-0.5 font-medium">
              {paidCountThisWeek > 0
                ? `${formatNumber(paidCountThisWeek, isBangla)} ${isBangla ? 'জন এ সপ্তাহে পরিশোধিত' : 'paid this week'}`
                : paidFundMembersCount > 0
                ? `${formatNumber(paidFundMembersCount, isBangla)} ${isBangla ? 'জন ফান্ডে পরিশোধিত' : 'paid in fund'}`
                : `${formatNumber(paidCountThisWeek, isBangla)} ${isBangla ? 'জন পরিশোধিত' : 'paid'}`}
            </span>
          </div>
        </div>

        {/* Custom Funds Collection Card (Highlighted so Fund money is front & center on Dashboard!) */}
        <div
          onClick={() => onNavigate('funds')}
          className="cursor-pointer group rounded-2xl bg-purple-50/70 dark:bg-purple-950/35 p-4 shadow-sm hover:shadow-md transition-all border border-purple-400/40 dark:border-purple-800 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-purple-900 dark:text-purple-200">
              {isBangla ? 'বিশেষ ফান্ডে মোট জমা' : 'Special Funds Raised'}
            </span>
            <div className="p-2 rounded-xl bg-purple-600 text-white shadow-sm">
              <Coins className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-black text-purple-700 dark:text-purple-300 font-mono">
              {formatCurrency(totalFundsCollected, isBangla)}
            </span>
            <span className="text-[11px] text-purple-600 dark:text-purple-400 block mt-0.5 font-bold truncate">
              {funds.length > 0
                ? `${funds[0].icon || '🤝'} ${isBangla && funds[0].titleBangla ? funds[0].titleBangla : funds[0].title}`
                : isBangla
                ? 'ফান্ড ড্যাশবোর্ড দেখুন'
                : 'View Funds'}
            </span>
          </div>
        </div>

        {/* Amount Collected This Week */}
        <div
          onClick={() => onNavigate('weekly')}
          className="cursor-pointer rounded-2xl bg-white dark:bg-slate-900 p-4 shadow-sm hover:shadow-md transition-all border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {t.collected_this_week}
            </span>
            <div className="p-2 rounded-xl bg-lime-50 dark:bg-lime-950/60 text-lime-600 dark:text-lime-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
              {formatCurrency(collectedThisWeek, isBangla)}
            </span>
            <span className="text-[11px] text-slate-400 block mt-0.5">
              {isBangla ? 'সাপ্তাহিক লক্ষ্য:' : 'Weekly Target:'} {formatCurrency(weeklyTarget, isBangla)}
            </span>
          </div>
        </div>

        {/* Sonsoy / Savings Vault Fund (HIGHLIGHTED FEATURE) */}
        <div
          onClick={() => onNavigate('weekly')}
          className="cursor-pointer group rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 p-4 shadow-sm hover:shadow-md transition-all border border-emerald-500/40 dark:border-emerald-800 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
              {isBangla ? 'মাসিক সঞ্চয় ও কল্যাণ তহবিল' : 'Sonsoy / Savings Vault'}
            </span>
            <div className="p-2 rounded-xl bg-emerald-600 text-white shadow-sm">
              <PiggyBank className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-black text-emerald-700 dark:text-emerald-300 font-mono">
              {formatCurrency(totalSavingsPool, isBangla)}
            </span>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 block mt-0.5 font-bold flex items-center gap-1">
              <span>{isBangla ? 'সঞ্চয় খাতা দেখুন' : 'View Savings Ledger'}</span>
              <ArrowUpRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* Amount Remaining This Week (Member Weekly Dues vs Target) */}
        <div className="rounded-2xl bg-white dark:bg-slate-900 p-4 shadow-sm border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {isBangla ? 'এ সপ্তাহে সদস্য বকেয়া' : 'Weekly Member Due'}
            </span>
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400 font-mono">
              {formatCurrency(weeklyMemberDueThisWeek, isBangla)}
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5 font-medium">
              {unpaidCountThisWeek > 0
                ? `${formatNumber(unpaidCountThisWeek, isBangla)} ${isBangla ? 'জন খেলোয়াড়ের সাপ্তাহিক ফি বাকি' : 'playing members unpaid'}`
                : isBangla
                ? 'সাপ্তাহিক কোনো বকেয়া নেই'
                : 'No weekly member dues'}
            </span>
          </div>
        </div>

        {/* Total Outstanding Due (With Explicit Breakdown of What/Who is Due!) */}
        <div
          onClick={() => onNavigate('members')}
          className="cursor-pointer rounded-2xl bg-white dark:bg-slate-900 p-4 shadow-sm hover:shadow-md transition-all border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {t.total_due}
            </span>
            <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-black text-rose-600 dark:text-rose-400 font-mono">
              {formatCurrency(totalOutstandingDue, isBangla)}
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5 font-semibold">
              {isBangla
                ? `সাপ্তাহিক: ${formatCurrency(weeklyTotalDue, true)} • ফান্ড: ${formatCurrency(totalFundsDue, true)}`
                : `Weekly: ${formatCurrency(weeklyTotalDue, false)} • Fund: ${formatCurrency(totalFundsDue, false)}`}
            </span>
            {dueBreakdownLabels.length > 0 && (
              <span className="text-[10px] text-rose-600 dark:text-rose-400 font-bold block mt-0.5 truncate">
                👉 {dueBreakdownLabels.join(', ')}
              </span>
            )}
          </div>
        </div>

        {/* Total Expenses */}
        <div
          onClick={() => onNavigate('expenses')}
          className="cursor-pointer group rounded-2xl bg-white dark:bg-slate-900 p-4 shadow-sm hover:shadow-md transition-all border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {t.total_expenses}
            </span>
            <div className="p-2 rounded-xl bg-orange-50 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono">
              {formatCurrency(totalExpenses, isBangla)}
            </span>
            <span className="text-[11px] text-orange-600 dark:text-orange-400 block mt-0.5 font-medium">
              {formatNumber(expenses.length + fundExpenses.length, isBangla)} {isBangla ? 'টি খরচ ভাউচার' : 'recorded items'}
            </span>
          </div>
        </div>

        {/* Current Balance (HIGHLIGHTED - Includes Weekly + Custom Funds!) */}
        <div className="col-span-2 rounded-2xl bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 p-5 text-white shadow-lg shadow-emerald-700/20 flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-200">
                {t.current_balance}
              </span>
              <span className="text-[10px] text-emerald-100/90 block mt-0.5">
                {isBangla
                  ? `সাপ্তাহিক (${formatCurrency(weeklyTotalCollection, true)}) + বিশেষ ফান্ড (${formatCurrency(totalFundsCollected, true)}) − মোট খরচ (${formatCurrency(totalExpenses, true)})`
                  : `Weekly (${formatCurrency(weeklyTotalCollection, false)}) + Funds (${formatCurrency(totalFundsCollected, false)}) - Expenses`}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-white/20 text-white backdrop-blur-sm">
              <Wallet className="w-5 h-5" />
            </div>
          </div>

          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-white">
              {formatCurrency(currentBalance, isBangla)}
            </span>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-white/25 text-white backdrop-blur-sm">
              {isBangla ? 'তহবিল স্থিতিশীল' : 'Fund Healthy'}
            </span>
          </div>
        </div>

        {/* Season Total Collection */}
        <div
          onClick={() => onNavigate('reports')}
          className="col-span-2 lg:col-span-4 cursor-pointer group rounded-2xl bg-white dark:bg-slate-900 p-4 shadow-sm hover:shadow-md transition-all border border-slate-200/80 dark:border-slate-800 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">
                {t.season_collection} ({season.name})
              </span>
              <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-mono">
                {formatCurrency(seasonTotalCollection, isBangla)}
              </span>
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold block">
                {isBangla
                  ? `সাপ্তাহিক আদায়: ${formatCurrency(weeklyTotalCollection, true)} • বিশেষ ফান্ড আদায়: ${formatCurrency(totalFundsCollected, true)}`
                  : `Weekly: ${formatCurrency(weeklyTotalCollection, false)} • Special Funds: ${formatCurrency(totalFundsCollected, false)}`}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 group-hover:translate-x-1 transition-transform">
            <span>{t.reports_title}</span>
            <ArrowUpRight className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* 3. Quick Action Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-6 gap-2.5">
        {onOpenIdSearch && (
          <button
            onClick={onOpenIdSearch}
            className="col-span-2 sm:col-span-2 flex items-center justify-center gap-2 p-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-black shadow-md shadow-emerald-600/20 transition-all active:scale-[0.99]"
          >
            <span className="text-sm">🔍</span>
            <span>{isBangla ? '৪ সংখ্যার মেম্বার আইডি সার্চ' : '4-Digit Member ID Search'}</span>
            <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded font-mono">#1001</span>
          </button>
        )}

        <button
          onClick={() => onNavigate('leaderboard')}
          className="flex items-center justify-center gap-2 p-3 rounded-xl bg-amber-500/15 border border-amber-500/30 hover:bg-amber-500/25 text-amber-800 dark:text-amber-300 text-xs font-extrabold shadow-sm transition-all"
        >
          <Trophy className="w-4 h-4 text-amber-500" />
          <span>{isBangla ? '🏆 সেরা তারকা' : '🏆 Hall of Fame'}</span>
        </button>

        <button
          onClick={() => onNavigate('funds')}
          className="flex items-center justify-center gap-2 p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 hover:bg-purple-500/20 text-purple-700 dark:text-purple-300 text-xs font-bold shadow-sm transition-all"
        >
          <Coins className="w-4 h-4 text-purple-500" />
          <span>{isBangla ? 'বিশেষ ফান্ডিং' : 'Funds'}</span>
        </button>

        <button
          onClick={() => onNavigate('weekly')}
          className="flex items-center justify-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs font-bold shadow-sm transition-all"
        >
          <PiggyBank className="w-4 h-4 text-emerald-600" />
          <span>{isBangla ? 'সঞ্চয় খাতা' : 'Sonsoy'}</span>
        </button>

        <button
          onClick={() => onNavigate('picnic')}
          className="flex items-center justify-center gap-2 p-3 rounded-xl bg-orange-500/10 border border-orange-500/20 hover:bg-orange-500/20 text-orange-700 dark:text-orange-300 text-xs font-bold shadow-sm transition-all"
        >
          <UtensilsCrossed className="w-4 h-4 text-orange-500" />
          <span>{isBangla ? 'পিকনিক বাজেট' : 'Picnic Plan'}</span>
        </button>

        <a
          href={clubSettings.messengerLink || 'https://m.me/'}
          target="_blank"
          rel="noopener noreferrer"
          className="col-span-2 sm:col-span-1 flex items-center justify-center gap-1.5 p-3 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 text-blue-700 dark:text-blue-300 text-xs font-bold shadow-sm transition-all"
          title={isBangla ? 'মেসেঞ্জারে ক্লাবের সাথে যুক্ত হোন' : 'Connect on Messenger'}
        >
          <MessageCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span>{isBangla ? 'মেসেঞ্জার' : 'Messenger'}</span>
        </a>
      </div>

      {/* 3.0 Founder & Chief Admin Identity Showcase (Informational Only - No Admin Controls) */}
      {adminProfile && (
        <div className="rounded-3xl bg-gradient-to-r from-emerald-600/10 via-teal-600/10 to-amber-500/10 dark:from-emerald-950/40 dark:via-teal-950/30 dark:to-amber-950/30 p-4 sm:p-5 border border-emerald-500/20 dark:border-emerald-500/20 shadow-sm relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
            <div className="relative flex-shrink-0">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden ring-2 ring-emerald-500/30 shadow-md bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-2xl font-black">
                {adminProfile.photoUrl ? (
                  <img
                    src={adminProfile.photoUrl}
                    alt={adminProfile.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>👑</span>
                )}
              </div>
              <div className="absolute -bottom-1 -right-1 p-1 rounded-full bg-emerald-600 text-white shadow">
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="flex-1 text-center sm:text-left min-w-0">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                  <Crown className="w-3 h-3 text-amber-500" />
                  {isBangla ? 'প্রতিষ্ঠাতা ও প্রধান অ্যাডমিন' : 'Club Founder & Chief Admin'}
                </span>
                {adminProfile.location && (
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {adminProfile.location}
                  </span>
                )}
              </div>

              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white truncate">
                {isBangla ? adminProfile.banglaName || adminProfile.name : adminProfile.name}
              </h3>
              <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mb-1.5">
                {adminProfile.designation}
              </p>
              {adminProfile.bio && (
                <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                  {adminProfile.bio}
                </p>
              )}

              {/* Quick Contact & View Profile Buttons */}
              <div className="mt-3 flex flex-wrap items-center justify-center sm:justify-start gap-2">
                {onOpenAdminProfile && (
                  <button
                    type="button"
                    onClick={onOpenAdminProfile}
                    className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold shadow-sm flex items-center gap-1.5 transition-transform active:scale-95"
                  >
                    <Crown className="w-3.5 h-3.5 text-amber-300" />
                    <span>{isBangla ? 'পরিচিতি বিস্তারিত দেখুন' : 'View Full Profile'}</span>
                  </button>
                )}
                {adminProfile.phone && (
                  <a
                    href={`tel:${adminProfile.phone}`}
                    className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-1 transition-colors"
                  >
                    <Phone className="w-3 h-3 text-emerald-500" />
                    <span>{adminProfile.phone}</span>
                  </a>
                )}
                {adminProfile.messengerUrl && (
                  <a
                    href={adminProfile.messengerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2.5 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-300 text-xs font-bold flex items-center gap-1 transition-colors"
                  >
                    <MessageCircle className="w-3 h-3" />
                    <span>Messenger</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3.1 Demographic & Custom Funds Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
        {/* Demographic Breakdown Card */}
        <div className="rounded-2xl bg-white dark:bg-slate-900 p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                    {isBangla ? 'সদস্য বয়স ও ভূমিকা বণ্টন' : 'Member Age & Role Distribution'}
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    {isBangla ? 'বাচ্চা, কিশোর, যুবক ও পৃষ্ঠপোষক সদস্য' : 'Child, Teen, Youth & Patrons'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => onNavigate('members')}
                className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
              >
                <span>{isBangla ? 'তালিকা' : 'View'}</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-4 gap-2 text-center pt-1">
              <div className="p-2.5 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40">
                <span className="text-base block">🧒</span>
                <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mt-0.5">
                  {isBangla ? 'বাচ্চা' : 'Child'}
                </span>
                <span className="text-base font-black font-mono text-amber-700 dark:text-amber-300">
                  {formatNumber(childCount, isBangla)}
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-900/40">
                <span className="text-base block">🧑‍🦱</span>
                <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mt-0.5">
                  {isBangla ? 'কিশোর' : 'Teen'}
                </span>
                <span className="text-base font-black font-mono text-blue-700 dark:text-blue-300">
                  {formatNumber(teenCount, isBangla)}
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-900/40">
                <span className="text-base block">👨‍🦱</span>
                <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mt-0.5">
                  {isBangla ? 'যুবক' : 'Youth'}
                </span>
                <span className="text-base font-black font-mono text-emerald-700 dark:text-emerald-300">
                  {formatNumber(youthCount, isBangla)}
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-200/60 dark:border-purple-900/40">
                <span className="text-base block">🏛️</span>
                <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mt-0.5">
                  {isBangla ? 'পৃষ্ঠপোষক' : 'Patron'}
                </span>
                <span className="text-base font-black font-mono text-purple-700 dark:text-purple-300">
                  {formatNumber(patronsOnlyCount, isBangla)}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
            <span>{isBangla ? 'খেলার সদস্য' : 'Playing members'}: {formatNumber(members.length - patronsOnlyCount, isBangla)}</span>
            <span>{isBangla ? 'শুধু ফান্ডিং দাতা' : 'Donors only'}: {formatNumber(patronsOnlyCount, isBangla)}</span>
          </div>
        </div>

        {/* Custom Funds Summary Card */}
        <div className="rounded-2xl bg-white dark:bg-slate-900 p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400">
                  <Coins className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                    {isBangla ? 'ক্লাব বিশেষ ফান্ডসমূহ' : 'Special Funds & Projects'}
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    {formatNumber(funds.length, isBangla)} {isBangla ? 'টি ফান্ড পরিচালিত হচ্ছে' : 'active funds'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => onNavigate('funds')}
                className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1"
              >
                <span>{isBangla ? 'ফান্ডিং ড্যাশবোর্ড' : 'Manage'}</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl">
              <div>
                <span className="text-[10px] text-slate-400 block font-semibold">
                  {isBangla ? 'মোট আদায়' : 'Total Raised'}
                </span>
                <span className="text-sm sm:text-base font-black font-mono text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(totalFundsCollected, isBangla)}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-semibold">
                  {isBangla ? 'মোট ব্যয়/বিতরণ' : 'Disbursed'}
                </span>
                <span className="text-sm sm:text-base font-black font-mono text-rose-500">
                  {formatCurrency(totalFundsDisbursed, isBangla)}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-semibold">
                  {isBangla ? 'বর্তমান স্থিতি' : 'Net Balance'}
                </span>
                <span className="text-sm sm:text-base font-black font-mono text-purple-600 dark:text-purple-400">
                  {formatCurrency(netFundsBalance, isBangla)}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-3 pt-2 flex items-center justify-between gap-1 overflow-x-auto">
            {funds.slice(0, 3).map((f) => (
              <span
                key={f.id}
                onClick={() => onNavigate('funds')}
                className="cursor-pointer text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 truncate max-w-[120px] hover:bg-purple-100"
              >
                {f.icon || '💰'} {isBangla && f.titleBangla ? f.titleBangla : f.title}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Current Week & Custom Fund Collection Status List */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 p-5 shadow-sm border border-slate-200/80 dark:border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2 flex-wrap">
              <span>
                {isBangla ? 'চলতি সপ্তাহের চাঁদা ও ফান্ড তালিকা' : 'Weekly & Fund Payment Status'}
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                {isBangla && activeWeek.titleBangla ? activeWeek.titleBangla : activeWeek.title}
              </span>
              {isActiveWeekUpcoming && (
                <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-full bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300">
                  {isBangla ? '🗓️ আসন্ন (বকেয়া প্রযোজ্য নয়)' : '🗓️ Upcoming (No Due)'}
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isBangla
                ? 'সদস্যের প্রোফাইল ও সম্পূর্ণ হিসাব দেখতে নামের উপর ক্লিক করুন'
                : 'Click any member to open profile and payment history'}
            </p>
          </div>

          <button
            onClick={() => onNavigate('members')}
            className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
          >
            <span>{isBangla ? 'সব দেখুন' : 'View All'}</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {members.slice(0, 7).map((member) => {
            const isPatronOnly = member.participatesInSports === false;
            const pay = currentWeekPayments.find((p) => p.memberId === member.id);
            const status = pay ? pay.status : 'UNPAID';
            const paid = pay ? pay.paidAmount : 0;
            const expected = isPatronOnly && paid === 0 ? 0 : pay ? pay.expectedAmount : member.weeklyAmount;
            const memberName = isBangla && member.banglaName ? member.banglaName : member.name;

            // Member's total custom fund contributions
            const memberFundContribs = fundContributions.filter((fc) => fc.memberId === member.id);
            const memberFundPaid = memberFundContribs.reduce((sum, fc) => sum + (fc.paidAmount || 0), 0);

            return (
              <div
                key={member.id}
                onClick={() => onSelectMember(member)}
                className="py-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 px-2 rounded-xl transition-colors cursor-pointer gap-2"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden flex items-center justify-center font-bold text-xs text-slate-700 dark:text-slate-300 flex-shrink-0">
                    {member.avatar ? (
                      <img src={member.avatar} alt={memberName} className="w-full h-full object-cover" />
                    ) : (
                      memberName.charAt(0)
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-bold text-sm text-slate-900 dark:text-white truncate">
                        {memberName}
                      </span>
                      {member.memberCode && (
                        <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                          #{member.memberCode}
                        </span>
                      )}
                      {isPatronOnly && (
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-indigo-100 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300">
                          {isBangla ? '🏛️ শুধু ফান্ডিং' : '🏛️ Patron'}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-wrap mt-0.5">
                      <span className="text-[11px] text-slate-400">
                        {member.role} • {member.phone}
                      </span>
                      {memberFundPaid > 0 && (
                        <span className="text-[10px] font-extrabold px-1.5 py-0.2 rounded-full bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300">
                          🤝 {isBangla ? 'ফান্ড জমা:' : 'Fund:'} {formatCurrency(memberFundPaid, isBangla)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 flex-shrink-0">
                  {isPatronOnly && paid === 0 ? (
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/50">
                      {isBangla ? 'সাপ্তাহিক চাঁদা প্রযোজ্য নয়' : 'No Weekly Fee'}
                    </span>
                  ) : member.contributionType === 'monthly' && paid === 0 ? (
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-300 border border-purple-200/60 dark:border-purple-800/50">
                      {isBangla ? '🗓️ মাসিক চাঁদা প্রযোজ্য' : '🗓️ Monthly Plan'}
                    </span>
                  ) : (
                    <>
                      <div className="text-right">
                        <span className="text-sm font-extrabold font-mono text-slate-900 dark:text-white block">
                          {formatCurrency(paid, isBangla)}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          / {formatCurrency(expected, isBangla)}
                        </span>
                      </div>

                      <StatusBadge
                        status={status}
                        isUpcoming={isActiveWeekUpcoming && paid === 0}
                        lang={lang}
                        size="sm"
                      />
                    </>
                  )}

                  {pay && pay.paidAmount > 0 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenReceipt(member, pay, activeWeek);
                      }}
                      title={t.view_receipt}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/60"
                    >
                      <Receipt className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

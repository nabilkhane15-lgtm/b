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
  Maximize2,
} from 'lucide-react';
import { ImageLightboxModal } from '../components/ImageLightboxModal';

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
  adminProfile?: AdminProfile;
  onOpenAdminProfile?: () => void;
  onOpenSignUp?: () => void;
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
  adminProfile,
  onOpenAdminProfile,
  onOpenSignUp,
}) => {
  const t = translations[lang];
  const isBangla = lang === 'bn';

  const [selectedSportFilter, setSelectedSportFilter] = useState<SportType | 'all'>('all');
  const [isPhotoLightboxOpen, setIsPhotoLightboxOpen] = useState(false);

  // Sonsoy / Savings vault total
  const totalSavingsPool = savingsDeposits.reduce(
    (acc, d) => (d.type === 'DEPOSIT' ? acc + d.amount : acc - d.amount),
    0
  );

  // Custom Funds summary
  const totalFundsCollected = fundContributions.reduce((acc, c) => acc + c.paidAmount, 0);
  const totalFundsDisbursed = fundExpenses.reduce((acc, e) => acc + e.amount, 0);
  const netFundsBalance = totalFundsCollected - totalFundsDisbursed;

  // Demographic statistics
  const childCount = members.filter((m) => m.memberCategory === 'child').length;
  const teenCount = members.filter((m) => m.memberCategory === 'teen').length;
  const youthCount = members.filter((m) => (m.memberCategory || 'youth') === 'youth').length;
  const patronsOnlyCount = members.filter((m) => m.participatesInSports === false).length;

  // Current Week Payments
  const currentWeekPayments = activeWeek ? payments.filter((p) => p.weekId === activeWeek.id) : [];
  const collectedThisWeek = currentWeekPayments.reduce((acc, p) => acc + p.paidAmount, 0);
  const weeklyTarget = activeWeek?.weeklyTarget || season?.weeklyTarget || 5000;
  const remainingThisWeek = Math.max(weeklyTarget - collectedThisWeek, 0);

  // Season Overall Totals
  const seasonTotalCollection = payments.reduce((acc, p) => acc + p.paidAmount, 0);
  const seasonTotalExpected = payments.reduce((acc, p) => acc + p.expectedAmount, 0);
  const totalOutstandingDue = Math.max(seasonTotalExpected - seasonTotalCollection, 0);
  const totalExpenses = expenses.reduce((acc, e) => acc + e.amount, 0);

  // Explicit Formula requested: Current Balance = Total Collection - Total Expenses
  const currentBalance = seasonTotalCollection - totalExpenses;

  // Paid vs Unpaid members this week
  const paidCountThisWeek = currentWeekPayments.filter((p) => p.status === 'PAID').length;
  const partialCountThisWeek = currentWeekPayments.filter((p) => p.status === 'PARTIAL').length;
  const unpaidCountThisWeek = currentWeekPayments.filter((p) => p.status === 'UNPAID').length;

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

      {/* 1. Weekly Target Visual Progress Bar */}
      <WeeklyProgressBar
        collected={collectedThisWeek}
        target={weeklyTarget}
        weekTitle={isBangla && activeWeek.titleBangla ? activeWeek.titleBangla : activeWeek.title}
        lang={lang}
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
              {formatNumber(paidCountThisWeek, isBangla)} {isBangla ? 'জন পরিশোধিত' : 'paid this week'}
            </span>
          </div>
        </div>

        {/* Weekly Collection Target */}
        <div className="rounded-2xl bg-white dark:bg-slate-900 p-4 shadow-sm border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {t.weekly_target}
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono">
              {formatCurrency(weeklyTarget, isBangla)}
            </span>
            <span className="text-[11px] text-slate-400 block mt-0.5">
              {isBangla && activeWeek.titleBangla ? activeWeek.titleBangla : activeWeek.title}
            </span>
          </div>
        </div>

        {/* Amount Collected This Week */}
        <div className="rounded-2xl bg-white dark:bg-slate-900 p-4 shadow-sm border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between">
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
              {isBangla ? 'লক্ষ্যের' : 'Of Target'} {weeklyTarget > 0 ? Math.round((collectedThisWeek / weeklyTarget) * 100) : 0}%
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

        {/* Amount Remaining This Week */}
        <div className="rounded-2xl bg-white dark:bg-slate-900 p-4 shadow-sm border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {t.amount_remaining}
            </span>
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400 font-mono">
              {formatCurrency(remainingThisWeek, isBangla)}
            </span>
            <span className="text-[11px] text-rose-500 block mt-0.5 font-medium">
              {formatNumber(unpaidCountThisWeek, isBangla)} {isBangla ? 'জন বকেয়া' : 'unpaid'}
            </span>
          </div>
        </div>

        {/* Total Outstanding Due */}
        <div className="rounded-2xl bg-white dark:bg-slate-900 p-4 shadow-sm border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between">
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
            <span className="text-[11px] text-slate-400 block mt-0.5">
              {isBangla ? 'পুরো সিজনের সর্বমোট' : 'Full season dues'}
            </span>
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
              {formatNumber(expenses.length, isBangla)} {isBangla ? 'টি খরচ ভাউচার' : 'recorded items'}
            </span>
          </div>
        </div>

        {/* Current Balance (HIGHLIGHTED) */}
        <div className="col-span-2 rounded-2xl bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 p-5 text-white shadow-lg shadow-emerald-700/20 flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-200">
                {t.current_balance}
              </span>
              <span className="text-[10px] text-emerald-100/80 block mt-0.5">
                {t.calc_formula}
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

      {/* Admin / Founder Profile Quick Showcase Card */}
      {adminProfile && onOpenAdminProfile && (
        <div className="rounded-3xl bg-gradient-to-r from-emerald-600/10 via-teal-600/10 to-amber-500/10 dark:from-emerald-950/40 dark:via-teal-950/30 dark:to-amber-950/20 p-4 sm:p-5 border border-emerald-300/70 dark:border-emerald-800/60 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-center sm:text-left">
            <div className="relative shrink-0 group">
              <div
                onClick={() => {
                  if (adminProfile.photoUrl || (adminProfile.photos && adminProfile.photos.length > 0)) {
                    setIsPhotoLightboxOpen(true);
                  } else {
                    onOpenAdminProfile();
                  }
                }}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-white dark:bg-slate-900 border-2 border-emerald-500 shadow-lg p-0.5 flex items-center justify-center cursor-pointer transition-transform hover:scale-105 active:scale-95 relative"
                title={isBangla ? 'ক্লিক করে পুরো ছবি বড় আকারে দেখুন' : 'Click to view full image'}
              >
                {adminProfile.photoUrl ? (
                  <img
                    src={adminProfile.photoUrl}
                    alt={adminProfile.name}
                    className="w-full h-full object-cover rounded-xl"
                  />
                ) : (
                  <div className="w-full h-full rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-700 text-white flex items-center justify-center text-2xl font-black">
                    {adminProfile.name.charAt(0)}
                  </div>
                )}

                {/* Hover overlay */}
                {adminProfile.photoUrl && (
                  <div className="absolute inset-0.5 rounded-xl bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                    <Maximize2 className="w-4 h-4 text-emerald-300" />
                  </div>
                )}
              </div>
              <span className="absolute -bottom-1 -right-1 bg-amber-500 text-white text-[9px] font-black px-1.5 py-0.2 rounded-full shadow border border-white">
                👑
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2 justify-center sm:justify-start flex-wrap">
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-500 text-white">
                  {adminProfile.designation || 'প্রধান অ্যাডমিন'}
                </span>
                {adminProfile.photos && adminProfile.photos.length > 1 && (
                  <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/80 px-2 py-0.5 rounded-full">
                    {adminProfile.photos.length} {isBangla ? 'টি ছবি' : 'Photos'}
                  </span>
                )}
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {isBangla ? 'অ্যাপ নির্মাতা ও সমন্বয়ক' : 'Creator & Admin'}
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white mt-0.5">
                {isBangla && adminProfile.banglaName ? adminProfile.banglaName : adminProfile.name}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-1 max-w-md">
                {adminProfile.bio}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-stretch sm:self-auto justify-center">
            {adminProfile.whatsappNumber && (
              <a
                href={`https://wa.me/${adminProfile.whatsappNumber.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                title="WhatsApp"
                className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 transition-colors"
              >
                💬
              </a>
            )}
            <button
              onClick={onOpenAdminProfile}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs shadow-sm transition-all flex items-center gap-1.5 active:scale-95 whitespace-nowrap"
            >
              <span>👑</span>
              <span>{isBangla ? 'সম্পূর্ণ পরিচিতি ও সোশ্যাল লিংক' : 'View Admin Profile'}</span>
            </button>
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

      {/* 4. Current Week Collection Status List */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 p-5 shadow-sm border border-slate-200/80 dark:border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <span>
                {isBangla ? 'চলতি সপ্তাহের চাঁদা তালিকা' : 'This Week Payment Status'}
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                {isBangla && activeWeek.titleBangla ? activeWeek.titleBangla : activeWeek.title}
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isBangla
                ? 'সদস্যের প্রোফাইল দেখতে নামের উপর ক্লিক করুন'
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
            const pay = currentWeekPayments.find((p) => p.memberId === member.id);
            const status = pay ? pay.status : 'UNPAID';
            const paid = pay ? pay.paidAmount : 0;
            const expected = pay ? pay.expectedAmount : member.weeklyAmount;
            const memberName = isBangla && member.banglaName ? member.banglaName : member.name;

            return (
              <div
                key={member.id}
                onClick={() => onSelectMember(member)}
                className="py-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 px-2 rounded-xl transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-xs text-slate-700 dark:text-slate-300">
                    {memberName.charAt(0)}
                  </div>
                  <div>
                    <span className="font-bold text-sm text-slate-900 dark:text-white block">
                      {memberName}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {member.role} • {member.phone}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-sm font-extrabold font-mono text-slate-900 dark:text-white block">
                      {formatCurrency(paid, isBangla)}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      / {formatCurrency(expected, isBangla)}
                    </span>
                  </div>

                  <StatusBadge status={status} lang={lang} size="sm" />

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

      {/* Admin Photo Fullscreen Lightbox */}
      {adminProfile && (
        <ImageLightboxModal
          isOpen={isPhotoLightboxOpen}
          onClose={() => setIsPhotoLightboxOpen(false)}
          images={
            adminProfile.photos && adminProfile.photos.length > 0
              ? adminProfile.photos
              : adminProfile.photoUrl
              ? [adminProfile.photoUrl]
              : []
          }
          title={isBangla && adminProfile.banglaName ? adminProfile.banglaName : adminProfile.name}
          subtitle={adminProfile.designation || (isBangla ? 'অ্যাপ প্রতিষ্ঠাতা ও প্রধান অ্যাডমিন' : 'Admin & Founder')}
          lang={lang}
        />
      )}
    </div>
  );
};

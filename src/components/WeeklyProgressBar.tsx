import React, { useState, useEffect } from 'react';
import { formatCurrency, formatNumber, Language } from '../utils/language';
import {
  CustomFund,
  FundContribution,
  FundExpense,
  TabType,
} from '../types';
import {
  Target,
  TrendingUp,
  Coins,
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
  Users,
  Wallet,
} from 'lucide-react';

interface Props {
  collected: number;
  target: number;
  weekTitle: string;
  lang: Language;
  paidMembersCount?: number;
  unpaidMembersCount?: number;
  weeklyMemberDue?: number;
  funds?: CustomFund[];
  fundContributions?: FundContribution[];
  fundExpenses?: FundExpense[];
  onNavigate?: (tab: TabType) => void;
}

export const WeeklyProgressBar: React.FC<Props> = ({
  collected,
  target,
  weekTitle,
  lang,
  paidMembersCount = 0,
  unpaidMembersCount = 0,
  weeklyMemberDue = 0,
  funds = [],
  fundContributions = [],
  fundExpenses = [],
  onNavigate,
}) => {
  const isBangla = lang === 'bn';
  const [activeSlide, setActiveSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Build slides: All active Custom Funds + Weekly Target
  const activeFunds = funds.filter((f) => f.status === 'ACTIVE');

  // Put active funds first if any exist so user immediately sees their created fund(s) alongside weekly target, and auto-scrolls through all of them!
  const slides = [
    ...activeFunds.map((fund) => {
      const contribs = fundContributions.filter((c) => c.fundId === fund.id);
      const exps = fundExpenses.filter((e) => e.fundId === fund.id);
      const raised = contribs.reduce((acc, c) => acc + (c.paidAmount || 0), 0);
      const expectedTotal = contribs.reduce((acc, c) => acc + (c.expectedAmount || 0), 0);
      const memberDue = Math.max(0, expectedTotal - raised);
      const spent = exps.reduce((acc, e) => acc + (e.amount || 0), 0);
      const netBalance = raised - spent;
      const fundTarget = fund.targetAmount || expectedTotal || 1000;
      const pct = fundTarget > 0 ? Math.min(100, Math.round((raised / fundTarget) * 100)) : 0;
      const remainingToTarget = Math.max(0, fundTarget - raised);
      const paidCount = contribs.filter((c) => c.status === 'PAID').length;
      const unpaidCount = contribs.filter((c) => c.status !== 'PAID').length;

      return {
        type: 'fund' as const,
        id: fund.id,
        icon: fund.icon || '🤝',
        badge: isBangla ? 'বিশেষ তহবিল / ফান্ড ড্যাশবোর্ড' : 'Special Fund Dashboard',
        title: isBangla && fund.titleBangla ? fund.titleBangla : fund.title,
        subtitle: fund.description || fund.category,
        collected: raised,
        target: fundTarget,
        remainingToTarget,
        memberDue,
        netBalance,
        spent,
        percentage: pct,
        paidCount,
        unpaidCount,
        tab: 'funds' as TabType,
      };
    }),
    {
      type: 'weekly' as const,
      id: 'weekly-target',
      icon: '🏸',
      badge: isBangla ? 'সাপ্তাহিক সংগ্রহের লক্ষ্যমাত্রা' : 'Weekly Collection Target',
      title: weekTitle,
      subtitle: isBangla
        ? 'চলতি সপ্তাহের নিয়মিত খেলার চাঁদা ও লক্ষ্যমাত্রা'
        : 'Current week regular sports fee collection & target',
      collected,
      target,
      remainingToTarget: Math.max(0, target - collected),
      memberDue: weeklyMemberDue,
      netBalance: collected,
      spent: 0,
      percentage: target > 0 ? Math.min(100, Math.round((collected / target) * 100)) : 0,
      paidCount: paidMembersCount,
      unpaidCount: unpaidMembersCount,
      tab: 'weekly' as TabType,
    },
  ];

  const totalSlides = slides.length;

  // Reset slide index if slides length changes
  useEffect(() => {
    if (activeSlide >= totalSlides) {
      setActiveSlide(0);
    }
  }, [totalSlides, activeSlide]);

  // Auto-scroll every 3.5 seconds when there are multiple slides
  useEffect(() => {
    if (totalSlides <= 1 || isPaused) return;
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % totalSlides);
    }, 3500);
    return () => clearInterval(timer);
  }, [totalSlides, isPaused]);

  const current = slides[activeSlide] || slides[0];
  const isFundSlide = current.type === 'fund';

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveSlide((prev) => (prev + 1) % totalSlides);
  };

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
      className={`relative overflow-hidden rounded-3xl p-5 sm:p-6 text-white shadow-xl border transition-all duration-500 ${
        isFundSlide
          ? 'bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-950 border-indigo-500/40'
          : 'bg-gradient-to-br from-emerald-800 via-emerald-900 to-slate-950 border-emerald-600/50'
      }`}
    >
      {/* Decorative Background Watermark Icon */}
      <div className="absolute right-4 -bottom-4 opacity-15 text-8xl sm:text-9xl select-none pointer-events-none font-bold transition-transform duration-500">
        {current.icon}
      </div>

      <div className="relative z-10">
        {/* Top Row: Slide Type Badge + Slide Counter / Percentage */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span
              className={`p-1.5 rounded-xl text-base flex items-center justify-center shadow-sm ${
                isFundSlide
                  ? 'bg-indigo-500/30 text-indigo-200 border border-indigo-400/30'
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
              }`}
            >
              {isFundSlide ? <Coins className="w-4 h-4" /> : <Target className="w-4 h-4" />}
            </span>
            <div>
              <div className="flex items-center gap-1.5">
                <span
                  className={`text-[10px] sm:text-xs font-extrabold uppercase tracking-wider ${
                    isFundSlide ? 'text-indigo-200' : 'text-emerald-200'
                  }`}
                >
                  {current.badge}
                </span>
                {totalSlides > 1 && (
                  <span className="px-2 py-0.2 rounded-full bg-white/15 text-[10px] font-mono font-bold text-white">
                    {formatNumber(activeSlide + 1, isBangla)}/{formatNumber(totalSlides, isBangla)}
                  </span>
                )}
              </div>
              <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-1.5 mt-0.5">
                <span>{current.icon}</span>
                <span>{current.title}</span>
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="inline-flex items-center gap-1 rounded-full bg-lime-400/20 px-2.5 py-1 text-xs font-extrabold text-lime-300 border border-lime-400/40">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>
                {formatNumber(current.percentage, isBangla)}% {isBangla ? 'সম্পন্ন' : 'Done'}
              </span>
            </div>

            {onNavigate && (
              <button
                type="button"
                onClick={() => onNavigate(current.tab)}
                className="px-2.5 py-1 rounded-full bg-white/15 hover:bg-white/25 text-white text-[11px] font-bold flex items-center gap-1 border border-white/20 transition-all"
              >
                <span>{isBangla ? 'বিস্তারিত' : 'Details'}</span>
                <ArrowUpRight className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Subtitle if available */}
        {current.subtitle && (
          <p className="text-xs text-slate-300/90 mb-3 line-clamp-1">{current.subtitle}</p>
        )}

        {/* Main Numbers Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-3.5 bg-black/25 backdrop-blur-sm p-3 rounded-2xl border border-white/10">
          {/* Collected / Raised */}
          <div>
            <span className="text-[10px] text-slate-300 block font-semibold">
              {isFundSlide
                ? isBangla
                  ? 'ফান্ডে মোট জমা'
                  : 'Total Raised'
                : isBangla
                ? 'এ সপ্তাহে আদায়'
                : 'Collected'}
            </span>
            <span className="text-lg sm:text-2xl font-black text-emerald-300 font-mono">
              {formatCurrency(current.collected, isBangla)}
            </span>
          </div>

          {/* Target */}
          <div>
            <span className="text-[10px] text-slate-300 block font-semibold">
              {isBangla ? 'মোট লক্ষ্যমাত্রা' : 'Target Goal'}
            </span>
            <span className="text-lg sm:text-2xl font-black text-white font-mono">
              {formatCurrency(current.target, isBangla)}
            </span>
          </div>

          {/* Member Due in this Fund/Week */}
          <div>
            <span className="text-[10px] text-slate-300 block font-semibold">
              {isBangla ? 'সদস্যদের বকেয়া' : 'Member Dues'}
            </span>
            <span
              className={`text-lg sm:text-2xl font-black font-mono ${
                current.memberDue > 0 ? 'text-rose-300' : 'text-lime-300'
              }`}
            >
              {formatCurrency(current.memberDue, isBangla)}
            </span>
          </div>

          {/* Remaining to Target OR Net Vault Balance */}
          <div>
            <span className="text-[10px] text-slate-300 block font-semibold">
              {isFundSlide
                ? isBangla
                  ? 'হাতে নিট ব্যালেন্স'
                  : 'Net Fund Balance'
                : isBangla
                ? 'লক্ষ্যমাত্রা বাকি'
                : 'Target Remaining'}
            </span>
            <span className="text-lg sm:text-2xl font-black text-amber-300 font-mono">
              {isFundSlide
                ? formatCurrency(current.netBalance, isBangla)
                : current.remainingToTarget > 0
                ? formatCurrency(current.remainingToTarget, isBangla)
                : isBangla
                ? '🎯 অর্জিত!'
                : '🎯 Reached!'}
            </span>
          </div>
        </div>

        {/* Visual Progress Bar */}
        <div className="relative h-3.5 w-full rounded-full bg-slate-900/90 p-0.5 overflow-hidden border border-white/15">
          <div
            className={`h-full rounded-full transition-all duration-700 ease-out ${
              isFundSlide
                ? 'bg-gradient-to-r from-fuchsia-400 via-purple-400 to-indigo-400 shadow-[0_0_12px_rgba(192,132,252,0.6)]'
                : 'bg-gradient-to-r from-lime-400 via-emerald-400 to-teal-400 shadow-[0_0_12px_rgba(74,222,128,0.5)]'
            }`}
            style={{ width: `${Math.max(current.percentage, current.collected > 0 ? 6 : 0)}%` }}
          />
        </div>

        {/* Bottom Status & Carousel Controls */}
        <div className="flex flex-wrap items-center justify-between gap-2 mt-3 pt-1">
          <div className="flex items-center gap-3 text-[11px] font-semibold text-slate-200">
            <span className="flex items-center gap-1">
              <span>✅ {isBangla ? 'পরিশোধিত:' : 'Paid:'}</span>
              <strong className="text-lime-300">{formatNumber(current.paidCount, isBangla)} {isBangla ? 'জন' : ''}</strong>
            </span>
            <span className="text-white/30">•</span>
            <span className="flex items-center gap-1">
              <span>❌ {isBangla ? 'বকেয়া:' : 'Unpaid:'}</span>
              <strong className="text-rose-300">{formatNumber(current.unpaidCount, isBangla)} {isBangla ? 'জন' : ''}</strong>
            </span>
            {isFundSlide && current.spent > 0 && (
              <>
                <span className="text-white/30">•</span>
                <span>
                  {isBangla ? 'খরচ:' : 'Spent:'}{' '}
                  <strong className="text-amber-300">{formatCurrency(current.spent, isBangla)}</strong>
                </span>
              </>
            )}
          </div>

          {/* Slide Navigation Dots & Prev/Next Buttons */}
          {totalSlides > 1 && (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handlePrev}
                className="p-1 rounded-lg bg-white/10 hover:bg-white/25 text-white transition-colors"
                title={isBangla ? 'পূর্ববর্তী' : 'Previous'}
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>

              <div className="flex items-center gap-1 px-1">
                {slides.map((s, idx) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setActiveSlide(idx)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      idx === activeSlide
                        ? 'w-6 bg-lime-400 shadow-sm'
                        : 'w-2 bg-white/35 hover:bg-white/60'
                    }`}
                    title={s.title}
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={handleNext}
                className="p-1 rounded-lg bg-white/10 hover:bg-white/25 text-white transition-colors"
                title={isBangla ? 'পরবর্তী' : 'Next'}
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

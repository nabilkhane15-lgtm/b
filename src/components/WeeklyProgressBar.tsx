import React, { useState, useEffect, useMemo } from 'react';
import { Flame, CheckCircle2, Clock, Sparkles, ChevronLeft, ChevronRight, HeartHandshake } from 'lucide-react';
import { CustomFund, FundContribution, FundExpense, TabType } from '../types';
import { Language, translations, formatCurrency } from '../utils/language';
import { calculateFundMetrics } from '../utils/accounting';

export interface FundBannerItem {
  id: string;
  name: string;
  banglaName: string;
  icon: string;
  target: number;
  collected: number;
  paidCount: number;
  totalMembers: number;
}

interface Props {
  lang: Language;
  weekLabel?: string;
  weekTitle?: string;
  target: number;
  collected: number;
  paidCount?: number;
  paidMembersCount?: number;
  unpaidMembersCount?: number;
  weeklyMemberDue?: number;
  totalMembers?: number;
  funds?: CustomFund[];
  fundContributions?: FundContribution[];
  fundExpenses?: FundExpense[];
  fundBanners?: FundBannerItem[];
  onNavigate?: (tab: TabType) => void;
  onSelectFundTab?: () => void;
}

export const WeeklyProgressBar: React.FC<Props> = ({
  lang,
  weekLabel,
  weekTitle,
  target,
  collected,
  paidCount,
  paidMembersCount = 0,
  unpaidMembersCount = 0,
  weeklyMemberDue,
  totalMembers,
  funds = [],
  fundContributions = [],
  fundExpenses = [],
  fundBanners = [],
  onNavigate,
  onSelectFundTab,
}) => {
  const t = translations[lang];
  const isBangla = lang === 'bn';

  const resolvedWeekLabel = weekTitle || weekLabel || (isBangla ? 'চলতি সপ্তাহ' : 'Current Week');
  const resolvedPaidCount = paidCount ?? paidMembersCount;
  const resolvedTotalMembers = totalMembers ?? resolvedPaidCount + unpaidMembersCount;

  const slides = useMemo(() => {
    const weeklySlide = {
      id: 'weekly_main',
      type: 'weekly' as const,
      badge: isBangla ? 'সাপ্তাহিক লক্ষ্যমাত্রা' : t.target_progress,
      title: resolvedWeekLabel,
      icon: '🏸',
      target: Math.max(0, Math.round(target || 0)),
      collected: Math.max(0, Math.round(collected || 0)),
      due:
        weeklyMemberDue !== undefined
          ? Math.max(0, Math.round(weeklyMemberDue))
          : Math.max(0, Math.round((target || 0) - (collected || 0))),
      paidCount: resolvedPaidCount,
      totalCount: resolvedTotalMembers,
    };

    const dynamicFundSlides =
      fundBanners.length > 0
        ? fundBanners.map((f) => ({
            id: `fund_${f.id}`,
            type: 'fund' as const,
            badge: isBangla ? 'বিশেষ তহবিল / ফান্ড' : 'Special Club Fund',
            title: isBangla ? f.banglaName || f.name : f.name,
            icon: f.icon || '💝',
            target: Math.max(0, Math.round(f.target || 0)),
            collected: Math.max(0, Math.round(f.collected || 0)),
            due: Math.max(0, Math.round((f.target || 0) - (f.collected || 0))),
            paidCount: f.paidCount,
            totalCount: f.totalMembers,
          }))
        : funds
            .filter((f) => f.status === 'ACTIVE' || f.isActive)
            .map((f) => {
              const metrics = calculateFundMetrics(f, fundContributions, fundExpenses);
              return {
                id: `fund_${f.id}`,
                type: 'fund' as const,
                badge: isBangla ? 'বিশেষ তহবিল / ফান্ড' : 'Special Club Fund',
                title: isBangla
                  ? f.titleBangla || f.banglaName || f.title || f.name || ''
                  : f.title || f.name || '',
                icon: f.icon || '💝',
                target: metrics.effectiveTarget,
                collected: metrics.collected,
                due: metrics.due,
                paidCount: metrics.paidCount,
                totalCount:
                  metrics.paidCount + metrics.partialCount + metrics.unpaidCount ||
                  resolvedTotalMembers,
              };
            });

    return [weeklySlide, ...dynamicFundSlides];
  }, [
    isBangla,
    t.target_progress,
    resolvedWeekLabel,
    target,
    collected,
    weeklyMemberDue,
    resolvedPaidCount,
    resolvedTotalMembers,
    fundBanners,
    funds,
    fundContributions,
    fundExpenses,
  ]);

  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    }
  }, []);

  useEffect(() => {
    if (activeIndex >= slides.length) {
      setActiveIndex(0);
    }
  }, [slides.length, activeIndex]);

  useEffect(() => {
    if (slides.length <= 1 || isPaused || prefersReducedMotion) return;
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % slides.length);
    }, 3500);
    return () => clearInterval(timer);
  }, [slides.length, isPaused, prefersReducedMotion]);

  const current = slides[activeIndex] || slides[0];
  const rawPct = current.target > 0 ? Math.round((current.collected / current.target) * 100) : 0;
  const pct = Math.min(100, Math.max(0, rawPct));
  const remaining = current.due;
  const isComplete = current.target > 0 && rawPct >= 100;
  const isFund = current.type === 'fund';

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (slides.length <= 1) return;
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      setActiveIndex((prev) => (prev + 1) % slides.length);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      setActiveIndex((prev) => (prev - 1 + slides.length) % slides.length);
    }
  };

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label={isBangla ? 'সাপ্তাহিক ও ফান্ড লক্ষ্যমাত্রা ব্যানার' : 'Weekly and Fund Target Progress Banner'}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
      className={`relative overflow-hidden rounded-2xl border transition-all duration-500 focus:outline-none focus:ring-2 focus:ring-emerald-400 ${
        isFund
          ? 'bg-gradient-to-r from-indigo-950 via-purple-950 to-slate-900 border-purple-500/30'
          : 'bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 border-emerald-500/20'
      } text-white p-4 sm:p-5 shadow-xl`}
    >
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                isFund
                  ? 'bg-purple-500/20 text-purple-300 border-purple-400/30'
                  : 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30'
              }`}
            >
              {isFund ? (
                <HeartHandshake className="w-3.5 h-3.5 text-pink-400" />
              ) : (
                <Flame className="w-3.5 h-3.5 text-amber-400" />
              )}
              {current.badge}
            </span>

            {slides.length > 1 && (
              <div className="inline-flex items-center gap-1 bg-white/10 px-2 py-0.5 rounded-full text-[11px] font-bold text-slate-200">
                <button
                  type="button"
                  aria-label={isBangla ? 'পূর্ববর্তী স্লাইড' : 'Previous slide'}
                  onClick={() => setActiveIndex((prev) => (prev - 1 + slides.length) % slides.length)}
                  className="hover:text-emerald-300 p-0.5"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <span>
                  {activeIndex + 1}/{slides.length}
                </span>
                <button
                  type="button"
                  aria-label={isBangla ? 'পরবর্তী স্লাইড' : 'Next slide'}
                  onClick={() => setActiveIndex((prev) => (prev + 1) % slides.length)}
                  className="hover:text-emerald-300 p-0.5"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <span className="text-xs text-slate-300 font-medium flex items-center gap-1">
              <span>{current.icon}</span>
              <span className="font-bold text-white">{current.title}</span>
            </span>

            {isFund && (onSelectFundTab || onNavigate) && (
              <button
                type="button"
                onClick={() => {
                  if (onSelectFundTab) onSelectFundTab();
                  else if (onNavigate) onNavigate('funds');
                }}
                className="text-[11px] underline text-purple-300 hover:text-white font-bold ml-1"
              >
                {isBangla ? 'ফান্ড বিস্তারিত →' : 'View Fund →'}
              </button>
            )}
          </div>

          <div className="flex items-baseline gap-2 pt-1" aria-live="polite">
            <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              {formatCurrency(current.collected, isBangla)}
            </span>
            <span className="text-xs sm:text-sm text-slate-400">
              / {formatCurrency(current.target, isBangla)}{' '}
              {isFund ? (isBangla ? 'ফান্ড লক্ষ্যমাত্রা' : 'Fund Target') : t.weekly_target}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm">
          <div className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <div>
              <div className="text-[11px] text-slate-400">
                {isFund ? (isBangla ? 'পরিশোধিত সদস্য' : 'Paid Members') : t.paid_members}
              </div>
              <div className="font-bold text-white">
                {current.paidCount} / {current.totalCount}
              </div>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400 shrink-0" />
            <div>
              <div className="text-[11px] text-slate-400">
                {isBangla ? 'বকেয়া / বাকি' : t.total_due}
              </div>
              <div className="font-bold text-amber-300">
                {formatCurrency(remaining, isBangla)}
              </div>
            </div>
          </div>

          <div
            className={`px-3.5 py-2 rounded-xl font-extrabold text-base flex items-center gap-1.5 ${
              isComplete
                ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/30'
                : isFund
                ? 'bg-purple-500/20 text-purple-200 border border-purple-400/30'
                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
            }`}
          >
            {isComplete && <Sparkles className="w-4 h-4" />}
            {rawPct}%
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-3.5 relative h-3 w-full bg-slate-800 rounded-full overflow-hidden p-0.5 border border-white/10">
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${
            isComplete
              ? 'bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300'
              : isFund
              ? 'bg-gradient-to-r from-purple-500 via-pink-500 to-amber-400'
              : 'bg-gradient-to-r from-emerald-600 via-emerald-400 to-teal-400'
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Slide Dots Indicator */}
      {slides.length > 1 && (
        <div className="mt-2.5 flex items-center justify-center gap-1.5">
          {slides.map((s, idx) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setActiveIndex(idx)}
              className={`h-1.5 rounded-full transition-all ${
                idx === activeIndex
                  ? isFund
                    ? 'w-6 bg-purple-400'
                    : 'w-6 bg-emerald-400'
                  : 'w-1.5 bg-white/25 hover:bg-white/50'
              }`}
              title={s.title}
              aria-label={s.title}
            />
          ))}
        </div>
      )}
    </div>
  );
};

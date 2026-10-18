import React from 'react';
import { formatCurrency, formatNumber, Language } from '../utils/language';
import { Target, TrendingUp, Sparkles } from 'lucide-react';

interface Props {
  collected: number;
  target: number;
  weekTitle: string;
  lang: Language;
}

export const WeeklyProgressBar: React.FC<Props> = ({
  collected,
  target,
  weekTitle,
  lang,
}) => {
  const isBangla = lang === 'bn';
  const percentage = target > 0 ? Math.min(Math.round((collected / target) * 100), 100) : 0;
  const rawRemaining = Math.max(target - collected, 0);

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-800 via-emerald-900 to-slate-950 p-5 text-white shadow-lg border border-emerald-700/50">
      {/* Decorative shuttlecock background icon */}
      <div className="absolute right-3 -bottom-3 text-emerald-800/30 text-8xl select-none pointer-events-none font-bold">
        🏸
      </div>

      <div className="relative z-10">
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-300">
              <Target className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-200">
              {isBangla ? 'সাপ্তাহিক সংগ্রহের লক্ষ্যমাত্রা' : 'Weekly Target'} • {weekTitle}
            </span>
          </div>

          <div className="inline-flex items-center gap-1 rounded-full bg-lime-400/20 px-2.5 py-0.5 text-xs font-extrabold text-lime-300 border border-lime-400/40">
            <TrendingUp className="w-3 h-3" />
            <span>
              {formatNumber(percentage, isBangla)}% {isBangla ? 'সম্পন্ন' : 'Completed'}
            </span>
          </div>
        </div>

        {/* Big numbers display matching user example */}
        <div className="flex items-baseline justify-between mt-1 mb-3">
          <div>
            <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {formatCurrency(collected, isBangla)}
            </span>
            <span className="text-sm sm:text-base font-semibold text-emerald-300/80 ml-2">
              / {formatCurrency(target, isBangla)}
            </span>
          </div>

          <div className="text-right">
            <span className="text-xs text-slate-300 block">
              {isBangla ? 'লক্ষ্যে পৌঁছাতে বাকি' : 'Remaining to Target'}
            </span>
            <span className="text-sm font-bold text-amber-300">
              {rawRemaining > 0
                ? formatCurrency(rawRemaining, isBangla)
                : (isBangla ? '🎯 অর্জিত!' : '🎯 Target Reached!')}
            </span>
          </div>
        </div>

        {/* Visual Progress Bar */}
        <div className="relative h-4 w-full rounded-full bg-slate-800/80 p-0.5 overflow-hidden border border-emerald-600/30">
          <div
            className="h-full rounded-full bg-gradient-to-r from-lime-400 via-emerald-400 to-teal-400 transition-all duration-700 ease-out shadow-[0_0_12px_rgba(74,222,128,0.5)]"
            style={{ width: `${percentage}%` }}
          />
        </div>

        {/* Milestone indicators */}
        <div className="flex justify-between text-[10px] text-emerald-300/70 mt-1.5 font-medium px-1">
          <span>0%</span>
          <span>25%</span>
          <span>50%</span>
          <span>75%</span>
          <span>100%</span>
        </div>
      </div>
    </div>
  );
};

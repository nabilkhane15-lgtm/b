import React, { useState } from 'react';
import { Season } from '../types';
import { translations, Language, formatCurrency, formatNumber } from '../utils/language';
import { Trophy, Plus, Calendar, CheckCircle2, Archive, ArrowRight } from 'lucide-react';

interface Props {
  seasons: Season[];
  activeSeason: Season;
  lang: Language;
  isAdmin: boolean;
  onSelectSeason: (season: Season) => void;
  onOpenCreateSeason: () => void;
}

export const SeasonView: React.FC<Props> = ({
  seasons,
  activeSeason,
  lang,
  isAdmin,
  onSelectSeason,
  onOpenCreateSeason,
}) => {
  const t = translations[lang];
  const isBangla = lang === 'bn';

  return (
    <div className="space-y-4 pb-24">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <span>{t.season_management}</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {isBangla
              ? 'প্রতি বছর নতুন ব্যাডমিন্টন সিজন শুরু করুন। পূর্ববর্তী সিজনগুলো সংরক্ষিত থাকবে।'
              : 'Annual badminton seasons. Past seasons remain accessible as read-only archives.'}
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={onOpenCreateSeason}
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>{t.create_season}</span>
          </button>
        )}
      </div>

      {/* Active Season Highlight */}
      <div className="rounded-2xl bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 p-6 text-white shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-white/20 text-white backdrop-blur-sm">
              <Trophy className="w-7 h-7 text-lime-300" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-200">
                {t.active_season}
              </span>
              <h3 className="text-2xl font-black tracking-tight text-white mt-0.5">
                {activeSeason.name}
              </h3>
            </div>
          </div>

          <span className="px-3 py-1 rounded-full bg-lime-400 text-emerald-950 font-extrabold text-xs">
            {isBangla ? 'চলতি সিজন' : 'Active'}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-5 pt-4 border-t border-emerald-500/40 text-xs">
          <div>
            <span className="text-emerald-200/80 block text-[11px]">
              {isBangla ? 'মেয়াদকাল' : 'Duration'}
            </span>
            <span className="font-bold text-white">
              {activeSeason.startDate} - {activeSeason.endDate}
            </span>
          </div>

          <div>
            <span className="text-emerald-200/80 block text-[11px]">{t.weekly_target}</span>
            <span className="font-bold text-white font-mono">
              {formatCurrency(activeSeason.weeklyTarget, isBangla)}
            </span>
          </div>

          <div>
            <span className="text-emerald-200/80 block text-[11px]">{t.weekly_amount}</span>
            <span className="font-bold text-white font-mono">
              {formatCurrency(activeSeason.defaultWeeklyFee, isBangla)}
            </span>
          </div>
        </div>
      </div>

      {/* Archived Seasons List */}
      <div>
        <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
          <Archive className="w-4 h-4 text-slate-400" />
          <span>{t.archived_seasons}</span>
        </h3>

        <div className="space-y-3">
          {seasons
            .filter((s) => s.id !== activeSeason.id)
            .map((s) => (
              <div
                key={s.id}
                onClick={() => onSelectSeason(s)}
                className="cursor-pointer rounded-2xl bg-white dark:bg-slate-900 p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                      {s.name}
                    </h4>
                    <p className="text-xs text-slate-400">
                      {s.startDate} - {s.endDate} •{' '}
                      {isBangla ? 'রিড-অনলি আর্কাইভ' : 'Read-only archive'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                  <span>{isBangla ? 'হিসাব দেখুন' : 'View History'}</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

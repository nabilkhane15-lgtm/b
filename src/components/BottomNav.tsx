import React from 'react';
import { TabType } from '../types';
import { translations, Language } from '../utils/language';
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  ReceiptText,
  BarChart3,
  Trophy,
  Settings,
  Swords,
  Palmtree,
  Coins,
  Crown,
} from 'lucide-react';

interface Props {
  activeTab: TabType;
  onChangeTab: (tab: TabType) => void;
  lang: Language;
}

export const BottomNav: React.FC<Props> = ({ activeTab, onChangeTab, lang }) => {
  const t = translations[lang];

  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: t.nav_dashboard, icon: <LayoutDashboard className="w-4 h-4 sm:w-5 sm:h-5" /> },
    { id: 'leaderboard', label: t.nav_leaderboard, icon: <Crown className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500" /> },
    { id: 'members', label: t.nav_members, icon: <Users className="w-4 h-4 sm:w-5 sm:h-5" /> },
    { id: 'weekly', label: t.nav_weekly, icon: <CalendarDays className="w-4 h-4 sm:w-5 sm:h-5" /> },
    { id: 'funds', label: t.nav_funds, icon: <Coins className="w-4 h-4 sm:w-5 sm:h-5" /> },
    { id: 'tournament', label: t.nav_tournament, icon: <Swords className="w-4 h-4 sm:w-5 sm:h-5" /> },
    { id: 'picnic', label: t.nav_picnic, icon: <Palmtree className="w-4 h-4 sm:w-5 sm:h-5" /> },
    { id: 'expenses', label: t.nav_expenses, icon: <ReceiptText className="w-4 h-4 sm:w-5 sm:h-5" /> },
    { id: 'reports', label: t.nav_reports, icon: <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5" /> },
    { id: 'season', label: t.nav_season, icon: <Trophy className="w-4 h-4 sm:w-5 sm:h-5" /> },
    { id: 'settings', label: t.nav_settings, icon: <Settings className="w-4 h-4 sm:w-5 sm:h-5" /> },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 transition-colors shadow-lg">
      <div className="max-w-screen-xl mx-auto px-1 sm:px-2">
        <div className="flex items-center h-16 overflow-x-auto no-scrollbar scroll-smooth space-x-1 sm:justify-around">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onChangeTab(tab.id)}
                className={`flex flex-col items-center justify-center flex-shrink-0 min-w-[58px] sm:flex-1 py-1 px-1 transition-all rounded-xl relative ${
                  isActive
                    ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                    : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                {isActive && (
                  <span className="absolute top-0 w-8 h-1 bg-emerald-500 rounded-full" />
                )}
                <div className={`p-1 rounded-lg ${isActive ? 'bg-emerald-50 dark:bg-emerald-950/60' : ''}`}>
                  {tab.icon}
                </div>
                <span className="text-[10px] mt-0.5 tracking-tight truncate max-w-[62px]">
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

import React, { useState } from 'react';
import { Season, ClubSettings, Member } from '../types';
import { translations, Language } from '../utils/language';
import {
  ShieldCheck,
  Eye,
  Languages,
  Moon,
  Sun,
  Lock,
  Share2,
  Calendar,
  KeyRound,
  MessageCircle,
  Flame,
  UserCheck,
  UserPlus,
  User,
  LogOut,
} from 'lucide-react';
import { isFirebaseConfigured, getPublicShareUrl } from '../utils/firebase';

interface Props {
  lang: Language;
  onToggleLang: () => void;
  isAdmin: boolean;
  currentSubAdmin?: Member | null;
  currentLoggedInMember?: Member | null;
  onToggleAdmin: () => void;
  onLogoutSubAdmin?: () => void;
  onLogoutMember?: () => void;
  onOpenAuth: (initialTab?: 'login' | 'signup' | 'admin') => void;
  onOpenMemberProfile?: (member: Member) => void;
  isDark: boolean;
  onToggleDark: () => void;
  activeSeason?: Season;
  onOpenChangePassword?: () => void;
  clubSettings?: ClubSettings;
  onOpenIdSearch?: () => void;
  onOpenFirebase?: () => void;
  onOpenShare?: () => void;
  onOpenAdminProfile?: () => void;
}

export const Navbar: React.FC<Props> = ({
  lang,
  onToggleLang,
  isAdmin,
  currentSubAdmin,
  currentLoggedInMember,
  onToggleAdmin,
  onLogoutSubAdmin,
  onLogoutMember,
  onOpenAuth,
  onOpenMemberProfile,
  isDark,
  onToggleDark,
  activeSeason,
  onOpenChangePassword,
  clubSettings,
  onOpenIdSearch,
  onOpenFirebase,
  onOpenShare,
  onOpenAdminProfile,
}) => {
  const t = translations[lang];
  const [copied, setCopied] = useState(false);
  const isBangla = lang === 'bn';

  const displayedClubName = clubSettings
    ? isBangla && clubSettings.clubNameBangla
      ? clubSettings.clubNameBangla
      : clubSettings.clubName
    : t.app_title;

  const displayedSubtitle = clubSettings
    ? `${isBangla && clubSettings.clubNameBangla ? clubSettings.clubNameBangla : clubSettings.clubName} • ${clubSettings.location}`
    : t.club_subtitle;

  const handleShare = () => {
    if (onOpenShare) {
      onOpenShare();
      return;
    }
    const url = getPublicShareUrl();
    if (navigator.share) {
      navigator
        .share({
          title: displayedClubName,
          text: `${displayedClubName} - ${displayedSubtitle}`,
          url,
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleOpenMessenger = () => {
    const targetLink =
      clubSettings?.messengerLink?.trim() ||
      'https://m.me/';
    window.open(targetLink, '_blank', 'noopener,noreferrer');
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Logo & Title */}
          <div className="flex items-center gap-3 min-w-0">
            {clubSettings?.logoUrl ? (
              <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 p-0.5 border border-slate-200 dark:border-slate-700 shadow-md shadow-emerald-500/10 shrink-0 flex items-center justify-center overflow-hidden">
                <img
                  src={clubSettings.logoUrl}
                  alt={displayedClubName}
                  className="w-full h-full object-contain rounded-lg"
                />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 text-xl shrink-0">
                🏸
              </div>
            )}
            <div className="min-w-0">
              <h1 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white truncate flex items-center gap-2">
                <span>{displayedClubName}</span>
                {activeSeason && (
                  <span className="hidden md:inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    <Calendar className="w-3 h-3" />
                    {activeSeason.name}
                  </span>
                )}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                {displayedSubtitle}
              </p>
            </div>
          </div>

          {/* Quick Actions Right */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* 4-digit ID Search Button */}
            {onOpenIdSearch && (
              <button
                onClick={onOpenIdSearch}
                title={isBangla ? '৪ সংখ্যার মেম্বার আইডি দিয়ে স্ট্যাটাস দেখুন' : 'Lookup member status by 4-digit ID'}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-black bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-sm transition-transform active:scale-95"
              >
                <span>🔍</span>
                <span className="hidden sm:inline">{isBangla ? 'আইডি স্ট্যাটাস' : 'ID Status'}</span>
                <span className="sm:hidden font-mono">ID</span>
              </button>
            )}

            {/* Messenger Connect Button */}
            <button
              onClick={handleOpenMessenger}
              title={isBangla ? 'মেসেঞ্জারে যোগাযোগ করুন / গ্রুপে যুক্ত হোন' : 'Connect on Facebook Messenger'}
              className="flex items-center gap-1 p-2 rounded-lg text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 border border-blue-200/80 dark:border-blue-900/60 transition-colors"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12 2C6.477 2 2 6.145 2 11.258c0 2.91 1.455 5.518 3.735 7.215v3.527l3.376-1.854c.915.254 1.884.392 2.889.392 5.523 0 10-4.145 10-9.258C22 6.145 17.523 2 12 2zm1.01 12.443l-2.56-2.73-5 2.73 5.495-5.836 2.625 2.73 4.935-2.73-5.495 5.836z" />
              </svg>
              <span className="hidden md:inline text-[11px] font-bold">Messenger</span>
            </button>

            {/* Firebase Console Button (Admin Only) */}
            {isAdmin && onOpenFirebase && (
              <button
                onClick={onOpenFirebase}
                title={isBangla ? 'Firebase কনসোল ও লাইভ ক্লাউড ডাটাবেস সংযোগ (শুধুমাত্র অ্যাডমিন)' : 'Firebase Console & Cloud Database (Admin Only)'}
                className="relative flex items-center gap-1 p-2 rounded-lg text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 border border-amber-200/80 dark:border-amber-900/60 transition-colors"
              >
                <Flame className="w-4 h-4 fill-amber-500 text-amber-500" />
                <span className="hidden lg:inline text-[11px] font-bold">Firebase</span>
                {isFirebaseConfigured() && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-white dark:ring-slate-900" />
                )}
              </button>
            )}

            {/* Admin / Founder Profile Button */}
            {onOpenAdminProfile && (
              <button
                onClick={onOpenAdminProfile}
                title={isBangla ? 'অ্যাপ প্রতিষ্ঠাতা ও প্রধান অ্যাডমিন পরিচিতি দেখুন' : 'View App Founder & Admin Profile'}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:hover:bg-amber-900/40 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-800 transition-colors shadow-sm"
              >
                <span>👑</span>
                <span className="hidden sm:inline">{isBangla ? 'অ্যাডমিন পরিচিতি' : 'Admin Profile'}</span>
              </button>
            )}

            {/* Share Public Link */}
            <button
              onClick={handleShare}
              title={isBangla ? 'সবার জন্য পাবলিক লিংক শেয়ার করুন (WhatsApp / Browser)' : 'Share Public Link for all members'}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-colors relative"
            >
              <Share2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span className="hidden sm:inline">{isBangla ? 'শেয়ার' : 'Share'}</span>
              {copied && (
                <span className="absolute -bottom-7 left-1/2 -translate-x-1/2 text-[10px] bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-2 py-0.5 rounded shadow whitespace-nowrap z-50">
                  Link Copied!
                </span>
              )}
            </button>

            {/* Language Switcher */}
            <button
              onClick={onToggleLang}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors border border-slate-200 dark:border-slate-700"
              title="Switch Language / ভাষা পরিবর্তন"
            >
              <Languages className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>{lang === 'bn' ? 'EN' : 'বাং'}</span>
            </button>

            {/* Dark Mode Toggle */}
            <button
              onClick={onToggleDark}
              className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title={t.dark_mode}
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Admin / Sub-Admin / Viewer Mode Controls */}
            {isAdmin ? (
              <div className="flex items-center gap-1">
                <button
                  onClick={onToggleAdmin}
                  title={isBangla ? 'লক করে সাধারণ মেম্বার ভিউতে যান' : 'Lock & switch to Viewer mode'}
                  className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-sm shadow-emerald-500/20 hover:opacity-95 transition-all"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-lime-300" />
                  <span className="hidden xs:inline">{t.role_admin}</span>
                  <span className="xs:hidden">Admin</span>
                </button>
                {onOpenChangePassword && (
                  <button
                    onClick={onOpenChangePassword}
                    title={isBangla ? 'অ্যাডমিন সিকিউরিটি পাসওয়ার্ড পরিবর্তন' : 'Change Admin Security Password'}
                    className="p-1.5 sm:p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors"
                  >
                    <KeyRound className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  </button>
                )}
              </div>
            ) : currentSubAdmin ? (
              <div className="flex items-center gap-1">
                <div
                  title={`সাব-অ্যাডমিন: ${currentSubAdmin.assignedDuty || 'দায়িত্বপ্রাপ্ত'}`}
                  className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500 text-white shadow-sm"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span className="hidden xs:inline truncate max-w-[110px]">
                    {currentSubAdmin.banglaName || currentSubAdmin.name}
                  </span>
                  <span className="xs:hidden font-mono text-[10px]">Sub</span>
                </div>
                {onLogoutSubAdmin && (
                  <button
                    onClick={onLogoutSubAdmin}
                    title={isBangla ? 'লগআউট করুন' : 'Logout Sub-Admin'}
                    className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                  >
                    <LogOut className="w-3.5 h-3.5 text-rose-500" />
                  </button>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                {currentLoggedInMember ? (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onOpenMemberProfile?.(currentLoggedInMember)}
                      title={isBangla ? 'আমার মেম্বার প্রোফাইল দেখুন' : 'View My Member Profile'}
                      className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 transition-all shadow-sm"
                    >
                      <div className="w-4 h-4 rounded-full overflow-hidden bg-emerald-200 dark:bg-emerald-800 flex items-center justify-center text-[10px]">
                        {currentLoggedInMember.avatar ? (
                          <img src={currentLoggedInMember.avatar} alt="" className="w-full h-full object-cover" />
                        ) : (
                          '👤'
                        )}
                      </div>
                      <span className="hidden xs:inline truncate max-w-[90px]">
                        {currentLoggedInMember.banglaName || currentLoggedInMember.name}
                      </span>
                      <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-black">
                        #{currentLoggedInMember.memberCode}
                      </span>
                    </button>
                    {onLogoutMember && (
                      <button
                        onClick={onLogoutMember}
                        title={isBangla ? 'সদস্য একাউন্ট লগআউট' : 'Logout Member'}
                        className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors"
                      >
                        <LogOut className="w-3.5 h-3.5 text-rose-500" />
                      </button>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={() => onOpenAuth('login')}
                    title={isBangla ? 'সদস্য অথবা অ্যাডমিন লগইন / সাইন-আপ করতে চাপুন' : 'Member / Admin Login & Sign Up'}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-700 text-white shadow-md shadow-emerald-600/20 transition-all active:scale-95"
                  >
                    <Lock className="w-3.5 h-3.5 text-lime-300" />
                    <span>{isBangla ? 'প্রবেশ / সাইন-আপ' : 'Login / Sign Up'}</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};


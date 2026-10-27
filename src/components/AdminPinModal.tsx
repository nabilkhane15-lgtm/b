import React, { useState } from 'react';
import { translations, Language } from '../utils/language';
import { loadAdminPassword, saveAdminPinFromCloud } from '../utils/storage';
import { fetchAdminPinFromFirestore } from '../utils/firebase';
import { Member } from '../types';
import { Lock, X, ShieldCheck, KeyRound, Eye, EyeOff, UserCheck, Crown } from 'lucide-react';

interface Props {
  lang: Language;
  members?: Member[];
  onSuccess: (subAdminMember?: Member) => void;
  onClose: () => void;
  onOpenChangePassword?: () => void;
}

export const AdminPinModal: React.FC<Props> = ({
  lang,
  members = [],
  onSuccess,
  onClose,
  onOpenChangePassword,
}) => {
  const t = translations[lang];
  const isBangla = lang === 'bn';
  const [loginMode, setLoginMode] = useState<'admin' | 'subadmin'>('admin');
  const [pin, setPin] = useState('');
  const [selectedMemberId, setSelectedMemberId] = useState<string>(() => {
    const withDuties = members.filter((m) => m.assignedDuty || (m.delegatedPermissions && m.delegatedPermissions.length > 0));
    return withDuties.length > 0 ? withDuties[0].id : (members[0]?.id || '');
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Members who have assigned duties or permissions
  const membersWithDuties = members.filter(
    (m) => m.assignedDuty || (m.delegatedPermissions && m.delegatedPermissions.length > 0) || m.subAdminPin
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let savedPass = loadAdminPassword();
    const trimmedPin = pin.trim();

    if (loginMode === 'admin') {
      let isMatch =
        trimmedPin === savedPass ||
        (savedPass === '1234' && (trimmedPin === 'admin' || trimmedPin === '1234'));

      // If local cache doesn't match, verify against Firestore live in case it was updated on another browser
      if (!isMatch) {
        try {
          const cloudPin = await fetchAdminPinFromFirestore();
          if (cloudPin) {
            saveAdminPinFromCloud(cloudPin);
            savedPass = cloudPin;
            isMatch =
              trimmedPin === savedPass ||
              (savedPass === '1234' && (trimmedPin === 'admin' || trimmedPin === '1234'));
          }
        } catch {
          // ignore
        }
      }

      if (isMatch) {
        onSuccess(undefined); // Full master admin
      } else {
        setError(true);
        setErrorMessage(isBangla ? 'ভুল অ্যাডমিন পাসওয়ার্ড! আবার চেষ্টা করুন।' : 'Incorrect admin password!');
      }
    } else {
      // Sub-admin login
      const selectedMember = members.find((m) => m.id === selectedMemberId);
      if (!selectedMember) {
        setError(true);
        setErrorMessage(isBangla ? 'অনুগ্রহ করে সদস্য নির্বাচন করুন' : 'Please select a member');
        return;
      }

      // Check member's personal PIN, or fallback to master admin password
      const memberPin = selectedMember.subAdminPin || '1234';
      if (trimmedPin === memberPin || trimmedPin === savedPass) {
        onSuccess(selectedMember);
      } else {
        setError(true);
        setErrorMessage(
          isBangla
            ? `ভুল সাব-অ্যাডমিন PIN! (${selectedMember.name} এর জন্য নির্ধারিত PIN দিন)`
            : 'Incorrect Sub-Admin PIN!'
        );
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-sm w-full p-5 sm:p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-scale-up">
        {/* Header */}
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                {isBangla ? 'নিরাপত্তা লগইন' : 'Security Login'}
              </h3>
              <p className="text-[11px] text-slate-400">
                {loginMode === 'admin'
                  ? isBangla
                    ? 'প্রধান অ্যাডমিন মোড'
                    : 'Master Admin Access'
                  : isBangla
                  ? 'দায়িত্বপ্রাপ্ত সদস্য লগইন'
                  : 'Sub-Admin Member Access'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="grid grid-cols-2 gap-1 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800 mb-3.5">
          <button
            type="button"
            onClick={() => {
              setLoginMode('admin');
              setError(false);
            }}
            className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              loginMode === 'admin'
                ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-300 shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
            }`}
          >
            <Crown className="w-3.5 h-3.5 text-amber-500" />
            <span>{isBangla ? 'প্রধান অ্যাডমিন' : 'Master Admin'}</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setLoginMode('subadmin');
              setError(false);
            }}
            className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              loginMode === 'subadmin'
                ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-300 shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>{isBangla ? 'দায়িত্বপ্রাপ্ত সদস্য' : 'Sub-Admin'}</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {loginMode === 'admin' ? (
            <div>
              <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/70 dark:border-amber-800/60 mb-3 text-left">
                <p className="text-xs text-amber-900 dark:text-amber-200 font-medium leading-relaxed">
                  {isBangla
                    ? '👑 প্রধান অ্যাডমিন সমস্ত আর্থিক হিসাব, সেটিংস, সেরা তারকা ও মেম্বার পরিবর্তন করতে পারেন।'
                    : '👑 Master Admin has full unrestricted control over all finances, settings and members.'}
                </p>
              </div>

              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  autoFocus
                  value={pin}
                  onChange={(e) => {
                    setPin(e.target.value);
                    setError(false);
                  }}
                  placeholder={isBangla ? 'প্রধান অ্যাডমিন পাসওয়ার্ড লিখুন' : 'Enter admin password'}
                  className="w-full text-center text-lg font-mono py-2.5 px-10 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {error ? (
                <p className="text-xs text-rose-500 font-bold mt-2 text-center animate-shake">
                  {errorMessage}
                </p>
              ) : (
                <p className="text-[11px] text-slate-400 mt-2 text-center">
                  💡 {isBangla ? 'ডিফল্ট পাসওয়ার্ড: 1234' : 'Default password: 1234'}
                </p>
              )}
            </div>
          ) : (
            <div>
              <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/70 dark:border-emerald-800/60 mb-3 text-left">
                <p className="text-xs text-emerald-900 dark:text-emerald-200 font-medium leading-relaxed">
                  {isBangla
                    ? '🎖️ যে সদস্যদেরকে অ্যাডমিন কোনো নির্দিষ্ট দায়িত্ব (যেমন: সেরা তারকা, মেম্বার ইত্যাদি) দিয়েছেন, তারা নিজেদের PIN দিয়ে লগইন করুন।'
                    : '🎖️ Delegated sub-admins can login with their Member ID and assigned PIN.'}
                </p>
              </div>

              <div className="space-y-2 mb-3">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                  {isBangla ? 'আপনার নাম / সদস্য নির্বাচন করুন:' : 'Select Your Member Account:'}
                </label>
                <select
                  value={selectedMemberId}
                  onChange={(e) => {
                    setSelectedMemberId(e.target.value);
                    setError(false);
                  }}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white"
                >
                  {(membersWithDuties.length > 0 ? membersWithDuties : members).map((m) => (
                    <option key={m.id} value={m.id}>
                      #{m.memberCode} - {m.banglaName || m.name} {m.assignedDuty ? `(${m.assignedDuty})` : ''}
                    </option>
                  ))}
                </select>

                {(() => {
                  const m = members.find((mem) => mem.id === selectedMemberId);
                  if (m?.assignedDuty) {
                    return (
                      <p className="text-[11px] text-amber-600 dark:text-amber-400 font-bold">
                        🌟 অর্পিত দায়িত্ব: {m.assignedDuty}
                      </p>
                    );
                  }
                  return null;
                })()}
              </div>

              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={pin}
                  onChange={(e) => {
                    setPin(e.target.value);
                    setError(false);
                  }}
                  placeholder={isBangla ? 'আপনার ৪ সংখ্যার PIN লিখুন' : 'Enter your 4-digit PIN'}
                  className="w-full text-center text-lg font-mono py-2.5 px-10 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {error && (
                <p className="text-xs text-rose-500 font-bold mt-2 text-center animate-shake">
                  {errorMessage}
                </p>
              )}
            </div>
          )}

          <div className="flex gap-2.5 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              disabled={!pin.trim()}
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-emerald-500/20 transition-all flex items-center justify-center gap-1.5"
            >
              <KeyRound className="w-4 h-4" />
              <span>{isBangla ? 'লগইন ও আনলক' : 'Login & Unlock'}</span>
            </button>
          </div>

          {onOpenChangePassword && loginMode === 'admin' && (
            <div className="pt-2 text-center border-t border-slate-100 dark:border-slate-800/80">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenChangePassword();
                }}
                className="text-xs text-emerald-600 dark:text-emerald-400 font-bold hover:underline inline-flex items-center gap-1"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>{isBangla ? 'পাসওয়ার্ড পরিবর্তন করতে চান? এখানে চাপুন' : 'Want to change password? Click here'}</span>
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

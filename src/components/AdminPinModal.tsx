import React, { useState, useMemo } from 'react';
import { Lock, X, ShieldCheck, KeyRound, Eye, EyeOff } from 'lucide-react';
import { Member, SubAdmin } from '../types';
import { Language } from '../utils/language';
import { loadAdminPassword, loadMembers } from '../utils/storage';
import { FunnyGirlMascot } from './FunnyGirlMascot';
import {
  checkLoginRateLimit,
  recordFailedLoginAttempt,
  resetLoginRateLimit,
  verifySecret,
} from '../utils/security';

interface Props {
  lang?: Language;
  isBangla?: boolean;
  subAdmins?: SubAdmin[];
  adminPin?: string;
  adminPinHash?: string;
  onSuccess?: (subAdmin?: Member) => void;
  onMasterAdminSuccess?: () => void;
  onSubAdminSuccess?: (subAdmin: SubAdmin) => void;
  onClose: () => void;
  onOpenChangePassword?: () => void;
}

export const AdminPinModal: React.FC<Props> = ({
  lang,
  isBangla: isBanglaProp,
  subAdmins = [],
  adminPin,
  adminPinHash,
  onSuccess,
  onMasterAdminSuccess,
  onSubAdminSuccess,
  onClose,
}) => {
  const isBangla = isBanglaProp ?? lang === 'bn';
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [pinFocused, setPinFocused] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);

  const mascotMood = useMemo(() => {
    if (loginSuccess) return 'success';
    if (error) return 'error';
    if (pinFocused || pin.length > 0) {
      return showPin ? 'peeking' : 'covering_eyes';
    }
    return 'idle';
  }, [loginSuccess, error, pinFocused, pin.length, showPin]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const rateCheck = checkLoginRateLimit('admin_pin_modal');
    if (!rateCheck.allowed) {
      setError(true);
      setErrorMsg(
        isBangla
          ? `অনেকবার ভুল চেষ্টা! ${rateCheck.remainingSeconds} সেকেন্ড অপেক্ষা করুন।`
          : `Too many attempts! Wait ${rateCheck.remainingSeconds}s.`
      );
      return;
    }

    const cleanPin = pin.trim();
    const savedMasterPin = adminPin || loadAdminPassword() || '1234';

    // 1. Check Master Admin
    if (verifySecret(cleanPin, adminPinHash, savedMasterPin)) {
      resetLoginRateLimit('admin_pin_modal');
      setLoginSuccess(true);
      setTimeout(() => {
        if (onSuccess) onSuccess();
        if (onMasterAdminSuccess) onMasterAdminSuccess();
        onClose();
      }, 400);
      return;
    }

    // 2. Check Member-based delegated Sub-Admins (stored in members with isSubAdmin & subAdminPin)
    const allMembers = loadMembers();
    const matchedMemberSubAdmin = allMembers.find(
      (m) =>
        m.isSubAdmin &&
        m.subAdminPin &&
        verifySecret(cleanPin, m.pinHash, m.subAdminPin)
    );
    if (matchedMemberSubAdmin && onSuccess) {
      resetLoginRateLimit('admin_pin_modal');
      setLoginSuccess(true);
      setTimeout(() => {
        onSuccess(matchedMemberSubAdmin);
        onClose();
      }, 400);
      return;
    }

    // 3. Check standalone SubAdmins array if passed
    const matchedSub = subAdmins.find(
      (sa) => sa.isActive && verifySecret(cleanPin, sa.pinHash, sa.pin)
    );
    if (matchedSub && onSubAdminSuccess) {
      resetLoginRateLimit('admin_pin_modal');
      setLoginSuccess(true);
      setTimeout(() => {
        onSubAdminSuccess(matchedSub);
        onClose();
      }, 400);
      return;
    }

    const failInfo = recordFailedLoginAttempt('admin_pin_modal');
    setError(true);
    setErrorMsg(
      failInfo.locked
        ? isBangla
          ? '৩০ সেকেন্ডের জন্য লক করা হয়েছে!'
          : 'Locked for 30 seconds!'
        : isBangla
        ? 'ভুল পিন! আবার চেষ্টা করুন।'
        : 'Invalid PIN! Try again.'
    );
    setPin('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-sm w-full overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 p-4 text-white">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2.5">
              <div className="bg-white/20 p-2 rounded-2xl backdrop-blur-md">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-base">
                  {isBangla ? 'অ্যাডমিন ও সাব-অ্যাডমিন লগইন' : 'Admin & Staff Login'}
                </h3>
                <p className="text-[11px] text-emerald-100">
                  {isBangla ? 'ক্লাব ম্যানেজমেন্টে প্রবেশ করতে পিন দিন' : 'Enter PIN to unlock controls'}
                </p>
              </div>
            </div>
            <button onClick={onClose} className="text-white/70 hover:text-white p-1">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="mt-2">
            <FunnyGirlMascot mood={mascotMood} isBangla={isBangla} />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-2 flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-emerald-500" />
              {isBangla ? 'গোপন পিন নম্বর (PIN)' : 'Secret PIN Number'}
            </label>
            <div className="relative">
              <input
                type={showPin ? 'text' : 'password'}
                value={pin}
                onFocus={() => setPinFocused(true)}
                onBlur={() => setPinFocused(false)}
                onChange={(e) => {
                  setPin(e.target.value);
                  setError(false);
                  setErrorMsg('');
                }}
                placeholder="••••"
                autoFocus
                className="w-full px-4 py-3 pr-11 text-center text-2xl tracking-[0.5em] font-black rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                className="absolute right-3.5 top-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {error && (
              <p className="text-xs text-rose-500 font-semibold mt-2 text-center">
                {errorMsg || (isBangla ? 'ভুল পিন! আবার চেষ্টা করুন।' : 'Invalid PIN! Try again.')}
              </p>
            )}
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-3 border border-slate-200/70 dark:border-slate-700/60 space-y-1.5">
            <p className="text-[11px] font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              {isBangla ? 'লগইন তথ্য:' : 'Login Info:'}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              • {isBangla ? 'মাস্টার অ্যাডমিন পিন বা পাসওয়ার্ড ব্যবহার করুন' : 'Enter Master Admin PIN or password'}
            </p>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition shadow-lg shadow-emerald-600/20"
          >
            {isBangla ? 'প্রবেশ করুন' : 'Unlock Access'}
          </button>
        </form>
      </div>
    </div>
  );
};

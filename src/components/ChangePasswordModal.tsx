import React, { useState } from 'react';
import { loadAdminPassword, saveAdminPassword } from '../utils/storage';
import { Language } from '../utils/language';
import { ShieldCheck, Lock, Eye, EyeOff, X, Check, KeyRound, AlertCircle } from 'lucide-react';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  onSuccess: () => void;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  isOpen,
  onClose,
  lang,
  onSuccess,
}) => {
  const isBangla = lang === 'bn';
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const savedPass = loadAdminPassword();
    const isCurrentValid =
      currentPassword.trim() === savedPass ||
      (savedPass === '1234' && (currentPassword.trim() === 'admin' || currentPassword.trim() === '1234'));

    if (!isCurrentValid) {
      setError(
        isBangla
          ? 'বর্তমান পাসওয়ার্ডটি সঠিক নয়! আবার চেক করুন।'
          : 'Current password is incorrect! Please try again.'
      );
      return;
    }

    if (!newPassword.trim() || newPassword.trim().length < 4) {
      setError(
        isBangla
          ? 'নতুন পাসওয়ার্ড কমপক্ষে ৪ অক্ষরের বা সংখ্যার হতে হবে।'
          : 'New password must be at least 4 characters long.'
      );
      return;
    }

    if (newPassword.trim() !== confirmPassword.trim()) {
      setError(
        isBangla
          ? 'নতুন পাসওয়ার্ড ও কনফার্ম পাসওয়ার্ড মেলেনি!'
          : 'New password and confirmation password do not match!'
      );
      return;
    }

    // Save
    saveAdminPassword(newPassword.trim());
    setSuccess(true);
    setTimeout(() => {
      onSuccess();
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-200 dark:border-slate-800 animate-scale-up">
        {/* Header */}
        <div className="flex justify-between items-center mb-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white shadow-md shadow-emerald-500/20">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-lg text-slate-900 dark:text-white">
                {isBangla ? 'অ্যাডমিন পাসওয়ার্ড পরিবর্তন' : 'Change Admin Password'}
              </h3>
              <p className="text-xs text-slate-400">
                {isBangla
                  ? 'ক্লাব ডেটা ও এডিটিং সুরক্ষিত করতে পাসওয়ার্ড সেট করুন'
                  : 'Set security key to protect club records and edits'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {success ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto animate-bounce">
              <Check className="w-8 h-8 stroke-[3]" />
            </div>
            <h4 className="text-base font-extrabold text-slate-900 dark:text-white">
              {isBangla ? 'পাসওয়ার্ড সফলভাবে পরিবর্তিত হয়েছে! 🎉' : 'Password Changed Successfully! 🎉'}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isBangla
                ? 'পরবর্তী লগইনে আপনার এই নতুন পাসওয়ার্ডটি ব্যবহার করুন।'
                : 'Use your new password for future admin logins.'}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 flex items-center gap-2.5 text-xs text-rose-700 dark:text-rose-300 font-bold animate-shake">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Current Password */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                {isBangla ? '১. বর্তমান পাসওয়ার্ড দিন' : '1. Current Password'}
              </label>
              <div className="relative">
                <input
                  type={showCurrent ? 'text' : 'password'}
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder={isBangla ? 'বর্তমান পাসওয়ার্ড (ডিফল্ট: 1234)' : 'Current password (default: 1234)'}
                  className="w-full px-4 py-2.5 pr-10 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                {isBangla ? '২. নতুন সিকিউরিটি পাসওয়ার্ড' : '2. New Admin Password'}
              </label>
              <div className="relative">
                <input
                  type={showNew ? 'text' : 'password'}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder={isBangla ? 'কমপক্ষে ৪ অক্ষর বা সংখ্যা' : 'At least 4 characters'}
                  className="w-full px-4 py-2.5 pr-10 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm New Password */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                {isBangla ? '৩. নতুন পাসওয়ার্ড নিশ্চিত করুন' : '3. Confirm New Password'}
              </label>
              <div className="relative">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={isBangla ? 'নতুন পাসওয়ার্ড পুনরায় লিখুন' : 'Re-enter new password'}
                  className="w-full px-4 py-2.5 pr-10 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                💡 {isBangla
                  ? 'মনে রাখবেন: পাসওয়ার্ড পরিবর্তন করার পর সাধারণ মেম্বাররা কোনো আর্থিক ডেটা বা পেমেন্ট স্ট্যাটাস সম্পাদনা করতে পারবে না।'
                  : 'Notice: After setting this password, regular members will remain in read-only mode and cannot tamper with records.'}
              </p>
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                {isBangla ? 'বাতিল' : 'Cancel'}
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md shadow-emerald-500/20 transition-all flex items-center justify-center gap-1.5"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{isBangla ? 'পাসওয়ার্ড সংরক্ষণ' : 'Save Password'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

import React, { useState, useRef, useMemo } from 'react';
import { Member, SportType, MemberCategory, SubAdmin, ClubSettings } from '../types';
import { Language } from '../utils/language';
import { loadAdminPassword } from '../utils/storage';
import { X, LogIn, UserPlus, Camera, CheckCircle2, ShieldCheck, KeyRound, Eye, EyeOff, Lock } from 'lucide-react';
import { processImageFile } from '../utils/imageUtils';
import { FunnyGirlMascot } from './FunnyGirlMascot';
import { getCategoryDefaultWeeklyFee } from '../utils/accounting';
import {
  allocateNextMemberCode,
  checkLoginRateLimit,
  findMemberByPhone,
  hashSecretSync,
  recordFailedLoginAttempt,
  resetLoginRateLimit,
  verifySecret,
} from '../utils/security';

interface Props {
  isOpen?: boolean;
  lang: Language;
  members: Member[];
  subAdmins?: SubAdmin[];
  adminPin?: string;
  adminPinHash?: string;
  clubSettings?: Partial<ClubSettings>;
  onLoginSuccess: (member: Member) => void;
  onRegisterMember?: (newMember: Omit<Member, 'id'>) => Promise<Member> | Member | void;
  onSignUp?: (newMember: Omit<Member, 'id'>) => Promise<Member> | Member | void;
  onAdminSuccess?: (subAdmin?: Member) => void;
  onSubAdminSuccess?: (subAdmin: SubAdmin) => void;
  onOpenChangePassword?: () => void;
  onOpenMemberProfile?: (member: Member) => void;
  onClose: () => void;
  initialTab?: 'login' | 'register' | 'signup' | 'admin';
}

export const MemberAuthModal: React.FC<Props> = ({
  isOpen = true,
  lang,
  members,
  subAdmins = [],
  adminPin,
  adminPinHash,
  clubSettings,
  onLoginSuccess,
  onRegisterMember,
  onSignUp,
  onAdminSuccess,
  onSubAdminSuccess,
  onClose,
  initialTab = 'login',
}) => {
  const isBangla = lang === 'bn';
  const normalizedInitialTab: 'login' | 'register' | 'admin' =
    initialTab === 'signup' ? 'register' : initialTab;
  const [tab, setTab] = useState<'login' | 'register' | 'admin'>(normalizedInitialTab);

  // Login State
  const [loginQuery, setLoginQuery] = useState('');
  const [loginPin, setLoginPin] = useState('');
  const [loginError, setLoginError] = useState('');
  const [showLoginPin, setShowLoginPin] = useState(false);

  // Admin Login State
  const [adminLoginPin, setAdminLoginPin] = useState('');
  const [adminLoginError, setAdminLoginError] = useState('');
  const [showAdminPin, setShowAdminPin] = useState(false);

  // Mascot Focus State
  const [focusedField, setFocusedField] = useState<'none' | 'id' | 'name' | 'phone' | 'pin'>('none');
  const [authSuccess, setAuthSuccess] = useState(false);

  // Registration State
  const [avatar, setAvatar] = useState<string | undefined>(undefined);
  const [name, setName] = useState('');
  const [banglaName, setBanglaName] = useState('');
  const [phone, setPhone] = useState('+880');
  const [preferredSport, setPreferredSport] = useState<SportType>('badminton');
  const [memberCategory, setMemberCategory] = useState<MemberCategory>('youth');
  const [participatesInSports, setParticipatesInSports] = useState<boolean>(true);
  const [registerPin, setRegisterPin] = useState('');
  const [showRegisterPin, setShowRegisterPin] = useState(false);
  const [regError, setRegError] = useState('');
  const [createdMember, setCreatedMember] = useState<Member | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const nextMemberCode = useMemo(() => allocateNextMemberCode(members), [members]);

  const mascotMood = useMemo(() => {
    if (authSuccess || createdMember) return 'success';
    if (loginError || regError || adminLoginError) return 'error';
    if (focusedField === 'pin') {
      const showing =
        (tab === 'login' && showLoginPin) ||
        (tab === 'register' && showRegisterPin) ||
        (tab === 'admin' && showAdminPin);
      return showing ? 'peeking' : 'covering_eyes';
    }
    if (focusedField !== 'none') return 'watching';
    return 'idle';
  }, [
    authSuccess,
    createdMember,
    loginError,
    regError,
    adminLoginError,
    focusedField,
    tab,
    showLoginPin,
    showRegisterPin,
    showAdminPin,
  ]);

  if (!isOpen) return null;

  const handleAvatarFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressed = await processImageFile(file, 280, 280, 0.75);
        setAvatar(compressed);
      } catch (err) {
        console.error('Avatar compression failed', err);
      }
    }
  };

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAdminLoginError('');

    const rateCheck = checkLoginRateLimit('admin_pin_login');
    if (!rateCheck.allowed) {
      setAdminLoginError(
        isBangla
          ? `অনেকবার ভুল চেষ্টা হয়েছে! অনুগ্রহ করে ${rateCheck.remainingSeconds} সেকেন্ড পর আবার চেষ্টা করুন।`
          : `Too many failed attempts! Please wait ${rateCheck.remainingSeconds}s before trying again.`
      );
      return;
    }

    const cleanPin = adminLoginPin.trim();
    if (!cleanPin) {
      setAdminLoginError(isBangla ? 'অ্যাডমিন পিন বা পাসওয়ার্ড লিখুন' : 'Enter Admin PIN or Password');
      return;
    }

    const savedAdminPass = adminPin || loadAdminPassword() || '1234';
    if (verifySecret(cleanPin, adminPinHash, savedAdminPass) && onAdminSuccess) {
      resetLoginRateLimit('admin_pin_login');
      setAuthSuccess(true);
      setTimeout(() => {
        onAdminSuccess();
        onClose();
      }, 450);
      return;
    }

    // Check Member-based delegated Sub-Admins
    const matchedMemberSub = members.find(
      (m) =>
        m.isSubAdmin &&
        m.subAdminPin &&
        verifySecret(cleanPin, undefined, m.subAdminPin)
    );
    if (matchedMemberSub && onAdminSuccess) {
      resetLoginRateLimit('admin_pin_login');
      setAuthSuccess(true);
      setTimeout(() => {
        onAdminSuccess(matchedMemberSub);
        onClose();
      }, 450);
      return;
    }

    // Check standalone Sub-Admins
    const matchedSub = subAdmins.find(
      (sa) => sa.isActive && verifySecret(cleanPin, sa.pinHash, sa.pin)
    );
    if (matchedSub && onSubAdminSuccess) {
      resetLoginRateLimit('admin_pin_login');
      setAuthSuccess(true);
      setTimeout(() => {
        onSubAdminSuccess(matchedSub);
        onClose();
      }, 450);
      return;
    }

    const failInfo = recordFailedLoginAttempt('admin_pin_login');
    setAdminLoginError(
      failInfo.locked
        ? isBangla
          ? `নিরাপত্তার কারণে ৩০ সেকেন্ডের জন্য লক করা হয়েছে।`
          : `Locked for 30 seconds due to multiple failed attempts.`
        : isBangla
        ? 'ভুল অ্যাডমিন পিন বা পাসওয়ার্ড! আবার চেষ্টা করুন।'
        : 'Invalid Admin PIN or Password! Please try again.'
    );
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    const rateCheck = checkLoginRateLimit('member_login');
    if (!rateCheck.allowed) {
      setLoginError(
        isBangla
          ? `অনেকবার ভুল চেষ্টা হয়েছে! অনুগ্রহ করে ${rateCheck.remainingSeconds} সেকেন্ড পর আবার চেষ্টা করুন।`
          : `Too many failed attempts! Please wait ${rateCheck.remainingSeconds}s.`
      );
      return;
    }

    const query = loginQuery.trim().replace(/^#/, '');
    const pin = loginPin.trim();

    if (!query) {
      setLoginError(isBangla ? 'আপনার ৪ সংখ্যার আইডি বা মোবাইল নম্বর দিন' : 'Enter your 4-digit ID or phone number');
      return;
    }

    if (!pin) {
      setLoginError(isBangla ? 'আপনার ৪ সংখ্যার গোপন পিন দিন' : 'Please enter your 4-digit PIN');
      return;
    }

    const cleanQueryDigits = query.replace(/\D/g, '');
    const found = members.find((m) => {
      if (m.memberCode === query) return true;
      const mPhoneDigits = m.phone.replace(/\D/g, '');
      if (cleanQueryDigits.length >= 6 && mPhoneDigits.endsWith(cleanQueryDigits)) return true;
      if (m.name.toLowerCase() === query.toLowerCase()) return true;
      if (m.banglaName && m.banglaName.trim() === query) return true;
      return false;
    });

    if (!found) {
      recordFailedLoginAttempt('member_login');
      setLoginError(
        isBangla
          ? 'এই আইডি বা নম্বরে কোনো সদস্য পাওয়া যায়নি! নতুন হলে "নতুন নিবন্ধন" ট্যাবে যান।'
          : 'No member found with this ID or phone! Switch to Register if you are new.'
      );
      return;
    }

    const expectedLegacyPin = found.loginPin || found.pin || '1234';
    if (!verifySecret(pin, found.pinHash, expectedLegacyPin)) {
      recordFailedLoginAttempt('member_login');
      setLoginError(
        isBangla
          ? 'ভুল পিন নম্বর! সঠিক ৪ সংখ্যার পিন দিন (পুরাতন সদস্যদের ডিফল্ট পিন: 1234)।'
          : 'Incorrect PIN! Please enter the correct 4-digit PIN (Default for legacy members: 1234).'
      );
      return;
    }

    resetLoginRateLimit('member_login');
    setAuthSuccess(true);
    setTimeout(() => {
      onLoginSuccess(found);
      onClose();
    }, 450);
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setRegError('');

    if (!name.trim() && !banglaName.trim()) {
      setRegError(isBangla ? 'অনুগ্রহ করে আপনার নাম লিখুন' : 'Please enter your name');
      return;
    }

    const cleanPhoneDigits = phone.replace(/\D/g, '');
    if (cleanPhoneDigits.length < 10) {
      setRegError(isBangla ? 'সঠিক মোবাইল নম্বর দিন (কমপক্ষে ১০ সংখ্যা)' : 'Please enter a valid phone number');
      return;
    }

    const cleanPin = registerPin.trim();
    if (cleanPin.length < 4) {
      setRegError(isBangla ? 'কমপক্ষে ৪ সংখ্যার একটি গোপন পিন সেট করুন' : 'Please set at least a 4-digit secret PIN');
      return;
    }

    const duplicatePhone = findMemberByPhone(phone, members);
    if (duplicatePhone) {
      setRegError(
        isBangla
          ? `এই মোবাইল নম্বর দিয়ে ইতিমধ্যে নিবন্ধিত আছে (${duplicatePhone.banglaName || duplicatePhone.name}, ID: #${duplicatePhone.memberCode})`
          : `Already registered with this phone (ID: #${duplicatePhone.memberCode})`
      );
      return;
    }

    const finalEnglishName = name.trim() || banglaName.trim();
    const finalBanglaName = banglaName.trim() || name.trim();
    const categoryWeeklyFee = participatesInSports
      ? getCategoryDefaultWeeklyFee(memberCategory, clubSettings)
      : 0;

    const payload: Omit<Member, 'id'> = {
      memberCode: nextMemberCode,
      avatar,
      name: finalEnglishName,
      banglaName: finalBanglaName,
      phone: phone.trim(),
      weeklyAmount: categoryWeeklyFee,
      role: 'Member',
      preferredSport,
      contributionType: 'weekly',
      memberCategory,
      participatesInSports,
      pin: cleanPin,
      loginPin: cleanPin,
      pinHash: hashSecretSync(cleanPin),
      joiningDate: new Date().toLocaleDateString('en-GB'),
      isActive: true,
    };

    setIsSubmitting(true);
    try {
      const registerCallback = onRegisterMember || onSignUp;
      const result = registerCallback ? await registerCallback(payload) : undefined;
      const resolvedMember: Member =
        result && typeof result === 'object' && 'id' in result
          ? (result as Member)
          : { ...payload, id: `m-${Date.now()}` };

      setCreatedMember(resolvedMember);
    } catch (err) {
      console.error('Registration error', err);
      setRegError(isBangla ? 'নিবন্ধন সম্পন্ন করা যায়নি, আবার চেষ্টা করুন' : 'Registration failed, please try again');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[92vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 px-5 pt-4 pb-3 text-white relative">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-200" />
                <h3 className="font-black text-base">
                  {tab === 'admin'
                    ? isBangla
                      ? 'অ্যাডমিন ও সাব-অ্যাডমিন লগইন'
                      : 'Admin & Sub-Admin Login'
                    : isBangla
                    ? 'সদস্য লগইন ও নিবন্ধন'
                    : 'Member Login & Sign Up'}
                </h3>
              </div>
              <p className="text-[11px] text-emerald-100 mt-0.5">
                {tab === 'admin'
                  ? isBangla
                    ? 'ক্লাব পরিচালনা ও হিসাব আপডেট করতে গোপন পিন দিন'
                    : 'Enter secret PIN to manage club & accounting'
                  : isBangla
                  ? 'লগইন করলে আপনার ব্যক্তিগত প্রোফাইল ও বকেয়া/জমার হিসাব দেখতে পাবেন'
                  : 'Sign in or register to view your personal dues & payment status'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="mt-2 -mb-1">
            <FunnyGirlMascot
              mood={mascotMood}
              inputLength={
                focusedField === 'id'
                  ? loginQuery.length
                  : focusedField === 'name'
                  ? (banglaName || name).length
                  : focusedField === 'phone'
                  ? phone.length
                  : 0
              }
              isBangla={isBangla}
            />
          </div>
        </div>

        {createdMember ? (
          <div className="p-6 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div>
              <h4 className="text-lg font-black text-slate-900 dark:text-white">
                {isBangla ? 'অভিনন্দন! নিবন্ধন সফল হয়েছে 🎉' : 'Registration Successful! 🎉'}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {isBangla
                  ? 'নিচের ৪ সংখ্যার মেম্বার আইডি এবং আপনার পিন নম্বরটি মনে রাখুন।'
                  : 'Please save your 4-digit Member ID and PIN for future login.'}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border-2 border-emerald-500/40 space-y-2">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                  {isBangla ? 'আপনার মেম্বার আইডি (Member ID)' : 'Your Member ID'}
                </p>
                <p className="text-3xl font-black font-mono tracking-widest text-emerald-600 dark:text-emerald-400 mt-0.5">
                  #{createdMember.memberCode}
                </p>
              </div>
              <div className="pt-2 border-t border-emerald-500/20 flex items-center justify-center gap-4 text-xs">
                <span className="font-bold text-slate-700 dark:text-slate-300">
                  {createdMember.banglaName || createdMember.name}
                </span>
                <span className="font-mono font-bold bg-amber-500/20 text-amber-700 dark:text-amber-300 px-2.5 py-0.5 rounded-lg">
                  PIN: {createdMember.pin || createdMember.loginPin}
                </span>
                <span className="font-mono font-bold bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 px-2.5 py-0.5 rounded-lg">
                  ৳{createdMember.weeklyAmount}/{isBangla ? 'সপ্তাহ' : 'wk'}
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                onLoginSuccess(createdMember);
                onClose();
              }}
              className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm shadow-lg shadow-emerald-600/25 transition"
            >
              {isBangla ? 'ড্যাশবোর্ডে প্রবেশ করুন' : 'Continue to My Account'}
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 p-1.5 m-4 rounded-2xl gap-1">
              <button
                type="button"
                onClick={() => {
                  setTab('login');
                  setLoginError('');
                  setRegError('');
                  setAdminLoginError('');
                }}
                className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-extrabold transition-all ${
                  tab === 'login'
                    ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>{isBangla ? 'সদস্য লগইন' : 'Member Login'}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setTab('register');
                  setLoginError('');
                  setRegError('');
                  setAdminLoginError('');
                }}
                className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-extrabold transition-all ${
                  tab === 'register'
                    ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>{isBangla ? 'নতুন নিবন্ধন' : 'Sign Up'}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setTab('admin');
                  setLoginError('');
                  setRegError('');
                  setAdminLoginError('');
                }}
                className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-extrabold transition-all ${
                  tab === 'admin'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-amber-600 dark:text-amber-400 hover:bg-amber-500/10'
                }`}
              >
                <Lock className="w-3.5 h-3.5" />
                <span>{isBangla ? 'অ্যাডমিন পিন' : 'Admin PIN'}</span>
              </button>
            </div>

            {tab === 'admin' ? (
              <form onSubmit={handleAdminSubmit} className="px-5 pb-6 space-y-4">
                <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
                  {isBangla
                    ? '🔐 মাস্টার অ্যাডমিন অথবা সাব-অ্যাডমিন পিন দিয়ে লগইন করুন। পাসওয়ার্ড লেখার সময় আমাদের মাসকট চোখ বন্ধ করে ফেলবে!'
                    : '🔐 Sign in using Master Admin or Sub-Admin PIN. Our mascot covers her eyes while you type!'}
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mb-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-amber-500" />
                    <span>{isBangla ? 'অ্যাডমিন / সাব-অ্যাডমিন পিন' : 'Admin / Sub-Admin PIN'}</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showAdminPin ? 'text' : 'password'}
                      value={adminLoginPin}
                      onFocus={() => setFocusedField('pin')}
                      onBlur={() => setFocusedField('none')}
                      onChange={(e) => {
                        setAdminLoginPin(e.target.value);
                        setAdminLoginError('');
                      }}
                      placeholder="••••"
                      className="w-full px-4 py-3 pr-11 rounded-2xl border border-amber-400 dark:border-amber-600 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-bold text-base tracking-widest focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowAdminPin(!showAdminPin)}
                      className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                      title={showAdminPin ? 'Hide PIN' : 'Show PIN'}
                    >
                      {showAdminPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {adminLoginError && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-bold">
                    {adminLoginError}
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm shadow-lg shadow-amber-500/25 transition flex items-center justify-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{isBangla ? 'অ্যাডমিন লগইন করুন' : 'Login as Admin'}</span>
                </button>
              </form>
            ) : tab === 'login' ? (
              <form onSubmit={handleLoginSubmit} className="px-5 pb-6 space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                    {isBangla
                      ? 'আপনার ৪ সংখ্যার মেম্বার আইডি অথবা মোবাইল নম্বর'
                      : 'Your 4-Digit Member ID or Phone Number'}
                  </label>
                  <input
                    type="text"
                    value={loginQuery}
                    onFocus={() => setFocusedField('id')}
                    onBlur={() => setFocusedField('none')}
                    onChange={(e) => {
                      setLoginQuery(e.target.value);
                      setLoginError('');
                    }}
                    placeholder={isBangla ? 'যেমন: 1001 বা 01711...' : 'e.g. 1001 or 01711...'}
                    className="w-full px-4 py-2.5 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mb-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{isBangla ? '৪ সংখ্যার গোপন পিন (PIN)' : '4-Digit Secret PIN'}</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showLoginPin ? 'text' : 'password'}
                      maxLength={8}
                      value={loginPin}
                      onFocus={() => setFocusedField('pin')}
                      onBlur={() => setFocusedField('none')}
                      onChange={(e) => {
                        setLoginPin(e.target.value);
                        setLoginError('');
                      }}
                      placeholder={isBangla ? 'পিন দিন (যেমন: 1234)' : 'Enter PIN (e.g. 1234)'}
                      className="w-full px-4 py-2.5 pr-11 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-bold text-sm tracking-widest focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPin(!showLoginPin)}
                      className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      {showLoginPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {loginError && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-bold">
                    {loginError}
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm shadow-lg shadow-emerald-600/25 transition flex items-center justify-center gap-2"
                >
                  <LogIn className="w-4 h-4" />
                  <span>{isBangla ? 'লগইন করুন' : 'Sign In'}</span>
                </button>
              </form>
            ) : (
              <form onSubmit={handleRegisterSubmit} className="px-5 pb-6 space-y-3.5">
                <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3.5">
                  <div className="relative flex-shrink-0">
                    <div className="w-14 h-14 rounded-2xl overflow-hidden bg-slate-200 dark:bg-slate-800 flex items-center justify-center border-2 border-emerald-500/40">
                      {avatar ? (
                        <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-2xl">🏸</span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute -bottom-1 -right-1 bg-emerald-600 text-white rounded-full p-1 shadow"
                    >
                      <Camera className="w-3.5 h-3.5" />
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarFile}
                    />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block">
                      {isBangla ? 'আপনার নতুন মেম্বার আইডি হবে:' : 'Your Assigned Member ID:'}
                    </span>
                    <span className="text-xl font-black font-mono text-emerald-600 dark:text-emerald-400 tracking-wider">
                      #{nextMemberCode}
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      {isBangla ? 'ছবি দিতে ক্যামেরা আইকনে ক্লিক করুন' : 'Tap camera icon to add photo'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      {isBangla ? 'আপনার নাম (বাংলায়) *' : 'Name (Bangla)'}
                    </label>
                    <input
                      type="text"
                      value={banglaName}
                      onFocus={() => setFocusedField('name')}
                      onBlur={() => setFocusedField('none')}
                      onChange={(e) => setBanglaName(e.target.value)}
                      placeholder="যেমন: তানভীর আহমেদ"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      {isBangla ? 'নাম (ইংরেজি)' : 'Name (English) *'}
                    </label>
                    <input
                      type="text"
                      value={name}
                      onFocus={() => setFocusedField('name')}
                      onBlur={() => setFocusedField('none')}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Tanvir Ahmed"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      {isBangla ? 'মোবাইল নম্বর *' : 'Phone Number *'}
                    </label>
                    <input
                      type="text"
                      required
                      value={phone}
                      onFocus={() => setFocusedField('phone')}
                      onBlur={() => setFocusedField('none')}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+88017..."
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      {isBangla ? '৪ সংখ্যার গোপন পিন *' : '4-Digit Secret PIN *'}
                    </label>
                    <div className="relative">
                      <input
                        type={showRegisterPin ? 'text' : 'password'}
                        required
                        maxLength={8}
                        value={registerPin}
                        onFocus={() => setFocusedField('pin')}
                        onBlur={() => setFocusedField('none')}
                        onChange={(e) => setRegisterPin(e.target.value.replace(/\s/g, ''))}
                        placeholder="যেমন: 1234"
                        className="w-full px-3 py-2 pr-8 rounded-xl border border-emerald-400 dark:border-emerald-600 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-bold text-xs tracking-widest focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegisterPin(!showRegisterPin)}
                        className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600"
                      >
                        {showRegisterPin ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    {isBangla ? 'প্রিয় খেলা' : 'Preferred Sport'}
                  </label>
                  <select
                    value={preferredSport}
                    onChange={(e) => setPreferredSport(e.target.value as SportType)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="badminton">🏸 ব্যাডমিন্টন</option>
                    <option value="cricket">🏏 ক্রিকেট</option>
                    <option value="football">⚽ ফুটবল</option>
                    <option value="multi">🏆 সব খেলা</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    {isBangla ? 'বয়স ক্যাটাগরি ও নির্ধারিত চাঁদা' : 'Age Category & Default Fee'}
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      {
                        id: 'child' as const,
                        label: isBangla ? '🧒 বাচ্চা' : '🧒 Child',
                        fee: getCategoryDefaultWeeklyFee('child', clubSettings),
                      },
                      {
                        id: 'teen' as const,
                        label: isBangla ? '🧑‍🦱 কিশোর' : '🧑‍🦱 Teen',
                        fee: getCategoryDefaultWeeklyFee('teen', clubSettings),
                      },
                      {
                        id: 'youth' as const,
                        label: isBangla ? '👨‍🦱 যুবক' : '👨‍🦱 Youth',
                        fee: getCategoryDefaultWeeklyFee('youth', clubSettings),
                      },
                    ].map((cat) => (
                      <button
                        type="button"
                        key={cat.id}
                        onClick={() => setMemberCategory(cat.id)}
                        className={`py-2 px-2 rounded-xl border text-xs font-bold transition ${
                          memberCategory === cat.id
                            ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                            : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        <div>{cat.label}</div>
                        <div className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">
                          ৳{cat.fee}/{isBangla ? 'সপ্তাহ' : 'wk'}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <label className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={participatesInSports}
                    onChange={(e) => setParticipatesInSports(e.target.checked)}
                    className="mt-0.5 w-4 h-4 text-emerald-600 rounded"
                  />
                  <span className="text-[11px] text-slate-700 dark:text-slate-300 font-semibold leading-snug">
                    {isBangla
                      ? `নিয়মিত খেলায় অংশ নেব (সাপ্তাহিক চাঁদা: ৳${
                          participatesInSports ? getCategoryDefaultWeeklyFee(memberCategory, clubSettings) : 0
                        }) — শুধু ফান্ডে অনুদান দিতে চাইলে টিক উঠিয়ে দিন`
                      : `I participate in regular sports (Weekly fee: ৳${
                          participatesInSports ? getCategoryDefaultWeeklyFee(memberCategory, clubSettings) : 0
                        }) — uncheck if funding/patron only`}
                  </span>
                </label>

                {regError && (
                  <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-bold">
                    {regError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white font-black text-sm shadow-lg shadow-emerald-600/25 transition flex items-center justify-center gap-2"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>
                    {isSubmitting
                      ? isBangla
                        ? 'নিবন্ধন হচ্ছে...'
                        : 'Registering...'
                      : isBangla
                      ? 'নিবন্ধন সম্পন্ন করুন'
                      : 'Complete Registration'}
                  </span>
                </button>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
};

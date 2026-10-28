import React, { useState, useRef, useEffect } from 'react';
import {
  Member,
  Payment,
  MonthlyPayment,
  SavingsDeposit,
  CustomFund,
  FundContribution,
  SportType,
  MemberCategory,
} from '../types';
import { formatCurrency, formatNumber, Language, translations } from '../utils/language';
import { SPORTS_MAP } from '../utils/sports';
import { processImageFile } from '../utils/imageUtils';
import {
  User,
  Phone,
  Mail,
  MapPin,
  Droplet,
  KeyRound,
  ShieldCheck,
  LogOut,
  Camera,
  Check,
  Save,
  Languages,
  Moon,
  Sun,
  Calendar,
  PiggyBank,
  Coins,
  Receipt,
  Copy,
  AlertCircle,
  Eye,
  EyeOff,
  Sparkles,
} from 'lucide-react';

interface Props {
  member: Member;
  payments: Payment[];
  monthlyPayments: MonthlyPayment[];
  savingsDeposits: SavingsDeposit[];
  fundContributions: FundContribution[];
  funds: CustomFund[];
  lang: Language;
  onToggleLang: () => void;
  isDark: boolean;
  onToggleDark: () => void;
  onUpdateMember: (updated: Member) => void;
  onLogout: () => void;
  onOpenReceipt?: (payment: Payment) => void;
}

export const MemberSettingsView: React.FC<Props> = ({
  member,
  payments,
  monthlyPayments,
  savingsDeposits,
  fundContributions,
  funds,
  lang,
  onToggleLang,
  isDark,
  onToggleDark,
  onUpdateMember,
  onLogout,
  onOpenReceipt,
}) => {
  const isBangla = lang === 'bn';
  const t = translations[lang];

  // Editable Profile fields
  const [name, setName] = useState(member.name);
  const [banglaName, setBanglaName] = useState(member.banglaName || '');
  const [phone, setPhone] = useState(member.phone || '');
  const [email, setEmail] = useState(member.email || '');
  const [bloodGroup, setBloodGroup] = useState(member.bloodGroup || '');
  const [address, setAddress] = useState(member.address || '');
  const [avatar, setAvatar] = useState(member.avatar || '');
  const [preferredSport, setPreferredSport] = useState<SportType>(member.preferredSport || 'badminton');
  const [memberCategory, setMemberCategory] = useState<MemberCategory>(member.memberCategory || 'youth');

  // PIN change state
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [pinError, setPinError] = useState<string | null>(null);
  const [pinSuccess, setPinSuccess] = useState(false);

  // Profile save feedback
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync state if member prop changes
  useEffect(() => {
    setName(member.name);
    setBanglaName(member.banglaName || '');
    setPhone(member.phone || '');
    setEmail(member.email || '');
    setBloodGroup(member.bloodGroup || '');
    setAddress(member.address || '');
    setAvatar(member.avatar || '');
    setPreferredSport(member.preferredSport || 'badminton');
    setMemberCategory(member.memberCategory || 'youth');
  }, [member]);

  // Compute Personal Financial Summary
  const isPatronOnly = member.participatesInSports === false;
  const myWeeklyPayments = payments
    .filter((p) => p.memberId === member.id)
    .map((p) =>
      isPatronOnly && (p.paidAmount || 0) === 0 ? { ...p, expectedAmount: 0 } : p
    );
  const totalWeeklyExpected = myWeeklyPayments.reduce((acc, p) => acc + (p.expectedAmount || 0), 0);
  const totalWeeklyPaid = myWeeklyPayments.reduce((acc, p) => acc + (p.paidAmount || 0), 0);

  const myMonthlyPayments = monthlyPayments.filter((p) => p.memberId === member.id);
  const totalMonthlyExpected = myMonthlyPayments.reduce((acc, p) => acc + (p.expectedAmount || 0), 0);
  const totalMonthlyPaid = myMonthlyPayments.reduce((acc, p) => acc + (p.paidAmount || 0), 0);

  const totalExpected = totalWeeklyExpected + totalMonthlyExpected;
  const totalPaid = totalWeeklyPaid + totalMonthlyPaid;
  const totalDue = Math.max(0, totalExpected - totalPaid);

  const mySavings = savingsDeposits
    .filter((s) => s.memberId === member.id)
    .reduce((acc, s) => (s.type === 'DEPOSIT' ? acc + s.amount : acc - s.amount), 0);

  const myFundsTotal = fundContributions
    .filter((fc) => fc.memberId === member.id)
    .reduce((acc, fc) => acc + (fc.paidAmount || 0), 0);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploadingImage(true);
      try {
        const compressed = await processImageFile(file, 600, 600, 0.82);
        setAvatar(compressed);
        // Automatically save avatar change
        const updated = { ...member, avatar: compressed };
        onUpdateMember(updated);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } catch (err) {
        console.error('Failed to compress avatar:', err);
      } finally {
        setIsUploadingImage(false);
      }
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError(null);

    if (!name.trim()) {
      setSaveError(isBangla ? 'আপনার নাম প্রদান করা আবশ্যক।' : 'Name is required.');
      return;
    }

    if (!phone.trim()) {
      setSaveError(isBangla ? 'মোবাইল নম্বর প্রদান করা আবশ্যক।' : 'Phone number is required.');
      return;
    }

    const updated: Member = {
      ...member,
      name: name.trim(),
      banglaName: banglaName.trim() || undefined,
      phone: phone.trim(),
      email: email.trim() || undefined,
      bloodGroup: bloodGroup.trim() || undefined,
      address: address.trim() || undefined,
      avatar: avatar || undefined,
      preferredSport,
      memberCategory,
    };

    onUpdateMember(updated);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3500);
  };

  const handleChangePin = (e: React.FormEvent) => {
    e.preventDefault();
    setPinError(null);

    // If an existing PIN was set, verify current PIN
    if (member.pin && member.pin.trim() !== '') {
      if (currentPin.trim() !== member.pin.trim()) {
        setPinError(isBangla ? 'বর্তমান গোপন পিনটি সঠিক নয়।' : 'Current PIN is incorrect.');
        return;
      }
    }

    if (!newPin.trim() || newPin.trim().length !== 4 || !/^\d{4}$/.test(newPin.trim())) {
      setPinError(isBangla ? 'নতুন পিন অবশ্যই ৪ সংখ্যার ডিজিট হতে হবে (যেমন: ১২৩৪)।' : 'New PIN must be exactly 4 numeric digits.');
      return;
    }

    if (newPin.trim() !== confirmPin.trim()) {
      setPinError(isBangla ? 'নতুন পিন এবং কনফার্ম পিন মেলেনি।' : 'New PIN and Confirm PIN do not match.');
      return;
    }

    const updated: Member = {
      ...member,
      pin: newPin.trim(),
    };

    onUpdateMember(updated);
    setPinSuccess(true);
    setCurrentPin('');
    setNewPin('');
    setConfirmPin('');
    setTimeout(() => setPinSuccess(false), 4000);
  };

  const handleCopyId = () => {
    navigator.clipboard.writeText(member.memberCode);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const getCategoryLabel = (cat?: MemberCategory) => {
    if (cat === 'child') return isBangla ? 'বাচ্চা (Child)' : 'Child';
    if (cat === 'teen') return isBangla ? 'কিশোর (Teen)' : 'Teen';
    return isBangla ? 'যুবক (Youth)' : 'Youth';
  };

  return (
    <div className="space-y-5 pb-24 max-w-4xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                {isBangla ? 'আমার প্রোফাইল ও সেটিংস' : 'My Profile & Account Settings'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isBangla
                  ? 'আপনার ব্যক্তিগত তথ্য, মোবাইল নম্বর, ছবি ও গোপন পিন পরিচালনা করুন'
                  : 'Manage your profile details, contact info, photo, and secret login PIN'}
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={onLogout}
          type="button"
          className="self-start sm:self-auto px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/40 text-rose-600 dark:text-rose-300 font-bold text-xs flex items-center gap-1.5 border border-rose-200 dark:border-rose-900/60 transition-colors shadow-sm active:scale-95"
        >
          <LogOut className="w-4 h-4" />
          <span>{isBangla ? 'লগআউট করুন' : 'Log Out'}</span>
        </button>
      </div>

      {/* Hero Member Profile Card */}
      <div className="rounded-3xl bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-slate-50 dark:from-slate-800 dark:via-slate-800/80 dark:to-slate-900 p-5 sm:p-6 border border-emerald-200/80 dark:border-slate-700 shadow-sm flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
        {/* Avatar with Camera upload */}
        <div className="relative group shrink-0">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl overflow-hidden bg-white dark:bg-slate-900 border-4 border-emerald-500 shadow-xl p-1 flex items-center justify-center">
            {avatar ? (
              <img src={avatar} alt={member.name} className="w-full h-full object-cover rounded-2xl" />
            ) : (
              <div className="w-full h-full rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-700 text-white flex items-center justify-center text-4xl font-black">
                {member.name.charAt(0)}
              </div>
            )}
          </div>

          <button
            type="button"
            disabled={isUploadingImage}
            onClick={() => fileInputRef.current?.click()}
            title={isBangla ? 'প্রোফাইল ছবি পরিবর্তন করুন' : 'Change profile photo'}
            className="absolute -bottom-1 -right-1 p-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg border-2 border-white dark:border-slate-900 transition-all active:scale-95"
          >
            <Camera className="w-4 h-4" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarUpload}
          />
        </div>

        {/* Info */}
        <div className="space-y-1.5 flex-1 min-w-0">
          <div className="flex items-center gap-2 justify-center sm:justify-start flex-wrap">
            {/* 4-digit ID Badge */}
            <button
              type="button"
              onClick={handleCopyId}
              title={isBangla ? 'আইডি কপি করতে ক্লিক করুন' : 'Click to copy ID'}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-600 text-white font-mono font-black text-xs shadow-sm hover:bg-emerald-700 transition-colors"
            >
              <span>ID #{member.memberCode}</span>
              {copiedId ? <Check className="w-3 h-3 text-lime-300" /> : <Copy className="w-3 h-3 text-white/80" />}
            </button>

            <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold border border-slate-200 dark:border-slate-700">
              {getCategoryLabel(member.memberCategory)}
            </span>

            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 text-xs font-bold">
              {SPORTS_MAP[member.preferredSport || 'badminton']?.emoji}{' '}
              {isBangla
                ? SPORTS_MAP[member.preferredSport || 'badminton']?.nameBangla
                : SPORTS_MAP[member.preferredSport || 'badminton']?.name}
            </span>
          </div>

          <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white pt-1">
            {isBangla && member.banglaName ? member.banglaName : member.name}
          </h3>
          {member.banglaName && (
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              {member.name}
            </p>
          )}

          <div className="flex items-center gap-4 justify-center sm:justify-start flex-wrap text-xs text-slate-600 dark:text-slate-300 pt-1">
            <span className="flex items-center gap-1 font-mono">
              <Phone className="w-3.5 h-3.5 text-emerald-600" />
              <span>{member.phone}</span>
            </span>

            {member.bloodGroup && (
              <span className="flex items-center gap-1 font-bold text-rose-600 dark:text-rose-400">
                <Droplet className="w-3.5 h-3.5" />
                <span>{member.bloodGroup}</span>
              </span>
            )}

            {member.address && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>{member.address}</span>
              </span>
            )}

            <span className="flex items-center gap-1 text-slate-400">
              <Calendar className="w-3.5 h-3.5" />
              <span>{isBangla ? 'যোগদান:' : 'Joined:'} {member.joiningDate}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Financial Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-1">
          <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-medium">
            {isBangla ? 'মোট প্রদানকৃত চাঁদা' : 'Total Paid Fees'}
          </span>
          <span className="text-lg font-black text-emerald-600 dark:text-emerald-400 font-mono block">
            {formatCurrency(totalPaid, isBangla)}
          </span>
          <span className="text-[10px] text-slate-400">
            {isBangla ? 'ধার্য:' : 'Expected:'} {formatCurrency(totalExpected, isBangla)}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-1">
          <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-medium">
            {isBangla ? 'বর্তমান বকেয়া' : 'Current Due'}
          </span>
          <span className={`text-lg font-black font-mono block ${totalDue > 0 ? 'text-rose-500' : 'text-emerald-600'}`}>
            {formatCurrency(totalDue, isBangla)}
          </span>
          <span className="text-[10px] text-slate-400">
            {totalDue > 0 ? (isBangla ? 'পরিশোধ বাকি' : 'Unpaid') : (isBangla ? 'সব পরিশোধিত ✓' : 'All Cleared ✓')}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-1">
          <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
            <PiggyBank className="w-3.5 h-3.5 text-amber-500" />
            <span>{isBangla ? 'আমার সঞ্চয়' : 'My Savings'}</span>
          </div>
          <span className="text-lg font-black text-amber-600 dark:text-amber-400 font-mono block">
            {formatCurrency(mySavings, isBangla)}
          </span>
          <span className="text-[10px] text-slate-400">
            {isBangla ? 'সঞ্চয় ফান্ডে সংরক্ষিত' : 'In Savings Vault'}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-1">
          <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
            <Coins className="w-3.5 h-3.5 text-blue-500" />
            <span>{isBangla ? 'কল্যাণ তহবিল' : 'Custom Funds'}</span>
          </div>
          <span className="text-lg font-black text-blue-600 dark:text-blue-400 font-mono block">
            {formatCurrency(myFundsTotal, isBangla)}
          </span>
          <span className="text-[10px] text-slate-400">
            {isBangla ? 'অনুদান সম্পন্ন' : 'Contributed'}
          </span>
        </div>
      </div>

      {/* Profile Edit Form */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-600">
              <User className="w-4 h-4" />
            </div>
            <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
              {isBangla ? 'আমার ব্যক্তিগত তথ্য সম্পাদনা' : 'Edit My Profile Information'}
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            ID #{member.memberCode}
          </span>
        </div>

        {saveSuccess && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 flex items-center gap-2 text-xs font-bold text-emerald-800 dark:text-emerald-200 animate-fadeIn">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{isBangla ? 'আপনার প্রোফাইল তথ্য সফলভাবে সংরক্ষণ করা হয়েছে! 🎉' : 'Profile updated successfully! 🎉'}</span>
          </div>
        )}

        {saveError && (
          <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800 flex items-center gap-2 text-xs font-bold text-rose-800 dark:text-rose-200 animate-fadeIn">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{saveError}</span>
          </div>
        )}

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                {isBangla ? 'নাম (ইংরেজি)' : 'Name (English)'} *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                {isBangla ? 'নাম (বাংলায়)' : 'Name (Bengali)'}
              </label>
              <input
                type="text"
                value={banglaName}
                onChange={(e) => setBanglaName(e.target.value)}
                placeholder="যেমন: সাকিব আল হাসান"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                {isBangla ? 'মোবাইল নম্বর' : 'Phone Number'} *
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="01700000000"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                {isBangla ? 'ইমেইল অ্যাড্রেস' : 'Email Address'}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@example.com"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                {isBangla ? 'রক্তের গ্রুপ' : 'Blood Group'}
              </label>
              <select
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                <option value="">{isBangla ? '-- নির্বাচন করুন --' : '-- Select Blood Group --'}</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                {isBangla ? 'বয়সের ক্যাটাগরি' : 'Age Category'}
              </label>
              <select
                value={memberCategory}
                onChange={(e) => setMemberCategory(e.target.value as MemberCategory)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                <option value="youth">{isBangla ? 'যুবক (Youth)' : 'Youth'}</option>
                <option value="teen">{isBangla ? 'কিশোর (Teen)' : 'Teen'}</option>
                <option value="child">{isBangla ? 'বাচ্চা (Child)' : 'Child'}</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                {isBangla ? 'পছন্দের খেলা' : 'Preferred Sport'}
              </label>
              <select
                value={preferredSport}
                onChange={(e) => setPreferredSport(e.target.value as SportType)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                <option value="badminton">🏸 {isBangla ? 'ব্যাডমিন্টন' : 'Badminton'}</option>
                <option value="cricket">🏏 {isBangla ? 'ক্রিকেট' : 'Cricket'}</option>
                <option value="football">⚽ {isBangla ? 'ফুটবল' : 'Football'}</option>
                <option value="multi">🏆 {isBangla ? 'বহুবিধ খেলা' : 'Multi-Sports'}</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                {isBangla ? 'বর্তমান ঠিকানা / এলাকা' : 'Current Address / Area'}
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder={isBangla ? 'যেমন: ধানমন্ডি, ঢাকা' : 'e.g. Dhaka, Bangladesh'}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs shadow-md shadow-emerald-500/20 flex items-center gap-2 active:scale-95 transition-all"
            >
              <Save className="w-4 h-4" />
              <span>{isBangla ? 'তথ্য পরিবর্তন সেভ করুন' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* 4-Digit Login PIN Change Section */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-600">
            <KeyRound className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
              {isBangla ? 'লগইন ৪-সংখ্যার গোপন পিন পরিবর্তন' : 'Change 4-Digit Secret Login PIN'}
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {isBangla
                ? 'আপনার মেম্বার পোর্টালে লগইন করার জন্য ৪-সংখ্যার গোপন পিন সেট করুন।'
                : 'Set a secret 4-digit numeric PIN for secure login.'}
            </p>
          </div>
        </div>

        {pinSuccess && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 flex items-center gap-2 text-xs font-bold text-emerald-800 dark:text-emerald-200 animate-fadeIn">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{isBangla ? 'আপনার লগইন গোপন পিন সফলভাবে পরিবর্তন করা হয়েছে! 🔐' : 'Login PIN changed successfully! 🔐'}</span>
          </div>
        )}

        {pinError && (
          <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800 flex items-center gap-2 text-xs font-bold text-rose-800 dark:text-rose-200 animate-fadeIn">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{pinError}</span>
          </div>
        )}

        <form onSubmit={handleChangePin} className="space-y-3.5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {member.pin && member.pin.trim() !== '' && (
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  {isBangla ? 'বর্তমান পিন (Current PIN)' : 'Current PIN'} *
                </label>
                <div className="relative">
                  <input
                    type={showPin ? 'text' : 'password'}
                    required
                    maxLength={4}
                    value={currentPin}
                    onChange={(e) => setCurrentPin(e.target.value.replace(/\D/g, ''))}
                    placeholder="••••"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold tracking-widest focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPin(!showPin)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPin ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            )}

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                {isBangla ? 'নতুন ৪-সংখ্যার পিন (New PIN)' : 'New 4-Digit PIN'} *
              </label>
              <input
                type={showPin ? 'text' : 'password'}
                required
                maxLength={4}
                value={newPin}
                onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                placeholder="যেমন: ১২৩৪"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold tracking-widest focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                {isBangla ? 'কনফার্ম নতুন পিন' : 'Confirm New PIN'} *
              </label>
              <input
                type={showPin ? 'text' : 'password'}
                required
                maxLength={4}
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                placeholder="••••"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold tracking-widest focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 active:scale-95 transition-all"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>{isBangla ? 'পিন পরিবর্তন করুন' : 'Update PIN'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* App Preferences (Theme & Language) */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
            {isBangla ? 'অ্যাপ ডিসপ্লে পছন্দ' : 'Display Preferences'}
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {isBangla ? 'ভাষা পরিবর্তন এবং ডার্ক / লাইট মোড নির্বাচন করুন' : 'Switch app language and toggle dark/light appearance'}
          </p>
        </div>

        <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
          <button
            type="button"
            onClick={onToggleLang}
            className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 border border-slate-200 dark:border-slate-700 transition-colors"
          >
            <Languages className="w-4 h-4 text-emerald-600" />
            <span>{lang === 'bn' ? 'English' : 'বাংলা'}</span>
          </button>

          <button
            type="button"
            onClick={onToggleDark}
            className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 border border-slate-200 dark:border-slate-700 transition-colors"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            <span>{isDark ? (isBangla ? 'লাইট মোড' : 'Light Mode') : (isBangla ? 'ডার্ক মোড' : 'Dark Mode')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

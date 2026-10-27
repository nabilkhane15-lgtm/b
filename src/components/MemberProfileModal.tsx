import React, { useState, useRef } from 'react';
import {
  Member,
  Payment,
  Week,
  SavingsDeposit,
  SportType,
  ContributionType,
  CustomFund,
  FundContribution,
  DelegatedPermission,
  Role,
} from '../types';
import { formatCurrency, formatNumber, Language, translations } from '../utils/language';
import { SPORTS_MAP } from '../utils/sports';
import { StatusBadge } from './StatusBadge';
import { processImageFile } from '../utils/imageUtils';
import {
  X,
  User,
  Calendar,
  Phone,
  ShieldAlert,
  Share2,
  Receipt,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Send,
  PiggyBank,
  Plus,
  ArrowDownRight,
  ArrowUpRight,
  Coins,
  Camera,
  ShieldCheck,
  KeyRound,
  Award,
  Edit2,
} from 'lucide-react';

interface Props {
  member: Member;
  payments: Payment[];
  weeks: Week[];
  savingsDeposits?: SavingsDeposit[];
  funds?: CustomFund[];
  fundContributions?: FundContribution[];
  lang: Language;
  isAdmin: boolean;
  onClose: () => void;
  onOpenReceipt: (payment: Payment) => void;
  onDeleteMember?: (memberId: string) => void;
  onOpenAddSavings?: (memberId: string) => void;
  onUpdateMember?: (updatedMember: Member) => void;
  onEditPayment?: (payment: Payment, week?: Week) => void;
}

export const MemberProfileModal: React.FC<Props> = ({
  member,
  payments,
  weeks,
  savingsDeposits = [],
  funds = [],
  fundContributions = [],
  lang,
  isAdmin,
  onClose,
  onOpenReceipt,
  onDeleteMember,
  onOpenAddSavings,
  onUpdateMember,
  onEditPayment,
}) => {
  const t = translations[lang];
  const isBangla = lang === 'bn';
  const memberName = isBangla && member.banglaName ? member.banglaName : member.name;
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const [isEditingRole, setIsEditingRole] = useState(false);
  const [tempAssignedDuty, setTempAssignedDuty] = useState(member.assignedDuty || '');
  const [tempPermissions, setTempPermissions] = useState<DelegatedPermission[]>(member.delegatedPermissions || []);
  const [tempPin, setTempPin] = useState(member.subAdminPin || '');
  const [tempRole, setTempRole] = useState<Role>(member.role || 'Member');

  const togglePermission = (perm: DelegatedPermission) => {
    setTempPermissions((prev) =>
      prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]
    );
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onUpdateMember) {
      try {
        const compressed = await processImageFile(file, 280, 280, 0.75);
        onUpdateMember({
          ...member,
          avatar: compressed,
        });
      } catch (err) {
        console.error('Failed to update avatar', err);
      }
    }
  };

  // Filter all payments belonging to this member across all weeks
  const memberPayments = payments.filter((p) => p.memberId === member.id);

  const totalPaid = memberPayments.reduce((acc, p) => acc + p.paidAmount, 0);
  const totalExpected = memberPayments.reduce((acc, p) => acc + p.expectedAmount, 0);
  const currentDue = Math.max(totalExpected - totalPaid, 0);

  const paidWeeksCount = memberPayments.filter((p) => p.status === 'PAID').length;
  const missedWeeksCount = memberPayments.filter((p) => p.status === 'UNPAID').length;

  // Member's savings deposits
  const memberSavings = savingsDeposits.filter((d) => d.memberId === member.id);
  const memberSavingsBalance = memberSavings.reduce(
    (acc, d) => (d.type === 'DEPOSIT' ? acc + d.amount : acc - d.amount),
    0
  );

  // Member's contributions in Custom Funds
  const myFundContributions = fundContributions.filter((c) => c.memberId === member.id);
  const totalFundDonations = myFundContributions.reduce((acc, c) => acc + c.paidAmount, 0);

  const sportMeta = SPORTS_MAP[member.preferredSport || 'badminton'];

  const handleSendReminder = () => {
    const text = isBangla
      ? `🏸 *স্ম্যাশার্স স্পোর্টস ও ওয়েলফেয়ার ক্লাব - পেমেন্ট তাগাদা*\n\nপ্রিয় ${memberName} ভাই, আশা করি ভালো আছেন।\nআমাদের ক্লাবের চলতি হিসাব অনুযায়ী আপনার বকেয়া চাঁদার পরিমাণ: *${formatCurrency(currentDue, true)}*।\nঅনুগ্রহ করে bKash বা Nagad-এ প্রদান করে হিসাব হালনাগাদ রাখতে সহায়তা করুন।\n\nধন্যবাদ,\nক্লাব কোষাধ্যক্ষ / অ্যাডমিন`
      : `🏸 *Smashers Sports & Welfare Club - Payment Reminder*\n\nDear ${memberName},\nAccording to our club records, your outstanding due is: *${formatCurrency(currentDue, false)}*.\nKindly clear your dues via bKash/Nagad at your earliest convenience to support club operations.\n\nThank you,\nClub Treasurer / Admin`;

    const cleanPhone = member.phone.replace(/[^0-9]/g, '');
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
          <div className="flex items-center gap-3">
            <div className="relative group flex-shrink-0">
              <div className="w-12 h-12 rounded-2xl overflow-hidden bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold flex items-center justify-center text-lg border border-emerald-300 dark:border-emerald-800 shadow-sm">
                {member.avatar ? (
                  <img src={member.avatar} alt={memberName} className="w-full h-full object-cover" />
                ) : (
                  memberName.charAt(0)
                )}
              </div>
              {isAdmin && onUpdateMember && (
                <>
                  <button
                    type="button"
                    onClick={() => avatarInputRef.current?.click()}
                    title={isBangla ? 'ছবি পরিবর্তন করুন' : 'Change photo'}
                    className="absolute -bottom-1 -right-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full p-1 shadow transition-transform active:scale-90"
                  >
                    <Camera className="w-3 h-3" />
                  </button>
                  <input
                    ref={avatarInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                </>
              )}
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex flex-wrap items-center gap-1.5">
                <span>{memberName}</span>
                <span className="text-[11px] font-mono font-black px-2 py-0.5 rounded-lg bg-emerald-600 text-white shadow-sm">
                  #{member.memberCode}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                  {member.role}
                </span>

                {/* Demographic Badge */}
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  member.memberCategory === 'child'
                    ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                    : member.memberCategory === 'teen'
                    ? 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300'
                    : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                }`}>
                  {member.memberCategory === 'child' ? '🧒 ' + (isBangla ? 'বাচ্চা' : 'Child') :
                   member.memberCategory === 'teen' ? '🧑‍🦱 ' + (isBangla ? 'কিশোর' : 'Teen') :
                   '👨‍🦱 ' + (isBangla ? 'যুবক' : 'Youth')}
                </span>

                {member.participatesInSports === false && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300">
                    🏛️ {isBangla ? 'পৃষ্ঠপোষক (খেলে না)' : 'Patron (No sports)'}
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-0.5">
                <span>{member.phone}</span>
                <span>•</span>
                <span>
                  {t.joining_date}: {member.joiningDate}
                </span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Admin Category & Role Editor */}
          {isAdmin && onUpdateMember && (
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {isBangla ? 'সদস্য বয়স ও খেলার ভূমিকা পরিবর্তন' : 'Age Category & Sports Role'}
                </span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                  {isBangla ? 'তাত্ক্ষণিক কার্যকর' : 'Auto Saved'}
                </span>
              </div>

              {/* Age Category Selector */}
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: 'child', label: isBangla ? '🧒 বাচ্চা' : '🧒 Child' },
                  { id: 'teen', label: isBangla ? '🧑‍🦱 কিশোর' : '🧑‍🦱 Teen' },
                  { id: 'youth', label: isBangla ? '👨‍🦱 যুবক' : '👨‍🦱 Youth' },
                ].map((cat) => {
                  const isSelected = (member.memberCategory || 'youth') === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() =>
                        onUpdateMember({
                          ...member,
                          memberCategory: cat.id as any,
                        })
                      }
                      className={`py-1.5 px-2 rounded-xl text-xs font-bold border transition-all ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 shadow-sm'
                          : 'border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {cat.label}
                    </button>
                  );
                })}
              </div>

              {/* Sports Participation Toggle */}
              <button
                type="button"
                onClick={() =>
                  onUpdateMember({
                    ...member,
                    participatesInSports: member.participatesInSports === false ? true : false,
                    weeklyAmount: member.participatesInSports === false ? 50 : 0,
                  })
                }
                className={`w-full py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-between border transition-all ${
                  member.participatesInSports !== false
                    ? 'border-emerald-200 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200'
                    : 'border-purple-300 bg-purple-100/70 dark:bg-purple-950/60 text-purple-900 dark:text-purple-200'
                }`}
              >
                <span>
                  {member.participatesInSports !== false
                    ? (isBangla ? '🏸 খেলায় অংশ নেয় (সাপ্তাহিক চাঁদা চালু)' : '🏸 Plays Sports (Weekly fee active)')
                    : (isBangla ? '🏛️ শুধু ফান্ডিং সদস্য (খেলার কোনো চাঁদা নেই)' : '🏛️ Funding Patron only (No game fees)')}
                </span>
                <span className="text-[10px] underline ml-2">
                  {isBangla ? 'পরিবর্তন করুন' : 'Change'}
                </span>
              </button>
            </div>
          )}

          {/* Delegated Role & Sub-Admin Duty Card */}
          <div className="p-3.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/90 dark:border-amber-900/40 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-amber-500 text-white text-xs">👑</span>
                <div>
                  <h4 className="text-xs font-black text-amber-950 dark:text-amber-200">
                    {isBangla ? 'অর্পিত দায়িত্ব ও সাব-অ্যাডমিন রোল' : 'Delegated Role & Duties'}
                  </h4>
                  <p className="text-[10px] text-amber-800/80 dark:text-amber-300/80">
                    {member.assignedDuty || (member.role === 'Admin' ? 'প্রধান অ্যাডমিন' : 'সাধারণ সদস্য')}
                  </p>
                </div>
              </div>
              {isAdmin && onUpdateMember && (
                <button
                  type="button"
                  onClick={() => setIsEditingRole(!isEditingRole)}
                  className="px-2.5 py-1 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-[11px] font-bold shadow-sm transition-all"
                >
                  {isEditingRole ? (isBangla ? 'বন্ধ' : 'Close') : (isBangla ? 'দায়িত্ব দিন / এডিট' : 'Assign / Edit')}
                </button>
              )}
            </div>

            {/* Display Active Permissions */}
            {member.delegatedPermissions && member.delegatedPermissions.length > 0 && !isEditingRole && (
              <div className="space-y-1.5 pt-1">
                <div className="flex flex-wrap gap-1.5">
                  {member.delegatedPermissions.map((perm) => (
                    <span
                      key={perm}
                      className="px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-900/50 text-amber-900 dark:text-amber-200 text-[10px] font-bold"
                    >
                      {perm === 'manage_stars' && '🏆 সেরা তারকা'}
                      {perm === 'manage_members' && '👥 সদস্য ম্যানেজমেন্ট'}
                      {perm === 'manage_collection' && '💰 চাঁদা এন্ট্রি'}
                      {perm === 'manage_expenses' && '🧾 খরচ এন্ট্রি'}
                      {perm === 'manage_tournaments' && '🏸 টুর্নামেন্ট'}
                      {perm === 'manage_picnic' && '🚌 পিকনিক'}
                      {perm === 'manage_funds' && '🤝 কল্যাণ তহবিল'}
                    </span>
                  ))}
                  {member.subAdminPin && (
                    <span className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold font-mono">
                      🔑 PIN: {isAdmin ? member.subAdminPin : '••••'}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Edit Form for Roles & Delegated Permissions */}
            {isEditingRole && onUpdateMember && (
              <div className="pt-2 border-t border-amber-200/80 dark:border-amber-900/50 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-bold text-gray-700 dark:text-gray-300 block mb-0.5">
                      {isBangla ? 'অর্পিত পদবি / দায়িত্বের নাম' : 'Duty Title / Assignment'}
                    </label>
                    <input
                      type="text"
                      value={tempAssignedDuty}
                      onChange={(e) => setTempAssignedDuty(e.target.value)}
                      placeholder="যেমন: সেরা তারকা সমন্বয়ক / মেম্বার ইনচার্জ"
                      className="w-full px-2.5 py-1.5 text-xs rounded-xl bg-white dark:bg-slate-900 border border-gray-300 dark:border-gray-700 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-gray-700 dark:text-gray-300 block mb-0.5">
                      {isBangla ? 'সাব-অ্যাডমিন লগইন PIN (৪ সংখ্যা)' : 'Sub-Admin Login PIN (4 Digits)'}
                    </label>
                    <input
                      type="text"
                      value={tempPin}
                      onChange={(e) => setTempPin(e.target.value)}
                      placeholder="যেমন: 2026 বা 1234"
                      className="w-full px-2.5 py-1.5 text-xs rounded-xl bg-white dark:bg-slate-900 border border-gray-300 dark:border-gray-700 font-mono text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-gray-700 dark:text-gray-300 block mb-1">
                    {isBangla ? 'যে যে কাজের দায়িত্ব ও ক্ষমতা দিতে চান (চেক করুন):' : 'Grant Specific Permissions:'}
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {[
                      { id: 'manage_stars' as const, label: isBangla ? '🏆 সেরা তারকা দেওয়া ও এডিট' : 'Star of the Day Entry' },
                      { id: 'manage_members' as const, label: isBangla ? '👥 সদস্য যোগ ও তথ্য এডিট' : 'Member Management' },
                      { id: 'manage_collection' as const, label: isBangla ? '💰 চাঁদা ও পেমেন্ট এন্ট্রি' : 'Fee Collections' },
                      { id: 'manage_expenses' as const, label: isBangla ? '🧾 খরচ ও বিল ভাউচার এন্ট্রি' : 'Club Expenses' },
                      { id: 'manage_tournaments' as const, label: isBangla ? '🏸 টুর্নামেন্ট ও ম্যাচ স্কোর' : 'Tournaments' },
                      { id: 'manage_picnic' as const, label: isBangla ? '🚌 পিকনিক ও ইভেন্ট' : 'Picnics' },
                      { id: 'manage_funds' as const, label: isBangla ? '🤝 কল্যাণ তহবিল' : 'Custom Funds' },
                    ].map((item) => {
                      const isChecked = tempPermissions.includes(item.id);
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => togglePermission(item.id)}
                          className={`p-2 rounded-xl text-left text-xs font-semibold border flex items-center gap-1.5 transition-colors ${
                            isChecked
                              ? 'bg-amber-100 dark:bg-amber-900/60 border-amber-500 text-amber-900 dark:text-amber-200 font-bold'
                              : 'bg-white dark:bg-slate-900 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'
                          }`}
                        >
                          <span>{isChecked ? '☑️' : '◻️'}</span>
                          <span>{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      onUpdateMember({
                        ...member,
                        assignedDuty: tempAssignedDuty.trim() || undefined,
                        delegatedPermissions: tempPermissions,
                        subAdminPin: tempPin.trim() || undefined,
                      });
                      setIsEditingRole(false);
                    }}
                    className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow transition-all active:scale-95"
                  >
                    {isBangla ? '✓ দায়িত্ব সংরক্ষণ করুন' : '✓ Save Assignment'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Summary Financial Cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/40 p-3.5 border border-emerald-200 dark:border-emerald-800/80">
              <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300 block">
                {t.total_contribution}
              </span>
              <span className="text-xl font-black text-emerald-700 dark:text-emerald-400 font-mono mt-1 block">
                {formatCurrency(totalPaid, isBangla)}
              </span>
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400/80 mt-0.5 block">
                ✅ {t.paid_weeks}: {formatNumber(paidWeeksCount, isBangla)}
              </span>
            </div>

            <div
              className={`rounded-xl p-3.5 border ${
                currentDue > 0
                  ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/80'
                  : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800'
              }`}
            >
              <span
                className={`text-xs font-semibold block ${
                  currentDue > 0 ? 'text-rose-800 dark:text-rose-300' : 'text-slate-500'
                }`}
              >
                {t.current_due}
              </span>
              <span
                className={`text-xl font-black font-mono mt-1 block ${
                  currentDue > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-500'
                }`}
              >
                {formatCurrency(currentDue, isBangla)}
              </span>
              <span
                className={`text-[11px] mt-0.5 block ${
                  currentDue > 0 ? 'text-rose-600 dark:text-rose-400/80' : 'text-slate-400'
                }`}
              >
                ❌ {t.missed_weeks}: {formatNumber(missedWeeksCount, isBangla)}
              </span>
            </div>
          </div>

          {/* Member Sports & Contribution Profile Card */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">{sportMeta.emoji}</span>
              <div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                  {isBangla ? sportMeta.nameBangla : sportMeta.name} {isBangla ? 'খেলোয়াড়' : 'Player'}
                </span>
                <span className="text-[11px] text-slate-400">
                  {isBangla ? 'চাঁদা চাঁদার ধরন: ' : 'Plan: '}
                  {member.contributionType === 'monthly'
                    ? (isBangla ? 'মাসিক' : 'Monthly')
                    : member.contributionType === 'both'
                    ? (isBangla ? 'সাপ্তাহিক ও মাসিক সঞ্চয়' : 'Weekly & Monthly')
                    : (isBangla ? 'সাপ্তাহিক' : 'Weekly')}
                </span>
              </div>
            </div>

            <div className="text-right text-xs">
              <span className="font-bold text-slate-700 dark:text-slate-300 block">
                {formatCurrency(member.weeklyAmount, isBangla)} / {isBangla ? 'সপ্তাহ' : 'wk'}
              </span>
              {member.monthlyAmount && member.monthlyAmount > 0 ? (
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold block">
                  {formatCurrency(member.monthlyAmount, isBangla)} / {isBangla ? 'মাস' : 'mo'}
                </span>
              ) : null}
            </div>
          </div>

          {/* Personal Sonsoy / Savings Fund Card */}
          <div className="p-3.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-emerald-600 text-white">
                <PiggyBank className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-extrabold text-emerald-900 dark:text-emerald-200 block">
                  {isBangla ? 'ব্যক্তিগত সঞ্চয় জমা (Sonsoy)' : 'Personal Savings Fund'}
                </span>
                <span className="text-lg font-black text-emerald-700 dark:text-emerald-300 font-mono block">
                  {formatCurrency(memberSavingsBalance, isBangla)}
                </span>
              </div>
            </div>

            {isAdmin && onOpenAddSavings && (
              <button
                onClick={() => onOpenAddSavings(member.id)}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1 shadow-sm transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{isBangla ? 'টাকা জমা/উত্তোলন' : 'Deposit/Withdraw'}</span>
              </button>
            )}
          </div>

          {/* WhatsApp / Messenger Reminder CTA if Due */}
          {currentDue > 0 && (
            <div className="rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 p-3.5 text-white flex items-center justify-between shadow-md">
              <div>
                <span className="text-xs font-bold block flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-300" />
                  {isBangla ? 'বকেয়া আদায়ের তাগাদা' : 'Payment Due Reminder'}
                </span>
                <span className="text-[11px] text-emerald-100">
                  {isBangla
                    ? 'হোয়াটসঅ্যাপে বন্ধুত্বপূর্ণ তাগাদা বার্তা পাঠান'
                    : 'Send friendly reminder via WhatsApp'}
                </span>
              </div>
              <button
                onClick={handleSendReminder}
                className="px-3 py-1.5 rounded-lg bg-white text-emerald-800 hover:bg-emerald-50 text-xs font-extrabold flex items-center gap-1.5 shadow-sm"
              >
                <Send className="w-3.5 h-3.5 text-emerald-600" />
                <span>WhatsApp</span>
              </button>
            </div>
          )}

          {/* Special Custom Funds Contributions */}
          {funds && funds.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Coins className="w-3.5 h-3.5 text-purple-500" />
                  <span>{isBangla ? 'বিশেষ ফান্ডে অবদানসমূহ' : 'Special Funds Contributions'}</span>
                </h4>
                <span className="text-xs font-mono font-bold text-purple-600 dark:text-purple-400">
                  {formatCurrency(totalFundDonations, isBangla)}
                </span>
              </div>

              <div className="space-y-1.5">
                {funds.map((f) => {
                  const contr = myFundContributions.find((c) => c.fundId === f.id);
                  const fTitle = isBangla && f.titleBangla ? f.titleBangla : f.title;
                  return (
                    <div
                      key={f.id}
                      className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-base">{f.icon || '💰'}</span>
                        <div>
                          <span className="font-bold text-slate-800 dark:text-slate-200 block">
                            {fTitle}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {f.category}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-mono font-extrabold text-slate-900 dark:text-white block">
                          {contr ? formatCurrency(contr.paidAmount, isBangla) : formatCurrency(0, isBangla)}
                        </span>
                        <span
                          className={`text-[10px] font-semibold ${
                            contr && contr.status === 'PAID'
                              ? 'text-emerald-500'
                              : 'text-slate-400'
                          }`}
                        >
                          {contr && contr.status === 'PAID'
                            ? (isBangla ? 'পরিশোধিত' : 'Paid')
                            : (isBangla ? 'তালিকাভুক্ত' : 'Enrolled')}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Payment History List */}
          <div>
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              {t.payment_history}
            </h4>

            <div className="space-y-2">
              {memberPayments.length === 0 ? (
                <p className="text-xs text-slate-400 italic">
                  {isBangla ? 'কোন পেমেন্ট রেকর্ড নেই' : 'No payment records found'}
                </p>
              ) : (
                memberPayments.map((pay) => {
                  const week = weeks.find((w) => w.id === pay.weekId);
                  const weekTitle = week
                    ? isBangla && week.titleBangla
                      ? week.titleBangla
                      : week.title
                    : `Week ${pay.weekId}`;

                  return (
                    <div
                      key={pay.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-xs"
                    >
                      <div>
                        <span className="font-bold text-slate-800 dark:text-slate-200 block">
                          {weekTitle}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {pay.paymentDate || 'Pending'} • {pay.paymentMethod}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span className="font-extrabold font-mono text-slate-900 dark:text-white block">
                            {formatCurrency(pay.paidAmount, isBangla)}
                          </span>
                          {pay.expectedAmount > pay.paidAmount && (
                            <span className="text-[10px] text-rose-500 font-semibold block">
                              {t.due_amount}: {formatCurrency(pay.expectedAmount - pay.paidAmount, isBangla)}
                            </span>
                          )}
                        </div>

                        <StatusBadge status={pay.status} lang={lang} size="sm" />

                        {isAdmin && onEditPayment && (
                          <button
                            onClick={() => onEditPayment(pay, week)}
                            title={t.edit}
                            className="p-1.5 rounded-lg bg-slate-200/80 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-emerald-100 dark:hover:bg-emerald-950/70 hover:text-emerald-700 transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {pay.paidAmount > 0 && (
                          <button
                            onClick={() => onOpenReceipt(pay)}
                            title={t.view_receipt}
                            className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-200 transition-colors"
                          >
                            <Receipt className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Footer (Admin delete button if admin) */}
        {isAdmin && onDeleteMember && (
          <div className="p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center">
            <span className="text-[11px] text-slate-500">
              {isBangla ? 'অ্যাডমিন অনুমতি সক্রিয়' : 'Admin privilege active'}
            </span>
            <button
              onClick={() => {
                if (
                  confirm(
                    isBangla
                      ? `আপনি কি নিশ্চিত যে ${memberName} কে মুছে ফেলতে চান?`
                      : `Are you sure you want to remove ${memberName}?`
                  )
                ) {
                  onDeleteMember(member.id);
                  onClose();
                }
              }}
              className="flex items-center gap-1 py-1.5 px-3 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-bold transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{isBangla ? 'সদস্য মুছুন' : 'Remove Member'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

import React, { useState, useMemo, useRef } from 'react';
import {
  Member,
  Week,
  MonthRecord,
  Payment,
  MonthlyPayment,
  SavingsDeposit,
  CustomFund,
  FundContribution,
  LeaderboardAward,
} from '../types';
import { processImageFile } from '../utils/imageUtils';
import { isWeekUpcoming, isMonthUpcoming } from '../utils/accounting';

interface MemberIdSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  members: Member[];
  weeks: Week[];
  months: MonthRecord[];
  payments: Payment[];
  monthlyPayments: MonthlyPayment[];
  savingsDeposits: SavingsDeposit[];
  customFunds: CustomFund[];
  fundContributions: FundContribution[];
  leaderboardAwards: LeaderboardAward[];
  activeWeekId: string;
  activeMonthId: string;
  onUpdateMember?: (updated: Member) => void;
  initialSearchQuery?: string;
  isBangla?: boolean;
}

export const MemberIdSearchModal: React.FC<MemberIdSearchModalProps> = ({
  isOpen,
  onClose,
  members,
  weeks,
  months,
  payments,
  monthlyPayments,
  savingsDeposits,
  customFunds,
  fundContributions,
  leaderboardAwards,
  activeWeekId,
  activeMonthId,
  onUpdateMember,
  initialSearchQuery = '',
  isBangla = true,
}) => {
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync initial search if opened with specific ID
  React.useEffect(() => {
    if (initialSearchQuery) {
      setSearchQuery(initialSearchQuery);
      const match = members.find(
        (m) => m.memberCode === initialSearchQuery || m.id === initialSearchQuery
      );
      if (match) setSelectedMemberId(match.id);
    }
  }, [initialSearchQuery, members]);

  // Find matches
  const matchedMembers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return members.slice(0, 8); // show first few by default

    return members.filter((m) => {
      const codeMatch = m.memberCode?.toLowerCase().includes(q);
      const nameMatch = m.name.toLowerCase().includes(q);
      const banglaMatch = m.banglaName?.toLowerCase().includes(q);
      const phoneMatch = m.phone.toLowerCase().includes(q);
      return codeMatch || nameMatch || banglaMatch || phoneMatch;
    });
  }, [searchQuery, members]);

  // Auto-select single exact match
  React.useEffect(() => {
    const clean = searchQuery.trim();
    if (clean.length >= 3) {
      const exactCode = members.find((m) => m.memberCode === clean);
      if (exactCode) {
        setSelectedMemberId(exactCode.id);
        return;
      }
    }
    if (!selectedMemberId && matchedMembers.length === 1) {
      setSelectedMemberId(matchedMembers[0].id);
    }
  }, [searchQuery, matchedMembers, members, selectedMemberId]);

  const activeMember = useMemo(() => {
    if (selectedMemberId) {
      return members.find((m) => m.id === selectedMemberId) || null;
    }
    return matchedMembers[0] || null;
  }, [selectedMemberId, matchedMembers, members]);

  // Compute active member details
  const memberStats = useMemo(() => {
    if (!activeMember) return null;

    // Current Week
    const activeWeek = weeks.find((w) => w.id === activeWeekId);
    const currWeekPayment = payments.find(
      (p) => p.memberId === activeMember.id && p.weekId === activeWeekId
    );

    // Current Month
    const activeMonth = months.find((m) => m.id === activeMonthId);
    const currMonthPayment = monthlyPayments.find(
      (p) => p.memberId === activeMember.id && p.monthId === activeMonthId
    );

    // Total weekly dues & paid (excluding upcoming unpaid weeks)
    const upcomingWeekIds = new Set(weeks.filter((w) => isWeekUpcoming(w)).map((w) => w.id));
    const memberPayments = payments.filter((p) => p.memberId === activeMember.id);
    const totalWeeklyExpected = memberPayments.reduce(
      (s, p) => s + (upcomingWeekIds.has(p.weekId) && (p.paidAmount || 0) === 0 ? 0 : p.expectedAmount),
      0
    );
    const totalWeeklyPaid = memberPayments.reduce((s, p) => s + p.paidAmount, 0);
    const totalWeeklyDue = Math.max(0, totalWeeklyExpected - totalWeeklyPaid);

    // Total monthly dues & paid (excluding upcoming unpaid months)
    const upcomingMonthIds = new Set(months.filter((m) => isMonthUpcoming(m)).map((m) => m.id));
    const memberMonthly = monthlyPayments.filter((p) => p.memberId === activeMember.id);
    const totalMonthlyExpected = memberMonthly.reduce(
      (s, p) => s + (upcomingMonthIds.has(p.monthId) && (p.paidAmount || 0) === 0 ? 0 : p.expectedAmount),
      0
    );
    const totalMonthlyPaid = memberMonthly.reduce((s, p) => s + p.paidAmount, 0);
    const totalMonthlyDue = Math.max(0, totalMonthlyExpected - totalMonthlyPaid);

    // Total Savings / Sonsoy
    const memberSavings = savingsDeposits.filter((s) => s.memberId === activeMember.id);
    const totalSavings = memberSavings.reduce((sum, s) => {
      return s.type === 'DEPOSIT' ? sum + s.amount : sum - s.amount;
    }, 0);

    // Custom Funds participation
    const myContributions = fundContributions.filter((fc) => fc.memberId === activeMember.id);
    const totalFundPaid = myContributions.reduce((s, fc) => s + (fc.paidAmount || 0), 0);
    const totalFundDue = myContributions.reduce((s, fc) => {
      const exp = fc.expectedAmount || 0;
      const pd = fc.paidAmount || 0;
      return s + Math.max(0, exp - pd);
    }, 0);

    // Awards earned
    const awardsWon = leaderboardAwards.filter((award) => {
      return (
        award.bestPlayer?.memberId === activeMember.id ||
        award.bestPlayer?.memberCode === activeMember.memberCode ||
        award.bestTeam?.memberCodes?.includes(activeMember.memberCode) ||
        award.bestScore?.memberCode === activeMember.memberCode
      );
    });

    return {
      activeWeek,
      currWeekPayment,
      activeMonth,
      currMonthPayment,
      totalWeeklyPaid,
      totalWeeklyDue,
      totalMonthlyPaid,
      totalMonthlyDue,
      totalSavings,
      myContributions,
      totalFundPaid,
      totalFundDue,
      awardsWon,
    };
  }, [
    activeMember,
    weeks,
    activeWeekId,
    payments,
    months,
    activeMonthId,
    monthlyPayments,
    savingsDeposits,
    fundContributions,
    leaderboardAwards,
  ]);

  if (!isOpen) return null;

  const handleCopyId = () => {
    if (activeMember?.memberCode) {
      navigator.clipboard.writeText(activeMember.memberCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && activeMember && onUpdateMember) {
      try {
        const compressed = await processImageFile(file, 300, 300, 0.75);
        onUpdateMember({
          ...activeMember,
          avatar: compressed,
        });
      } catch (err) {
        console.error('Image upload failed', err);
      }
    }
  };

  const handleShareStatus = () => {
    if (!activeMember || !memberStats) return;
    const shareText = `*${activeMember.banglaName || activeMember.name} (আইডি: #${activeMember.memberCode})*\n` +
      `📌 স্ট্যাটাস বিবরণী:\n` +
      `• ক্যাটাগরি: ${activeMember.memberCategory || 'youth'}\n` +
      `• সাপ্তাহিক চলতি সপ্তাহ: ৳${memberStats.currWeekPayment?.paidAmount || 0} / ৳${memberStats.currWeekPayment?.expectedAmount || activeMember.weeklyAmount} (${memberStats.currWeekPayment?.status || 'বকেয়া'})\n` +
      `• মোট বকেয়া: ৳${memberStats.totalWeeklyDue + memberStats.totalMonthlyDue}\n` +
      `• ব্যক্তিগত সঞ্চয় ব্যালেন্স: ৳${memberStats.totalSavings}\n` +
      `• বিশেষ তহবিল অনুদান: ৳${memberStats.totalFundPaid}\n` +
      `ক্লাব ম্যানেজমেন্ট সিস্টেম থেকে যাচাইকৃত।`;

    if (navigator.share) {
      navigator.share({ title: 'সদস্য স্ট্যাটাস', text: shareText });
    } else {
      navigator.clipboard.writeText(shareText);
      alert('সদস্যের স্ট্যাটাস বিবরণী কপি করা হয়েছে!');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden my-4 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-2xl shadow-inner border border-white/30">
              🔍
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold">
                {isBangla ? '৪ সংখ্যার মেম্বার আইডি স্ট্যাটাস সার্চ' : '4-Digit Member ID Status Verification'}
              </h2>
              <p className="text-xs sm:text-sm text-emerald-100">
                {isBangla
                  ? 'যে কেউ ৪ সংখ্যার আইডি দিয়ে যেকোনো সদস্যের পূর্ণ বিবরণ ও বকেয়া দেখতে পারেন'
                  : 'Instant public access to member standing, dues, savings & achievements'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors text-white font-bold"
          >
            ✕
          </button>
        </div>

        {/* Search Bar Input */}
        <div className="p-4 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSelectedMemberId(null);
              }}
              placeholder={
                isBangla
                  ? '৪ সংখ্যার আইডি লিখুন (যেমন: 1001, 1002) অথবা নাম / ফোন...'
                  : 'Enter 4-digit ID (e.g. 1001, 1002) or member name...'
              }
              className="w-full pl-11 pr-24 py-3 bg-white dark:bg-gray-800 border-2 border-emerald-500 rounded-xl text-base sm:text-lg font-semibold tracking-wide text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-emerald-500/20 transition-all shadow-sm"
              autoFocus
            />
            <span className="absolute left-4 top-3.5 text-lg text-emerald-600 dark:text-emerald-400">
              #
            </span>
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedMemberId(null);
                }}
                className="absolute right-3 top-3 px-2 py-1 text-xs bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 rounded text-gray-600 dark:text-gray-300"
              >
                {isBangla ? 'মুছুন' : 'Clear'}
              </button>
            )}
          </div>

          {/* Quick ID Pills */}
          <div className="mt-3 flex items-center gap-1.5 overflow-x-auto pb-1 text-xs scrollbar-thin">
            <span className="text-gray-500 dark:text-gray-400 font-medium whitespace-nowrap">
              {isBangla ? 'দ্রুত আইডি নির্বাচন:' : 'Quick IDs:'}
            </span>
            {members.slice(0, 10).map((m) => (
              <button
                key={m.id}
                onClick={() => {
                  setSearchQuery(m.memberCode);
                  setSelectedMemberId(m.id);
                }}
                className={`px-2.5 py-1 rounded-lg font-mono font-bold transition-colors whitespace-nowrap border ${
                  activeMember?.id === m.id
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-emerald-500'
                }`}
              >
                #{m.memberCode}
              </button>
            ))}
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
          {!activeMember ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-3xl">
                🔎
              </div>
              <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">
                {isBangla ? 'কোনো সদস্য পাওয়া যায়নি' : 'No Member Found'}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {isBangla
                  ? 'সঠিক ৪ সংখ্যার আইডি (যেমন: 1001 থেকে 1012) লিখে সার্চ করুন।'
                  : 'Please enter a valid 4-digit ID number to view status.'}
              </p>
            </div>
          ) : (
            <>
              {/* Digital Member ID Card Badge */}
              <div className="relative rounded-2xl bg-gradient-to-br from-gray-900 via-slate-800 to-emerald-950 text-white p-5 sm:p-6 shadow-xl border border-emerald-500/30 overflow-hidden">
                {/* Background decorative watermark */}
                <div className="absolute right-0 bottom-0 translate-x-6 translate-y-6 opacity-10 text-9xl font-black select-none pointer-events-none">
                  #{activeMember.memberCode}
                </div>

                <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center space-x-4">
                    {/* Avatar / Photo with upload affordance */}
                    <div className="relative group">
                      <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-2xl overflow-hidden bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shadow-lg flex items-center justify-center">
                        {activeMember.avatar ? (
                          <img
                            src={activeMember.avatar}
                            alt={activeMember.name}
                            className="w-full h-full object-cover rounded-2xl"
                          />
                        ) : (
                          <div className="w-full h-full rounded-2xl bg-slate-800 flex items-center justify-center text-3xl">
                            {activeMember.preferredSport === 'badminton'
                              ? '🏸'
                              : activeMember.preferredSport === 'cricket'
                              ? '🏏'
                              : activeMember.preferredSport === 'football'
                              ? '⚽'
                              : '🌟'}
                          </div>
                        )}
                      </div>

                      {/* Photo change overlay */}
                      {onUpdateMember && (
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          title="ছবি আপলোড / পরিবর্তন করুন"
                          className="absolute -bottom-1.5 -right-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full p-1.5 shadow-md transition-transform transform active:scale-95 text-xs flex items-center justify-center"
                        >
                          📷
                        </button>
                      )}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                      />
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2.5 py-0.5 text-xs font-bold rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono tracking-wider">
                          ID: #{activeMember.memberCode}
                        </span>
                        <button
                          onClick={handleCopyId}
                          className="text-xs text-gray-300 hover:text-white underline flex items-center gap-1"
                        >
                          {copied ? '✓ কপি হয়েছে' : 'কপি আইডি'}
                        </button>

                        <span
                          className={`px-2 py-0.5 text-xs font-semibold rounded-md ${
                            activeMember.memberCategory === 'child'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                              : activeMember.memberCategory === 'teen'
                              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                              : 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                          }`}
                        >
                          {activeMember.memberCategory === 'child'
                            ? 'বাচ্চা 🧒'
                            : activeMember.memberCategory === 'teen'
                            ? 'কিশোর 🧑‍🦱'
                            : 'যুবক 👨‍🦱'}
                        </span>
                      </div>

                      <h3 className="text-xl sm:text-2xl font-black mt-1">
                        {activeMember.banglaName || activeMember.name}
                      </h3>
                      {activeMember.banglaName && (
                        <p className="text-xs text-gray-300">{activeMember.name}</p>
                      )}

                      <div className="flex items-center gap-2 mt-2 text-xs text-gray-300 flex-wrap">
                        <span className="bg-slate-700/80 px-2 py-0.5 rounded">
                          পদবি: {activeMember.role}
                        </span>
                        <span className="bg-slate-700/80 px-2 py-0.5 rounded">
                          📞 {activeMember.phone}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded font-semibold ${
                            activeMember.participatesInSports
                              ? 'bg-emerald-800/80 text-emerald-200'
                              : 'bg-amber-900/80 text-amber-200'
                          }`}
                        >
                          {activeMember.participatesInSports
                            ? '🏸 খেলা ও চাঁদা সক্রিয়'
                            : '🏛️ শুধু ফান্ডিং/পৃষ্ঠপোষক'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Share button */}
                  <button
                    onClick={handleShareStatus}
                    className="self-end sm:self-center px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-xs font-bold text-white flex items-center gap-1.5 transition-all shadow"
                  >
                    <span>📤</span>
                    <span>{isBangla ? 'স্ট্যাটাস শেয়ার' : 'Share Status'}</span>
                  </button>
                </div>
              </div>

              {/* Status Breakdown Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* 1. Current Week Payment */}
                <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-500 dark:text-gray-400 font-semibold">
                      {isBangla ? 'চলতি সপ্তাহ (Week 4)' : 'Current Week'}
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                        memberStats?.currWeekPayment?.status === 'PAID'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                          : memberStats?.currWeekPayment?.status === 'PARTIAL'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
                          : 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300'
                      }`}
                    >
                      {memberStats?.currWeekPayment?.status === 'PAID'
                        ? 'পরিশোধিত ✓'
                        : memberStats?.currWeekPayment?.status === 'PARTIAL'
                        ? 'আংশিক ⏳'
                        : 'বকেয়া ✕'}
                    </span>
                  </div>
                  <div className="text-xl font-extrabold text-gray-900 dark:text-white">
                    ৳{memberStats?.currWeekPayment?.paidAmount || 0}
                    <span className="text-xs font-normal text-gray-500 dark:text-gray-400 ml-1">
                      / ৳{activeMember.weeklyAmount}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
                    {memberStats?.currWeekPayment?.status === 'PAID'
                      ? 'সপ্তাহের চাঁদা ক্লিয়ার আছে'
                      : `বকেয়া: ৳${Math.max(
                          0,
                          activeMember.weeklyAmount - (memberStats?.currWeekPayment?.paidAmount || 0)
                        )}`}
                  </p>
                </div>

                {/* 2. Total Dues */}
                <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-500 dark:text-gray-400 font-semibold">
                      {isBangla ? 'মোট বকেয়া (সব খাত)' : 'Total Dues'}
                    </span>
                    <span className="text-xs">⚠️</span>
                  </div>
                  <div
                    className={`text-xl font-extrabold ${
                      (memberStats?.totalWeeklyDue || 0) + (memberStats?.totalMonthlyDue || 0) > 0
                        ? 'text-rose-600 dark:text-rose-400'
                        : 'text-emerald-600 dark:text-emerald-400'
                    }`}
                  >
                    ৳
                    {(memberStats?.totalWeeklyDue || 0) + (memberStats?.totalMonthlyDue || 0)}
                  </div>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
                    {(memberStats?.totalWeeklyDue || 0) + (memberStats?.totalMonthlyDue || 0) === 0
                      ? 'কোনো বকেয়া নেই (সব পরিশোধিত)'
                      : 'দ্রুত বকেয়া পরিশোধ করুন'}
                  </p>
                </div>

                {/* 3. Sonsoy / Savings Balance */}
                <div className="p-4 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-emerald-800 dark:text-emerald-300 font-semibold">
                      {isBangla ? 'সঞ্চয় খাতা ব্যালেন্স' : 'Savings Balance'}
                    </span>
                    <span className="text-xs">💰</span>
                  </div>
                  <div className="text-xl font-extrabold text-emerald-700 dark:text-emerald-300">
                    ৳{memberStats?.totalSavings || 0}
                  </div>
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1">
                    ক্লাবের ব্যক্তিগত জমাকৃত মূলধন
                  </p>
                </div>
              </div>

              {/* Special Funds Enrolled Table */}
              <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-700/40 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                    <span>🏛️</span>
                    <span>
                      {isBangla
                        ? 'বিশেষ ফান্ডিং ও তহবিলের অবদান'
                        : 'Special Funds Contributions'}
                    </span>
                  </h4>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    মোট অনুদান: ৳{memberStats?.totalFundPaid || 0}
                  </span>
                </div>

                {memberStats?.myContributions && memberStats.myContributions.length > 0 ? (
                  <div className="space-y-2">
                    {memberStats.myContributions.map((fc) => {
                      const fund = customFunds.find((f) => f.id === fc.fundId);
                      return (
                        <div
                          key={fc.id}
                          className="p-2.5 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-between text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-base">{fund?.icon || '📁'}</span>
                            <div>
                              <div className="font-bold text-gray-800 dark:text-gray-200">
                                {fund?.titleBangla || fund?.title || 'বিশেষ তহবিল'}
                              </div>
                              <div className="text-[11px] text-gray-500 dark:text-gray-400">
                                লক্ষ্য: ৳{fc.expectedAmount} • প্রদান: ৳{fc.paidAmount}
                              </div>
                            </div>
                          </div>
                          <span
                            className={`px-2 py-0.5 rounded-full font-bold ${
                              fc.status === 'PAID'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                                : fc.status === 'PARTIAL'
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
                                : 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300'
                            }`}
                          >
                            {fc.status === 'PAID' ? 'পরিশোধিত' : fc.status === 'PARTIAL' ? 'আংশিক' : 'বকেয়া'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-4 text-xs text-gray-500 dark:text-gray-400">
                    {isBangla
                      ? 'এখনও কোনো বিশেষ ফান্ডে যুক্ত হননি।'
                      : 'Not enrolled in any special funds yet.'}
                  </div>
                )}
              </div>

              {/* Awards & Hall of Fame Achievements */}
              {memberStats?.awardsWon && memberStats.awardsWon.length > 0 && (
                <div className="p-4 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border border-amber-200 dark:border-amber-800/40">
                  <h4 className="text-sm font-bold text-amber-900 dark:text-amber-300 mb-2 flex items-center gap-1.5">
                    <span>🏆</span>
                    <span>
                      {isBangla ? 'ক্লাব অর্জন ও সম্মাননা' : 'Club Accolades & Records'}
                    </span>
                  </h4>
                  <div className="space-y-2">
                    {memberStats.awardsWon.map((aw) => (
                      <div
                        key={aw.id}
                        className="p-2.5 rounded-lg bg-white/80 dark:bg-gray-800/80 border border-amber-200 dark:border-amber-800 text-xs"
                      >
                        <div className="flex items-center justify-between font-bold text-amber-900 dark:text-amber-300">
                          <span>{aw.periodLabel}</span>
                          <span className="text-[11px] bg-amber-200 dark:bg-amber-900/60 px-2 py-0.5 rounded text-amber-900 dark:text-amber-200">
                            {aw.bestPlayer?.awardBadge || aw.bestTeam?.achievementTitle || 'সেরা পারফর্মার'}
                          </span>
                        </div>
                        {aw.bestPlayer?.bestScoreText && (
                          <div className="text-gray-600 dark:text-gray-400 text-[11px] mt-1">
                            স্কোর: {aw.bestPlayer.bestScoreText}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
          <div>
            আইডি অপরিবর্তনশীল ও যেকোনো স্থানে অনুসন্ধানের জন্য কার্যকর।
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-xl text-gray-800 dark:text-gray-200 font-bold transition-colors"
          >
            {isBangla ? 'বন্ধ করুন' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};

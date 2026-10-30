import React, { useState } from 'react';
import { Member, Payment, Week, PaymentStatus } from '../types';
import { translations, Language, formatCurrency, formatNumber } from '../utils/language';
import { StatusBadge } from '../components/StatusBadge';
import { isWeekUpcoming } from '../utils/accounting';
import {
  Search,
  Plus,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  Receipt,
  Edit2,
  UserPlus,
  Send,
  ArrowUpDown,
  Trash2,
  CalendarClock,
  Check,
  X,
  Mail,
} from 'lucide-react';

interface Props {
  members: Member[];
  payments: Payment[];
  weeks: Week[];
  activeWeek: Week;
  lang: Language;
  isAdmin: boolean;
  onSelectMember: (member: Member) => void;
  onUpdatePayment: (member: Member, payment: Payment) => void;
  onQuickMark: (
    paymentId: string,
    status: PaymentStatus,
    expected: number,
    memberId?: string,
    weekId?: string
  ) => void;
  onOpenReceipt: (member: Member, payment: Payment, week: Week) => void;
  onOpenAddMember: () => void;
  onDeleteMember?: (memberId: string) => void;
  onOpenIdSearch?: () => void;
  onOpenSignUp?: () => void;
  onUpdateMember?: (member: Member) => void;
  onToggleWeekUpcoming?: (weekId: string, isUpcoming: boolean) => void;
  onOpenEmailDashboard?: () => void;
}

export const MembersView: React.FC<Props> = ({
  members,
  payments,
  weeks,
  activeWeek,
  lang,
  isAdmin,
  onSelectMember,
  onUpdatePayment,
  onQuickMark,
  onOpenReceipt,
  onOpenAddMember,
  onDeleteMember,
  onOpenIdSearch,
  onOpenSignUp,
  onUpdateMember,
  onToggleWeekUpcoming,
  onOpenEmailDashboard,
}) => {
  const t = translations[lang];
  const isBangla = lang === 'bn';

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'ALL' | PaymentStatus>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | 'child' | 'teen' | 'youth' | 'patron'>('ALL');
  const [editingFeeMemberId, setEditingFeeMemberId] = useState<string | null>(null);
  const [editingFeeValue, setEditingFeeValue] = useState<number>(0);

  const isActiveWeekUpcoming = isWeekUpcoming(activeWeek);

  // Current week payments
  const currentWeekPayments = activeWeek ? payments.filter((p) => p.weekId === activeWeek.id) : [];

  const handleSaveInlineFee = (member: Member) => {
    const cleanFee = Math.max(0, Math.round(Number(editingFeeValue) || 0));
    if (onUpdateMember) {
      onUpdateMember({
        ...member,
        weeklyAmount: cleanFee,
        participatesInSports: cleanFee > 0 ? true : member.participatesInSports,
      });
    }
    setEditingFeeMemberId(null);
  };

  // 1-Click toggle between Weekly -> Monthly -> Both
  const handleCycleMemberPlan = (member: Member, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAdmin || !onUpdateMember) return;
    const current = member.contributionType || 'weekly';
    const nextPlan =
      current === 'weekly' ? 'monthly' : current === 'monthly' ? 'both' : 'weekly';
    onUpdateMember({
      ...member,
      contributionType: nextPlan,
      monthlyAmount:
        member.monthlyAmount && member.monthlyAmount > 0
          ? member.monthlyAmount
          : (member.weeklyAmount || 350) * 4,
    });
  };

  // Filtered members list
  const filtered = members.filter((member) => {
    const memberName = isBangla && member.banglaName ? member.banglaName : member.name;
    const cleanSearch = search.trim().toLowerCase().replace(/^#/, '');
    const matchSearch =
      (member.memberCode && member.memberCode.toLowerCase().includes(cleanSearch)) ||
      memberName.toLowerCase().includes(search.toLowerCase()) ||
      member.name.toLowerCase().includes(search.toLowerCase()) ||
      member.phone.includes(search);

    const pay = currentWeekPayments.find((p) => p.memberId === member.id);
    const status = pay ? pay.status : 'UNPAID';

    const matchStatus = filter === 'ALL' || status === filter;

    let matchCategory = true;
    if (categoryFilter === 'patron') {
      matchCategory = member.participatesInSports === false;
    } else if (categoryFilter !== 'ALL') {
      matchCategory = (member.memberCategory || 'youth') === categoryFilter;
    }

    return matchSearch && matchStatus && matchCategory;
  });

  return (
    <div className="space-y-4 pb-24">
      {/* Top Header & Add Member Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <span>{t.nav_members}</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
              {formatNumber(members.length, isBangla)} {isBangla ? 'জন' : 'total'}
            </span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2 flex-wrap">
            <span>
              {isBangla ? 'নির্বাচিত সপ্তাহ' : 'Active Week'}:{' '}
              <strong>
                {isBangla && activeWeek.titleBangla ? activeWeek.titleBangla : activeWeek.title}
              </strong>
            </span>
            {isActiveWeekUpcoming && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 border border-sky-300 dark:border-sky-800">
                <CalendarClock className="w-3 h-3" />
                {isBangla ? 'আসন্ন সপ্তাহ (বকেয়া ধরবে না)' : 'Upcoming Week (No Due)'}
              </span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {isAdmin && onOpenEmailDashboard && (
            <button
              onClick={onOpenEmailDashboard}
              className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-sm transition-all"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>{isBangla ? '📧 ইমেইল রিমাইন্ডার' : '📧 Email Center'}</span>
            </button>
          )}
          {isAdmin && onToggleWeekUpcoming && activeWeek && (
            <button
              onClick={() => onToggleWeekUpcoming(activeWeek.id, !isActiveWeekUpcoming)}
              className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl font-bold text-xs shadow-sm transition-all ${
                isActiveWeekUpcoming
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  : 'bg-sky-100 dark:bg-sky-950/70 text-sky-800 dark:text-sky-300 border border-sky-300 dark:border-sky-800 hover:bg-sky-200'
              }`}
            >
              <CalendarClock className="w-3.5 h-3.5" />
              <span>
                {isActiveWeekUpcoming
                  ? isBangla
                    ? 'সপ্তাহটি চালু করুন (চলতি)'
                    : 'Activate Week Now'
                  : isBangla
                  ? 'আসন্ন সপ্তাহ করুন'
                  : 'Mark as Upcoming'}
              </span>
            </button>
          )}

          {onOpenIdSearch && (
            <button
              onClick={onOpenIdSearch}
              className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all"
            >
              <span>🔍</span>
              <span>{isBangla ? 'আইডি সার্চ' : 'ID Search'}</span>
            </button>
          )}

          {onOpenSignUp && (
            <button
              onClick={onOpenSignUp}
              className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-xs shadow-md transition-all active:scale-95"
              title={isBangla ? 'অনলাইনে সদস্য সাইন-আপ ফরম' : 'Online Member Sign Up Form'}
            >
              <span>✨</span>
              <span>{isBangla ? 'অনলাইন সাইন-আপ' : 'Self Sign Up'}</span>
            </button>
          )}

          {isAdmin && (
            <button
              onClick={onOpenAddMember}
              className="flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all self-start sm:self-auto"
            >
              <UserPlus className="w-4 h-4" />
              <span>{t.add_member}</span>
            </button>
          )}
        </div>
      </div>

      {isActiveWeekUpcoming && (
        <div className="p-3.5 rounded-2xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-sky-900 dark:text-sky-200">
          <div className="flex items-center gap-2">
            <CalendarClock className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0" />
            <span>
              {isBangla
                ? 'এই সপ্তাহটি বর্তমানে "আসন্ন (Upcoming)" অবস্থায় রয়েছে — তাই যারা এখনো পরিশোধ করেননি তাদের নামে কোনো বকেয়া (Due) যোগ হচ্ছে না।'
                : 'This week is marked as "Upcoming" — unpaid members are not counted as Due yet.'}
            </span>
          </div>
          {isAdmin && onToggleWeekUpcoming && (
            <button
              onClick={() => onToggleWeekUpcoming(activeWeek.id, false)}
              className="px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shrink-0 self-start sm:self-auto"
            >
              {isBangla ? '✓ এখনই চলতি সপ্তাহ হিসেবে চালু করুন' : '✓ Activate Week Now'}
            </button>
          )}
        </div>
      )}

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row gap-2.5 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={isBangla ? '৪ সংখ্যার আইডি (#1001), নাম বা ফোন দিয়ে খুঁজুন...' : 'Search by 4-digit ID (#1001), name or phone...'}
            className="w-full pl-9 pr-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex flex-col sm:flex-row gap-2">
          {/* Status filter */}
          <div className="flex gap-1 overflow-x-auto pb-1 sm:pb-0">
            {[
              { key: 'ALL', label: t.filter_all },
              { key: 'PAID', label: t.status_paid, icon: '✅' },
              { key: 'PARTIAL', label: t.status_partial, icon: '⏳' },
              { key: 'UNPAID', label: t.status_unpaid, icon: '❌' },
            ].map((f) => {
              const isSelected = filter === f.key;
              return (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key as any)}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1 ${
                    isSelected
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {f.icon && <span>{f.icon}</span>}
                  <span>{f.label}</span>
                </button>
              );
            })}
          </div>

          {/* Demographic Category Filter */}
          <div className="flex gap-1 overflow-x-auto pb-1 sm:pb-0 border-t sm:border-t-0 sm:border-l border-slate-200 dark:border-slate-800 pt-2 sm:pt-0 sm:pl-2">
            {[
              { key: 'ALL', label: isBangla ? 'সব বয়স' : 'All Ages' },
              { key: 'child', label: isBangla ? '🧒 বাচ্চা' : '🧒 Child' },
              { key: 'teen', label: isBangla ? '🧑‍🦱 কিশোর' : '🧑‍🦱 Teen' },
              { key: 'youth', label: isBangla ? '👨‍🦱 যুবক' : '👨‍🦱 Youth' },
              { key: 'patron', label: isBangla ? '🏛️ শুধু ফান্ডিং' : '🏛️ Patron' },
            ].map((cat) => {
              const isSelected = categoryFilter === cat.key;
              return (
                <button
                  key={cat.key}
                  onClick={() => setCategoryFilter(cat.key as any)}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    isSelected
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Member Payment Table (Desktop & Mobile Friendly) */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
        {/* Mobile View: Cards */}
        <div className="block lg:hidden divide-y divide-slate-100 dark:divide-slate-800">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs italic">
              {isBangla ? 'কোন সদস্য খুঁজে পাওয়া যায়নি' : 'No members found'}
            </div>
          ) : (
            filtered.map((member) => {
              const isPatronOnly = member.participatesInSports === false;
              const isMonthlyOnly = member.contributionType === 'monthly';
              const rawPay = currentWeekPayments.find((p) => p.memberId === member.id) || {
                id: `p-${activeWeek.id}-${member.id}`,
                seasonId: activeWeek.seasonId,
                weekId: activeWeek.id,
                memberId: member.id,
                expectedAmount: isPatronOnly || isMonthlyOnly ? 0 : member.weeklyAmount,
                paidAmount: 0,
                status: 'UNPAID' as const,
                paymentDate: '',
                paymentMethod: 'Cash',
              };
              const pay =
                (isPatronOnly || isMonthlyOnly) && rawPay.paidAmount === 0
                  ? { ...rawPay, expectedAmount: 0 }
                  : rawPay;

              const isUnpaidUpcoming = isActiveWeekUpcoming && pay.paidAmount === 0;
              const due =
                isUnpaidUpcoming || (isMonthlyOnly && pay.paidAmount === 0)
                  ? 0
                  : Math.max(pay.expectedAmount - pay.paidAmount, 0);
              const memberName = isBangla && member.banglaName ? member.banglaName : member.name;

              return (
                <div key={member.id} className="p-4 space-y-3">
                  <div
                    onClick={() => onSelectMember(member)}
                    className="flex items-start justify-between cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden flex items-center justify-center font-bold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 flex-shrink-0">
                        {member.avatar ? (
                          <img src={member.avatar} alt={memberName} className="w-full h-full object-cover" />
                        ) : (
                          memberName.charAt(0)
                        )}
                      </div>
                      <div>
                        <h4 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-1.5 flex-wrap">
                          <span>{memberName}</span>
                          <span className="text-[11px] font-mono font-black px-1.5 py-0.2 rounded bg-emerald-600 text-white shadow-xs">
                            #{member.memberCode}
                          </span>
                          <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                            {member.role}
                          </span>
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300">
                            {member.memberCategory === 'child'
                              ? (isBangla ? '🧒 বাচ্চা' : '🧒 Child')
                              : member.memberCategory === 'teen'
                              ? (isBangla ? '🧑‍🦱 কিশোর' : '🧑‍🦱 Teen')
                              : (isBangla ? '👨‍🦱 যুবক' : '👨‍🦱 Youth')}
                          </span>
                          {member.participatesInSports !== false && (
                            <button
                              type="button"
                              onClick={(e) => handleCycleMemberPlan(member, e)}
                              title={
                                isAdmin
                                  ? isBangla
                                    ? 'ক্লিক করে সাপ্তাহিক / মাসিক / উভয়ই পরিবর্তন করুন'
                                    : 'Click to switch Weekly / Monthly / Both'
                                  : undefined
                              }
                              className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md border transition-all ${
                                member.contributionType === 'monthly'
                                  ? 'bg-purple-100 dark:bg-purple-950/80 text-purple-800 dark:text-purple-200 border-purple-300 dark:border-purple-800'
                                  : member.contributionType === 'both'
                                  ? 'bg-teal-100 dark:bg-teal-950/80 text-teal-800 dark:text-teal-200 border-teal-300 dark:border-teal-800'
                                  : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                              }`}
                            >
                              {member.contributionType === 'monthly'
                                ? isBangla
                                  ? '🗓️ শুধু মাসিক ↻'
                                  : '🗓️ Monthly ↻'
                                : member.contributionType === 'both'
                                ? isBangla
                                  ? '🔄 সাপ্তাহিক+মাসিক ↻'
                                  : '🔄 Wk+Mo ↻'
                                : isBangla
                                ? '📅 শুধু সাপ্তাহিক ↻'
                                : '📅 Weekly ↻'}
                            </button>
                          )}
                          {member.participatesInSports === false && (
                            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300">
                              {isBangla ? '🏛️ শুধু ফান্ডিং' : '🏛️ Patron'}
                            </span>
                          )}
                        </h4>
                        <p className="text-xs text-slate-400">{member.phone}</p>
                      </div>
                    </div>

                    {isMonthlyOnly && pay.paidAmount === 0 ? (
                      <span className="px-2 py-1 rounded-full text-[10px] font-extrabold bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-800">
                        {isBangla ? '🗓️ মাসিক সদস্য' : '🗓️ Monthly'}
                      </span>
                    ) : (
                      <StatusBadge status={pay.status} lang={lang} isUpcoming={isUnpaidUpcoming} />
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-2 bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block">{t.weekly_amount}</span>
                      {isAdmin && editingFeeMemberId === member.id ? (
                        <div className="flex items-center gap-1 mt-0.5">
                          <input
                            type="number"
                            min="0"
                            value={editingFeeValue}
                            onChange={(e) => setEditingFeeValue(Number(e.target.value))}
                            className="w-16 px-1.5 py-0.5 text-xs font-bold rounded border border-emerald-500 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                            autoFocus
                          />
                          <button
                            type="button"
                            onClick={() => handleSaveInlineFee(member)}
                            className="p-1 rounded bg-emerald-600 text-white"
                          >
                            <Check className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingFeeMemberId(null)}
                            className="p-1 rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1">
                          <span className="font-bold text-slate-800 dark:text-slate-200">
                            {formatCurrency(pay.expectedAmount, isBangla)}
                          </span>
                          {isAdmin && onUpdateMember && (
                            <button
                              type="button"
                              onClick={() => {
                                setEditingFeeMemberId(member.id);
                                setEditingFeeValue(member.weeklyAmount || pay.expectedAmount);
                              }}
                              title={isBangla ? 'নির্ধারিত ফি পরিবর্তন করুন' : 'Change Determined Fee'}
                              className="p-0.5 rounded text-emerald-600 hover:bg-emerald-100 dark:hover:bg-emerald-950/60"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">{t.paid_amount}</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                        {formatCurrency(pay.paidAmount, isBangla)}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">{t.due_amount}</span>
                      <span
                        className={`font-bold font-mono ${
                          due > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-400'
                        }`}
                      >
                        {isUnpaidUpcoming
                          ? isBangla
                            ? '৳০ (আসন্ন)'
                            : '৳0 (Upcoming)'
                          : formatCurrency(due, isBangla)}
                      </span>
                    </div>
                  </div>

                  {/* Actions Row */}
                  <div className="flex items-center justify-between pt-1">
                    <div className="text-[11px] text-slate-400">
                      {pay.paymentDate
                        ? `${pay.paymentMethod} • ${pay.paymentDate}`
                        : isUnpaidUpcoming
                        ? isBangla
                          ? 'আসন্ন সপ্তাহ (বকেয়া নয়)'
                          : 'Upcoming Week'
                        : isBangla
                        ? 'এখনো পরিশোধ হয়নি'
                        : 'Not paid yet'}
                    </div>

                    <div className="flex items-center gap-1.5">
                      {pay.paidAmount > 0 && (
                        <button
                          onClick={() => onOpenReceipt(member, pay, activeWeek)}
                          title={t.view_receipt}
                          className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-300 hover:bg-emerald-100"
                        >
                          <Receipt className="w-4 h-4" />
                        </button>
                      )}

                      {isAdmin && (
                        <>
                          {pay.status !== 'PAID' && (
                            <button
                              onClick={() =>
                                onQuickMark(pay.id, 'PAID', pay.expectedAmount, member.id, activeWeek.id)
                              }
                              className="px-2 py-1 rounded-lg text-[11px] font-bold bg-emerald-600 text-white hover:bg-emerald-500"
                            >
                              {t.mark_paid}
                            </button>
                          )}
                          {pay.status !== 'UNPAID' && (
                            <button
                              onClick={() =>
                                onQuickMark(pay.id, 'UNPAID', pay.expectedAmount, member.id, activeWeek.id)
                              }
                              className="px-2 py-1 rounded-lg text-[11px] font-bold bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 hover:bg-rose-100"
                              title={isBangla ? 'বকেয়া হিসেবে চিহ্নিত করুন' : 'Mark as Unpaid'}
                            >
                              {isBangla ? 'বকেয়া করুন' : 'Mark Unpaid'}
                            </button>
                          )}
                          <button
                            onClick={() => onUpdatePayment(member, pay)}
                            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                            title={t.edit}
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          {onDeleteMember && (
                            <button
                              onClick={() => {
                                if (
                                  confirm(
                                    isBangla
                                      ? `আপনি কি নিশ্চিত যে "${member.banglaName || member.name}" সদস্যকে মুছে ফেলতে চান?`
                                      : `Are you sure you want to remove ${member.name}?`
                                  )
                                ) {
                                  onDeleteMember(member.id);
                                }
                              }}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                              title={t.delete_member}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Desktop View: Full Data Table */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <th className="py-3.5 px-4">{t.member_name}</th>
                <th className="py-3.5 px-4">{t.weekly_amount}</th>
                <th className="py-3.5 px-4">{t.paid_amount}</th>
                <th className="py-3.5 px-4">{t.due_amount}</th>
                <th className="py-3.5 px-4">{t.payment_status}</th>
                <th className="py-3.5 px-4">{t.payment_date}</th>
                <th className="py-3.5 px-4">{t.payment_method}</th>
                <th className="py-3.5 px-4 text-right">{t.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400 italic">
                    {isBangla ? 'কোন সদস্য খুঁজে পাওয়া যায়নি' : 'No members found'}
                  </td>
                </tr>
              ) : (
                filtered.map((member) => {
                  const isPatronOnly = member.participatesInSports === false;
                  const isMonthlyOnly = member.contributionType === 'monthly';
                  const rawPay = currentWeekPayments.find((p) => p.memberId === member.id) || {
                    id: `p-${activeWeek.id}-${member.id}`,
                    seasonId: activeWeek.seasonId,
                    weekId: activeWeek.id,
                    memberId: member.id,
                    expectedAmount: isPatronOnly || isMonthlyOnly ? 0 : member.weeklyAmount,
                    paidAmount: 0,
                    status: 'UNPAID' as const,
                    paymentDate: '',
                    paymentMethod: 'Cash',
                  };
                  const pay =
                    (isPatronOnly || isMonthlyOnly) && rawPay.paidAmount === 0
                      ? { ...rawPay, expectedAmount: 0 }
                      : rawPay;

                  const isUnpaidUpcoming = isActiveWeekUpcoming && pay.paidAmount === 0;
                  const due =
                    isUnpaidUpcoming || (isMonthlyOnly && pay.paidAmount === 0)
                      ? 0
                      : Math.max(pay.expectedAmount - pay.paidAmount, 0);
                  const memberName = isBangla && member.banglaName ? member.banglaName : member.name;

                  return (
                    <tr
                      key={member.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td
                        onClick={() => onSelectMember(member)}
                        className="py-3.5 px-4 cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden flex items-center justify-center font-bold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 flex-shrink-0">
                            {member.avatar ? (
                              <img src={member.avatar} alt={memberName} className="w-full h-full object-cover" />
                            ) : (
                              memberName.charAt(0)
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-extrabold text-slate-900 dark:text-white hover:text-emerald-600">
                                {memberName}
                              </span>
                              <span className="text-[11px] font-mono font-black px-1.5 py-0.2 rounded bg-emerald-600 text-white shadow-xs">
                                #{member.memberCode}
                              </span>
                              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300">
                                {member.memberCategory === 'child'
                                  ? (isBangla ? '🧒 বাচ্চা' : '🧒 Child')
                                  : member.memberCategory === 'teen'
                                  ? (isBangla ? '🧑‍🦱 কিশোর' : '🧑‍🦱 Teen')
                                  : (isBangla ? '👨‍🦱 যুবক' : '👨‍🦱 Youth')}
                              </span>
                              {member.participatesInSports !== false && (
                                <button
                                  type="button"
                                  onClick={(e) => handleCycleMemberPlan(member, e)}
                                  title={
                                    isAdmin
                                      ? isBangla
                                        ? 'ক্লিক করে সাপ্তাহিক / মাসিক / উভয়ই পরিবর্তন করুন'
                                        : 'Click to switch Weekly / Monthly / Both'
                                      : undefined
                                  }
                                  className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md border transition-all ${
                                    member.contributionType === 'monthly'
                                      ? 'bg-purple-100 dark:bg-purple-950/80 text-purple-800 dark:text-purple-200 border-purple-300 dark:border-purple-800'
                                      : member.contributionType === 'both'
                                      ? 'bg-teal-100 dark:bg-teal-950/80 text-teal-800 dark:text-teal-200 border-teal-300 dark:border-teal-800'
                                      : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                                  }`}
                                >
                                  {member.contributionType === 'monthly'
                                    ? isBangla
                                      ? '🗓️ শুধু মাসিক ↻'
                                      : '🗓️ Monthly ↻'
                                    : member.contributionType === 'both'
                                    ? isBangla
                                      ? '🔄 সাপ্তাহিক+মাসিক ↻'
                                      : '🔄 Wk+Mo ↻'
                                    : isBangla
                                    ? '📅 শুধু সাপ্তাহিক ↻'
                                    : '📅 Weekly ↻'}
                                </button>
                              )}
                              {member.participatesInSports === false && (
                                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300">
                                  {isBangla ? '🏛️ শুধু ফান্ডিং' : '🏛️ Patron'}
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-400">
                              {member.role} • {member.phone}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-semibold text-slate-700 dark:text-slate-300">
                        {isAdmin && editingFeeMemberId === member.id ? (
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              min="0"
                              value={editingFeeValue}
                              onChange={(e) => setEditingFeeValue(Number(e.target.value))}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSaveInlineFee(member);
                                if (e.key === 'Escape') setEditingFeeMemberId(null);
                              }}
                              className="w-20 px-2 py-1 text-xs font-bold rounded-lg border border-emerald-500 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                              autoFocus
                            />
                            <button
                              type="button"
                              onClick={() => handleSaveInlineFee(member)}
                              className="p-1 rounded-lg bg-emerald-600 text-white hover:bg-emerald-500"
                              title={isBangla ? 'সেভ করুন' : 'Save'}
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingFeeMemberId(null)}
                              className="p-1 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                              title={isBangla ? 'বাতিল' : 'Cancel'}
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <span>{formatCurrency(pay.expectedAmount, isBangla)}</span>
                            {isAdmin && onUpdateMember && (
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingFeeMemberId(member.id);
                                  setEditingFeeValue(member.weeklyAmount || pay.expectedAmount);
                                }}
                                title={isBangla ? 'নির্ধারিত ফি পরিবর্তন করুন' : 'Edit Determined Fee'}
                                className="p-1 rounded-lg text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 transition-colors"
                              >
                                <Edit2 className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4 font-black font-mono text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(pay.paidAmount, isBangla)}
                      </td>

                      <td
                        className={`py-3.5 px-4 font-black font-mono ${
                          due > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-400'
                        }`}
                      >
                        {isUnpaidUpcoming
                          ? isBangla
                            ? '৳০ (আসন্ন)'
                            : '৳0 (Upcoming)'
                          : isMonthlyOnly && pay.paidAmount === 0
                          ? isBangla
                            ? '৳০ (মাসিক)'
                            : '৳0 (Monthly)'
                          : formatCurrency(due, isBangla)}
                      </td>

                      <td className="py-3.5 px-4">
                        {isMonthlyOnly && pay.paidAmount === 0 ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-800">
                            🗓️ {isBangla ? 'মাসিক সদস্য' : 'Monthly Plan'}
                          </span>
                        ) : (
                          <StatusBadge status={pay.status} lang={lang} isUpcoming={isUnpaidUpcoming} />
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400">
                        {pay.paymentDate ? (
                          pay.paymentDate
                        ) : isUnpaidUpcoming ? (
                          <span className="text-sky-600 dark:text-sky-400 font-semibold text-[11px]">
                            {isBangla ? 'আসন্ন সপ্তাহ' : 'Upcoming'}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px]">
                            {isBangla ? 'এখনো পরিশোধ হয়নি' : 'Pending'}
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium text-[11px]">
                          {pay.paymentMethod}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {pay.paidAmount > 0 && (
                            <button
                              onClick={() => onOpenReceipt(member, pay, activeWeek)}
                              title={t.view_receipt}
                              className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-300 hover:bg-emerald-100"
                            >
                              <Receipt className="w-4 h-4" />
                            </button>
                          )}

                          {isAdmin && (
                            <>
                              {pay.status !== 'PAID' && (
                                <button
                                  onClick={() =>
                                    onQuickMark(pay.id, 'PAID', pay.expectedAmount, member.id, activeWeek.id)
                                  }
                                  className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-500 shadow-sm"
                                >
                                  {t.mark_paid}
                                </button>
                              )}
                              {pay.status !== 'UNPAID' && (
                                <button
                                  onClick={() =>
                                    onQuickMark(pay.id, 'UNPAID', pay.expectedAmount, member.id, activeWeek.id)
                                  }
                                  className="px-2 py-1 rounded-lg text-[11px] font-bold bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 hover:bg-rose-100"
                                  title={isBangla ? 'বকেয়া হিসেবে চিহ্নিত করুন' : 'Mark as Unpaid'}
                                >
                                  {isBangla ? 'বকেয়া করুন' : 'Mark Unpaid'}
                                </button>
                              )}
                              <button
                                onClick={() => onUpdatePayment(member, pay)}
                                className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                                title={t.edit}
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              {onDeleteMember && (
                                <button
                                  onClick={() => {
                                    if (
                                      confirm(
                                        isBangla
                                          ? `আপনি কি নিশ্চিত যে "${member.banglaName || member.name}" সদস্যকে মুছে ফেলতে চান?`
                                          : `Are you sure you want to remove ${member.name}?`
                                      )
                                    ) {
                                      onDeleteMember(member.id);
                                    }
                                  }}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                                  title={t.delete_member}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

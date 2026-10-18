import React, { useState } from 'react';
import { Member, Payment, Week, PaymentStatus } from '../types';
import { translations, Language, formatCurrency, formatNumber } from '../utils/language';
import { StatusBadge } from '../components/StatusBadge';
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
  onQuickMark: (paymentId: string, status: PaymentStatus, expected: number) => void;
  onOpenReceipt: (member: Member, payment: Payment, week: Week) => void;
  onOpenAddMember: () => void;
  onDeleteMember?: (memberId: string) => void;
  onOpenIdSearch?: () => void;
  onOpenSignUp?: () => void;
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
}) => {
  const t = translations[lang];
  const isBangla = lang === 'bn';

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'ALL' | PaymentStatus>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | 'child' | 'teen' | 'youth' | 'patron'>('ALL');

  // Current week payments
  const currentWeekPayments = activeWeek ? payments.filter((p) => p.weekId === activeWeek.id) : [];

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
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {isBangla ? 'নির্বাচিত সপ্তাহ' : 'Active Week'}:{' '}
            <strong>
              {isBangla && activeWeek.titleBangla ? activeWeek.titleBangla : activeWeek.title}
            </strong>
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
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
              const pay = currentWeekPayments.find((p) => p.memberId === member.id) || {
                id: `p-${activeWeek.id}-${member.id}`,
                seasonId: activeWeek.seasonId,
                weekId: activeWeek.id,
                memberId: member.id,
                expectedAmount: member.weeklyAmount,
                paidAmount: 0,
                status: 'UNPAID' as const,
                paymentDate: '',
                paymentMethod: 'Cash',
              };

              const due = Math.max(pay.expectedAmount - pay.paidAmount, 0);
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
                          {member.participatesInSports === false && (
                            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300">
                              {isBangla ? '🏛️ শুধু ফান্ডিং' : '🏛️ Patron'}
                            </span>
                          )}
                        </h4>
                        <p className="text-xs text-slate-400">{member.phone}</p>
                      </div>
                    </div>

                    <StatusBadge status={pay.status} lang={lang} />
                  </div>

                  <div className="grid grid-cols-3 gap-2 bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block">{t.weekly_amount}</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {formatCurrency(pay.expectedAmount, isBangla)}
                      </span>
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
                        {formatCurrency(due, isBangla)}
                      </span>
                    </div>
                  </div>

                  {/* Actions Row */}
                  <div className="flex items-center justify-between pt-1">
                    <div className="text-[11px] text-slate-400">
                      {pay.paymentMethod} {pay.paymentDate ? `• ${pay.paymentDate}` : ''}
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
                                onQuickMark(pay.id, 'PAID', pay.expectedAmount)
                              }
                              className="px-2 py-1 rounded-lg text-[11px] font-bold bg-emerald-600 text-white hover:bg-emerald-500"
                            >
                              {t.mark_paid}
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
                  const pay = currentWeekPayments.find((p) => p.memberId === member.id) || {
                    id: `p-${activeWeek.id}-${member.id}`,
                    seasonId: activeWeek.seasonId,
                    weekId: activeWeek.id,
                    memberId: member.id,
                    expectedAmount: member.weeklyAmount,
                    paidAmount: 0,
                    status: 'UNPAID' as const,
                    paymentDate: '',
                    paymentMethod: 'Cash',
                  };

                  const due = Math.max(pay.expectedAmount - pay.paidAmount, 0);
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
                        {formatCurrency(pay.expectedAmount, isBangla)}
                      </td>

                      <td className="py-3.5 px-4 font-black font-mono text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(pay.paidAmount, isBangla)}
                      </td>

                      <td
                        className={`py-3.5 px-4 font-black font-mono ${
                          due > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-400'
                        }`}
                      >
                        {formatCurrency(due, isBangla)}
                      </td>

                      <td className="py-3.5 px-4">
                        <StatusBadge status={pay.status} lang={lang} />
                      </td>

                      <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400">
                        {pay.paymentDate || '—'}
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
                                    onQuickMark(pay.id, 'PAID', pay.expectedAmount)
                                  }
                                  className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-500 shadow-sm"
                                >
                                  {t.mark_paid}
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

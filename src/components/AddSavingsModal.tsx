import React, { useState } from 'react';
import { Member, SavingsDeposit } from '../types';
import { translations, Language, formatCurrency } from '../utils/language';
import { X, PiggyBank, ArrowDownRight, ArrowUpRight, Check } from 'lucide-react';

interface Props {
  members: Member[];
  savingsDeposits: SavingsDeposit[];
  lang: Language;
  defaultMemberId?: string;
  seasonId: string;
  onSave: (deposit: SavingsDeposit) => void;
  onClose: () => void;
}

export const AddSavingsModal: React.FC<Props> = ({
  members,
  savingsDeposits,
  lang,
  defaultMemberId,
  seasonId,
  onSave,
  onClose,
}) => {
  const isBangla = lang === 'bn';

  const [memberId, setMemberId] = useState<string>(
    defaultMemberId || (members[0] ? members[0].id : '')
  );
  const [type, setType] = useState<'DEPOSIT' | 'WITHDRAWAL'>('DEPOSIT');
  const [amount, setAmount] = useState<number>(500);
  const [monthPeriod, setMonthPeriod] = useState<string>(
    isBangla ? 'ফেব্রুয়ারি ২০২৬' : 'February 2026'
  );
  const [date, setDate] = useState<string>(new Date().toLocaleDateString('en-GB'));
  const [method, setMethod] = useState<string>('bKash');
  const [notes, setNotes] = useState<string>('');

  const selectedMember = members.find((m) => m.id === memberId);
  const memberName = isBangla && selectedMember?.banglaName ? selectedMember.banglaName : selectedMember?.name || '';

  // Calculate current member savings balance
  const currentMemberSavings = savingsDeposits
    .filter((d) => d.memberId === memberId)
    .reduce((acc, d) => (d.type === 'DEPOSIT' ? acc + d.amount : acc - d.amount), 0);

  const estimatedNewBalance =
    type === 'DEPOSIT'
      ? currentMemberSavings + (Number(amount) || 0)
      : Math.max(0, currentMemberSavings - (Number(amount) || 0));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberId || !amount || amount <= 0) return;

    const newDeposit: SavingsDeposit = {
      id: `sav-${Date.now()}`,
      seasonId,
      memberId,
      date,
      monthPeriod,
      amount: Number(amount),
      type,
      paymentMethod: method,
      notes: notes.trim() || undefined,
      recordedBy: 'Admin / Treasurer',
    };

    onSave(newDeposit);
  };

  const quickAmounts = [300, 500, 1000, 1500, 2000];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-emerald-50/50 dark:bg-emerald-950/20">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-sm">
              <PiggyBank className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                {isBangla ? 'মাসিক সঞ্চয় / ফান্ড জমা' : 'Record Sonsoy / Savings Deposit'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isBangla ? 'সদস্যদের ব্যক্তিগত সঞ্চয় ও জরুরি ফান্ড' : 'Member savings ledger & club reserve'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Deposit or Withdrawal Switch */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
            <button
              type="button"
              onClick={() => setType('DEPOSIT')}
              className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all ${
                type === 'DEPOSIT'
                  ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <ArrowDownRight className="w-4 h-4 text-emerald-500" />
              <span>{isBangla ? 'সঞ্চয় জমা (Deposit)' : 'Deposit (+) '}</span>
            </button>
            <button
              type="button"
              onClick={() => setType('WITHDRAWAL')}
              className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all ${
                type === 'WITHDRAWAL'
                  ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <ArrowUpRight className="w-4 h-4 text-rose-500" />
              <span>{isBangla ? 'সঞ্চয় উত্তোলন (Withdraw)' : 'Withdraw (-) '}</span>
            </button>
          </div>

          {/* Member Selection */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
              {isBangla ? 'সদস্য নির্বাচন করুন' : 'Select Member'}
            </label>
            <select
              value={memberId}
              onChange={(e) => setMemberId(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
            >
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {isBangla && m.banglaName ? m.banglaName : m.name} ({m.phone})
                </option>
              ))}
            </select>
          </div>

          {/* Current savings badge */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700">
            <div className="text-xs text-slate-500 dark:text-slate-400">
              {memberName} {isBangla ? 'এর বর্তমান সঞ্চয়:' : 'Current Savings:'}
            </div>
            <div className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
              {formatCurrency(currentMemberSavings, isBangla)}
            </div>
          </div>

          {/* Amount and Quick Presets */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                {isBangla ? 'জমার পরিমাণ (টাকা)' : 'Amount (BDT)'}
              </label>
              <span className="text-[11px] font-semibold text-slate-500">
                {isBangla ? 'নতুন স্থিতি হবে:' : 'New Balance:'}{' '}
                <strong className="text-emerald-600">{formatCurrency(estimatedNewBalance, isBangla)}</strong>
              </span>
            </div>
            <input
              type="number"
              min="1"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              required
              className="w-full px-3 py-2 text-base font-bold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
            />
            {/* Quick amount chips */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {quickAmounts.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => setAmount(q)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                    amount === q
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  +{formatCurrency(q, isBangla)}
                </button>
              ))}
            </div>
          </div>

          {/* Month Period & Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                {isBangla ? 'মাসের নাম' : 'Month Period'}
              </label>
              <input
                type="text"
                value={monthPeriod}
                onChange={(e) => setMonthPeriod(e.target.value)}
                placeholder="e.g. February 2026"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                {isBangla ? 'জমার তারিখ' : 'Deposit Date'}
              </label>
              <input
                type="text"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
              />
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
              {isBangla ? 'পেমেন্টের মাধ্যম' : 'Payment Method'}
            </label>
            <div className="grid grid-cols-4 gap-2">
              {['bKash', 'Nagad', 'Cash', 'Bank'].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMethod(m)}
                  className={`py-1.5 px-2 rounded-xl text-xs font-bold border text-center transition-all ${
                    method === m
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
              {isBangla ? 'নোট / বিবরণ (ঐচ্ছিক)' : 'Notes / Remarks (Optional)'}
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={isBangla ? 'যেমন: নগদ জমা বা রেফারেন্স নম্বর' : 'e.g. Cash in hand or transaction ref'}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
            />
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {isBangla ? 'বাতিল' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md transition-all flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>{isBangla ? 'সঞ্চয় সংরক্ষণ করুন' : 'Save Deposit'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

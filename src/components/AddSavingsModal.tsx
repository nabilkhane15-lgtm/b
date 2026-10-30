import React, { useState } from 'react';
import { Member, SavingsDeposit, PaymentMethod } from '../types';
import { Language } from '../utils/language';
import { X, PiggyBank, ArrowDownCircle, ArrowUpCircle, AlertTriangle } from 'lucide-react';

interface Props {
  lang: Language;
  members: Member[];
  savingsDeposits?: SavingsDeposit[];
  seasonId: string;
  onSave: (deposit: Omit<SavingsDeposit, 'id'>) => void;
  onClose: () => void;
  defaultMemberId?: string;
  preselectedMemberId?: string;
}

export const AddSavingsModal: React.FC<Props> = ({
  lang,
  members,
  savingsDeposits = [],
  seasonId,
  onSave,
  onClose,
  defaultMemberId,
  preselectedMemberId,
}) => {
  const isBangla = lang === 'bn';
  const activeMembers = members.filter((m) => m.isActive);

  const [memberId, setMemberId] = useState(
    defaultMemberId || preselectedMemberId || activeMembers[0]?.id || ''
  );
  const [type, setType] = useState<'DEPOSIT' | 'WITHDRAWAL'>('DEPOSIT');
  const [amount, setAmount] = useState<number>(500);
  const [method, setMethod] = useState<PaymentMethod>('bKash');
  const [purpose, setPurpose] = useState(
    isBangla ? 'মাসিক ডিপিএস সঞ্চয়' : 'Monthly DPS Savings'
  );
  const [date, setDate] = useState(new Date().toLocaleDateString('en-GB'));
  const [notes, setNotes] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const currentMemberSavings = savingsDeposits
    .filter((s) => s.memberId === memberId && (!s.seasonId || s.seasonId === seasonId))
    .reduce((acc, s) => (s.type === 'DEPOSIT' ? acc + s.amount : acc - s.amount), 0);

  const safeAvailableSavings = Math.max(0, currentMemberSavings);
  const cleanAmount = Math.max(0, Math.round(Number(amount) || 0));
  const isOverdraft = type === 'WITHDRAWAL' && cleanAmount > safeAvailableSavings;

  const estimatedNewBalance =
    type === 'DEPOSIT'
      ? safeAvailableSavings + cleanAmount
      : Math.max(0, safeAvailableSavings - cleanAmount);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!memberId || cleanAmount <= 0) {
      setErrorMsg(
        isBangla
          ? 'টাকার পরিমাণ অবশ্যই ০ টাকার বেশি হতে হবে।'
          : 'Amount must be greater than 0 BDT.'
      );
      return;
    }

    if (type === 'WITHDRAWAL' && cleanAmount > safeAvailableSavings) {
      setErrorMsg(
        isBangla
          ? `পর্যাপ্ত সঞ্চয় ব্যালেন্স নেই! বর্তমান জমা আছে ৳${safeAvailableSavings}, কিন্তু আপনি ৳${cleanAmount} উত্তোলনের চেষ্টা করছেন।`
          : `Insufficient savings balance! Available: ৳${safeAvailableSavings}, Requested: ৳${cleanAmount}.`
      );
      return;
    }

    onSave({
      seasonId,
      memberId,
      amount: cleanAmount,
      type,
      date: date || new Date().toLocaleDateString('en-GB'),
      monthPeriod: purpose.trim() || (type === 'DEPOSIT' ? 'মাসিক সঞ্চয় জমা' : 'সঞ্চয় উত্তোলন'),
      paymentMethod: method,
      method,
      purpose:
        purpose.trim() ||
        (type === 'DEPOSIT' ? 'মাসিক সঞ্চয় জমা' : 'সঞ্চয় উত্তোলন'),
      notes: notes.trim() || undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-amber-500/10 to-emerald-500/10">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500 text-white shadow-sm">
              <PiggyBank className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                {isBangla
                  ? 'সঞ্চয় তহবিল জমা / উত্তোলন'
                  : 'Savings Deposit / Withdrawal'}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {isBangla
                  ? 'সদস্যদের ব্যক্তিগত ও ক্লাব সঞ্চয় হিসাব'
                  : 'Member savings & DPS account'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => {
                setType('DEPOSIT');
                setErrorMsg('');
                setPurpose(
                  isBangla ? 'মাসিক ডিপিএস সঞ্চয়' : 'Monthly DPS Savings'
                );
              }}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-bold text-xs border transition ${
                type === 'DEPOSIT'
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
              }`}
            >
              <ArrowDownCircle className="w-4 h-4" />
              {isBangla ? 'সঞ্চয় জমা (Deposit)' : 'Deposit'}
            </button>
            <button
              type="button"
              onClick={() => {
                setType('WITHDRAWAL');
                setErrorMsg('');
                setPurpose(isBangla ? 'জরুরি উত্তোলন' : 'Savings Withdrawal');
              }}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-bold text-xs border transition ${
                type === 'WITHDRAWAL'
                  ? 'bg-rose-600 text-white border-rose-600 shadow-md shadow-rose-600/20'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
              }`}
            >
              <ArrowUpCircle className="w-4 h-4" />
              {isBangla ? 'উত্তোলন (Withdraw)' : 'Withdrawal'}
            </button>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
              {isBangla ? 'সদস্য নির্বাচন করুন' : 'Select Member'}
            </label>
            <select
              value={memberId}
              onChange={(e) => {
                setMemberId(e.target.value);
                setErrorMsg('');
              }}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold focus:ring-2 focus:ring-amber-500 focus:outline-none"
            >
              {activeMembers.map((m) => (
                <option key={m.id} value={m.id}>
                  #{m.memberCode} — {isBangla ? m.banglaName || m.name : m.name} ({m.phone})
                </option>
              ))}
            </select>
          </div>

          <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between">
            <div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {isBangla ? 'বর্তমান সঞ্চয় স্থিতি' : 'Current Savings Balance'}
              </p>
              <p className="text-base font-black text-amber-600 dark:text-amber-400">
                ৳{safeAvailableSavings.toLocaleString()}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {isBangla ? 'নতুন স্থিতি হবে' : 'Estimated New Balance'}
              </p>
              <p
                className={`text-base font-black ${
                  isOverdraft
                    ? 'text-rose-600 dark:text-rose-400'
                    : 'text-emerald-600 dark:text-emerald-400'
                }`}
              >
                ৳{estimatedNewBalance.toLocaleString()}
              </p>
            </div>
          </div>

          {(isOverdraft || errorMsg) && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-bold flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                {errorMsg ||
                  (isBangla
                    ? `সতর্কতা: সদস্যের বর্তমান সঞ্চয় (৳${safeAvailableSavings}) থেকে বেশি টাকা উত্তোলন করা যাবে না!`
                    : `Cannot withdraw more than available savings (৳${safeAvailableSavings})!`)}
              </span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                {isBangla ? 'পরিমাণ (৳)' : 'Amount (৳)'}
              </label>
              <input
                type="number"
                min="1"
                step="50"
                required
                value={amount}
                onChange={(e) => {
                  setAmount(Number(e.target.value));
                  setErrorMsg('');
                }}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold font-mono text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                {isBangla ? 'তারিখ' : 'Date'}
              </label>
              <input
                type="text"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                placeholder="DD/MM/YYYY"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {[200, 500, 1000, 2000, 5000].map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => {
                  setAmount(val);
                  setErrorMsg('');
                }}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition ${
                  amount === val
                    ? 'bg-amber-500 text-white border-amber-500'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}
              >
                ৳{val}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                {isBangla ? 'সঞ্চয়ের উদ্দেশ্য / খাত' : 'Savings Purpose'}
              </label>
              <input
                type="text"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                placeholder={isBangla ? 'যেমন: ঈদ বোনাস / বার্ষিক সঞ্চয়' : 'e.g. Annual Savings'}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                {isBangla ? 'মাধ্যম (Method)' : 'Payment Method'}
              </label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value as PaymentMethod)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold focus:ring-2 focus:ring-amber-500 focus:outline-none"
              >
                <option value="bKash">bKash (বিকাশ)</option>
                <option value="Nagad">Nagad (নগদ)</option>
                <option value="Cash">Cash (ক্যাশ)</option>
                <option value="Bank">Bank (ব্যাংক)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
              {isBangla ? 'নোট / মন্তব্য (ঐচ্ছিক)' : 'Notes (Optional)'}
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={isBangla ? 'রশিদ নম্বর বা বিশেষ নোট...' : 'Receipt number or notes...'}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {isBangla ? 'বাতিল' : 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={isOverdraft}
              className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-amber-500/20"
            >
              {isBangla ? 'সংরক্ষণ করুন' : 'Save Transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

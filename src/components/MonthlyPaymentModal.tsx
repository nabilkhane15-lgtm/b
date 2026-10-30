import React, { useState } from 'react';
import { Member, MonthlyPayment, MonthRecord, PaymentMethod } from '../types';
import { translations, Language } from '../utils/language';
import { X, CheckCircle, RotateCcw, Edit3 } from 'lucide-react';
import { applyPaymentCorrection } from '../utils/accounting';

interface Props {
  lang: Language;
  payment: MonthlyPayment;
  member: Member;
  month?: MonthRecord;
  monthLabel?: string;
  actorName?: string;
  onSave: (updated: MonthlyPayment, updateMemberDefaultMonthlyFee?: number) => void;
  onClose: () => void;
}

export const MonthlyPaymentModal: React.FC<Props> = ({
  lang,
  payment,
  member,
  month,
  monthLabel,
  actorName = 'Admin',
  onSave,
  onClose,
}) => {
  const t = translations[lang];
  const isBangla = lang === 'bn';

  const resolvedMonthLabel =
    monthLabel ||
    (month ? (isBangla ? month.titleBangla || month.title : month.title) : '');

  const [expectedAmount, setExpectedAmount] = useState<number>(payment.expectedAmount);
  const [updateDefaultFee, setUpdateDefaultFee] = useState<boolean>(true);
  const [paidAmount, setPaidAmount] = useState<number>(
    payment.paidAmount > 0 ? payment.paidAmount : payment.expectedAmount
  );
  const [method, setMethod] = useState<PaymentMethod>(
    payment.paymentMethod || payment.method || 'bKash'
  );
  const [notes, setNotes] = useState<string>(payment.notes || '');
  const [transactionRef, setTransactionRef] = useState<string>(
    payment.transactionRef || ''
  );
  const [correctionReason, setCorrectionReason] = useState<string>('');

  const handleExpectedChange = (val: number) => {
    const cleanVal = Math.max(0, Math.round(Number(val) || 0));
    if (paidAmount === expectedAmount && payment.paidAmount === 0) {
      setPaidAmount(cleanVal);
    }
    setExpectedAmount(cleanVal);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = Math.max(0, Math.round(Number(paidAmount) || 0));
    const cleanExpected = Math.max(0, Math.round(Number(expectedAmount) || 0));
    const updated = applyPaymentCorrection(payment, {
      paidAmount: amount,
      expectedAmount: cleanExpected,
      method,
      notes: notes.trim() || undefined,
      transactionRef: transactionRef.trim() || undefined,
      actorName,
      reason: correctionReason.trim() || undefined,
    });
    const newDefaultFee =
      updateDefaultFee && cleanExpected !== (member.monthlyAmount || payment.expectedAmount)
        ? cleanExpected
        : undefined;
    onSave(updated, newDefaultFee);
    onClose();
  };

  const handleMarkUnpaid = () => {
    const cleanExpected = Math.max(0, Math.round(Number(expectedAmount) || 0));
    const updated = applyPaymentCorrection(payment, {
      paidAmount: 0,
      expectedAmount: cleanExpected,
      notes: notes.trim() || undefined,
      actorName,
      reason:
        correctionReason.trim() ||
        (isBangla ? 'বকেয়া হিসেবে সংশোধন' : 'Reverted to UNPAID'),
    });
    const newDefaultFee =
      updateDefaultFee && cleanExpected !== (member.monthlyAmount || payment.expectedAmount)
        ? cleanExpected
        : undefined;
    onSave(updated, newDefaultFee);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-indigo-500/10 to-purple-500/10">
          <div>
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
              {isBangla ? 'মাসিক চাঁদা ও নির্ধারিত ফি আপডেট' : 'Record Monthly Fee & Edit Expected'}
            </h3>
            <p className="text-xs text-indigo-600 dark:text-indigo-400 font-bold">
              {resolvedMonthLabel}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 space-y-2.5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">{t.member_name}</p>
                <p className="font-bold text-slate-900 dark:text-white">
                  {isBangla ? member.banglaName || member.name : member.name}
                </p>
                <p className="text-xs text-slate-500">
                  #{member.memberCode} • {member.phone}
                </p>
              </div>
              <div className="text-right">
                <label className="text-[11px] font-bold text-indigo-700 dark:text-indigo-300 flex items-center justify-end gap-1 mb-1">
                  <Edit3 className="w-3 h-3" />
                  {isBangla ? 'নির্ধারিত মাসিক ফি (৳)' : 'Expected Fee (৳)'}
                </label>
                <input
                  type="number"
                  min="0"
                  value={expectedAmount}
                  onChange={(e) => handleExpectedChange(Number(e.target.value))}
                  className="w-28 px-2.5 py-1.5 text-right rounded-lg border border-indigo-400 dark:border-indigo-600 bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-300 font-extrabold text-base focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-1.5 pt-1 border-t border-indigo-500/20">
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                {isBangla ? 'দ্রুত ফি নির্বাচন:' : 'Quick Fee:'}
              </span>
              <div className="flex flex-wrap gap-1">
                {[300, 500, 800, 1000, 1400, 1500, 2000].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => handleExpectedChange(preset)}
                    className={`px-2 py-0.5 rounded-md text-[11px] font-bold transition-colors ${
                      expectedAmount === preset
                        ? 'bg-indigo-600 text-white'
                        : 'bg-white/80 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-indigo-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    ৳{preset}
                  </button>
                ))}
              </div>
            </div>

            {expectedAmount !== (member.monthlyAmount || payment.expectedAmount) && (
              <label className="flex items-center gap-2 pt-1 text-xs font-semibold text-indigo-800 dark:text-indigo-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={updateDefaultFee}
                  onChange={(e) => setUpdateDefaultFee(e.target.checked)}
                  className="rounded border-indigo-400 text-indigo-600 focus:ring-indigo-500"
                />
                <span>
                  {isBangla
                    ? `সদস্যের স্থায়ী মাসিক নির্ধারিত ফি-ও ৳${expectedAmount} হিসেবে সেভ করুন`
                    : `Also save ৳${expectedAmount} as member's default monthly fee`}
                </span>
              </label>
            )}
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
              {t.paid_amount} (৳)
            </label>
            <input
              type="number"
              min="0"
              value={paidAmount}
              onChange={(e) => setPaidAmount(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-base focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
            <div className="flex gap-2 mt-2">
              <button
                type="button"
                onClick={() => setPaidAmount(expectedAmount)}
                className="text-xs px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold"
              >
                Full (৳{expectedAmount})
              </button>
              <button
                type="button"
                onClick={() => setPaidAmount(Math.round(expectedAmount / 2))}
                className="text-xs px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold"
              >
                Half (৳{Math.round(expectedAmount / 2)})
              </button>
              <button
                type="button"
                onClick={() => setPaidAmount(0)}
                className="text-xs px-2.5 py-1 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 font-semibold"
              >
                Unpaid (0)
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
              {t.payment_method}
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {(['bKash', 'Nagad', 'Cash'] as PaymentMethod[]).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMethod(m)}
                  className={`py-2.5 px-3 rounded-xl font-bold text-xs border transition-all ${
                    method === m
                      ? m === 'bKash'
                        ? 'bg-pink-600 text-white border-pink-600 shadow-md'
                        : m === 'Nagad'
                        ? 'bg-orange-500 text-white border-orange-500 shadow-md'
                        : 'bg-emerald-600 text-white border-emerald-600 shadow-md'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {m === 'bKash'
                    ? isBangla
                      ? 'বিকাশ'
                      : 'bKash'
                    : m === 'Nagad'
                    ? isBangla
                      ? 'নগদ'
                      : 'Nagad'
                    : isBangla
                    ? 'ক্যাশ'
                    : 'Cash'}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                {isBangla ? 'ট্রানজেকশন আইডি (TrxID)' : 'Transaction Ref (TrxID)'}
              </label>
              <input
                type="text"
                value={transactionRef}
                onChange={(e) => setTransactionRef(e.target.value)}
                placeholder="TrxID..."
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                {isBangla ? 'নোট / মন্তব্য' : 'Notes'}
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Notes..."
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          {payment.paidAmount > 0 && (
            <div>
              <label className="text-xs font-semibold text-amber-700 dark:text-amber-400 block mb-1">
                {isBangla ? 'সংশোধনের কারণ' : 'Correction Reason'}
              </label>
              <input
                type="text"
                value={correctionReason}
                onChange={(e) => setCorrectionReason(e.target.value)}
                placeholder={isBangla ? 'যেমন: ভুল এন্ট্রি সংশোধন' : 'e.g. Correcting mistaken entry'}
                className="w-full px-3 py-2 rounded-xl border border-amber-300 dark:border-amber-700 bg-amber-50/50 dark:bg-amber-950/30 text-slate-900 dark:text-white text-xs focus:outline-none"
              />
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            {payment.paidAmount > 0 ? (
              <button
                type="button"
                onClick={handleMarkUnpaid}
                className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 font-semibold text-xs"
              >
                <RotateCcw className="w-4 h-4" />
                {t.mark_unpaid}
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold"
              >
                {t.cancel}
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/25"
              >
                <CheckCircle className="w-4 h-4" />
                {t.save}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

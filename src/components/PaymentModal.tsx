import React, { useState } from 'react';
import { Member, Payment, PaymentMethod, Week } from '../types';
import { translations, Language } from '../utils/language';
import { X, CheckCircle, AlertCircle, RotateCcw, History, Edit3 } from 'lucide-react';
import { applyPaymentCorrection } from '../utils/accounting';

interface Props {
  lang: Language;
  payment: Payment;
  member: Member;
  week?: Week;
  weekLabel?: string;
  actorName?: string;
  onSave: (updatedPayment: Payment, updateMemberDefaultFee?: number) => void;
  onClose: () => void;
}

export const PaymentModal: React.FC<Props> = ({
  lang,
  payment,
  member,
  week,
  weekLabel,
  actorName = 'Admin',
  onSave,
  onClose,
}) => {
  const t = translations[lang];
  const isBangla = lang === 'bn';

  const resolvedWeekLabel =
    weekLabel ||
    (week ? (isBangla ? week.titleBangla || week.title : week.title) : '');

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
  const [paidDate, setPaidDate] = useState<string>(
    payment.paymentDate || payment.paidDate || new Date().toLocaleDateString('en-GB')
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
      paidDate: amount > 0 ? paidDate : undefined,
      notes: notes.trim() || undefined,
      transactionRef: transactionRef.trim() || undefined,
      actorName,
      reason: correctionReason.trim() || undefined,
    });
    const newDefaultFee =
      updateDefaultFee && cleanExpected !== member.weeklyAmount
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
        (isBangla
          ? 'অ্যাডমিন কর্তৃক বকেয়া হিসেবে সংশোধন'
          : 'Reverted to UNPAID by Admin'),
    });
    const newDefaultFee =
      updateDefaultFee && cleanExpected !== member.weeklyAmount
        ? cleanExpected
        : undefined;
    onSave(updated, newDefaultFee);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              {isBangla ? 'পেমেন্ট ও নির্ধারিত ফি আপডেট' : 'Record Payment & Edit Fee'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {resolvedWeekLabel}
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
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 space-y-2.5">
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
                <label className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 flex items-center justify-end gap-1 mb-1">
                  <Edit3 className="w-3 h-3" />
                  {isBangla ? 'নির্ধারিত চাঁদা (৳)' : 'Expected Fee (৳)'}
                </label>
                <input
                  type="number"
                  min="0"
                  value={expectedAmount}
                  onChange={(e) => handleExpectedChange(Number(e.target.value))}
                  className="w-28 px-2.5 py-1.5 text-right rounded-lg border border-emerald-400 dark:border-emerald-600 bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-300 font-extrabold text-base focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-1.5 pt-1 border-t border-emerald-500/20">
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                {isBangla ? 'দ্রুত ফি নির্বাচন:' : 'Quick Fee:'}
              </span>
              <div className="flex flex-wrap gap-1">
                {[100, 150, 200, 250, 300, 350, 500].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => handleExpectedChange(preset)}
                    className={`px-2 py-0.5 rounded-md text-[11px] font-bold transition-colors ${
                      expectedAmount === preset
                        ? 'bg-emerald-600 text-white'
                        : 'bg-white/80 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-emerald-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    ৳{preset}
                  </button>
                ))}
              </div>
            </div>

            {expectedAmount !== member.weeklyAmount && (
              <label className="flex items-center gap-2 pt-1 text-xs font-semibold text-emerald-800 dark:text-emerald-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={updateDefaultFee}
                  onChange={(e) => setUpdateDefaultFee(e.target.checked)}
                  className="rounded border-emerald-400 text-emerald-600 focus:ring-emerald-500"
                />
                <span>
                  {isBangla
                    ? `সদস্যের স্থায়ী সাপ্তাহিক নির্ধারিত ফি-ও ৳${expectedAmount} হিসেবে সেভ করুন`
                    : `Also save ৳${expectedAmount} as member's default weekly fee`}
                </span>
              </label>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                {t.paid_amount} (৳)
              </label>
              <input
                type="number"
                min="0"
                max={Math.max(5000, expectedAmount * 4)}
                value={paidAmount}
                onChange={(e) => setPaidAmount(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-base focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                {t.payment_date}
              </label>
              <input
                type="text"
                value={paidDate}
                onChange={(e) => setPaidDate(e.target.value)}
                placeholder="DD/MM/YYYY"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setPaidAmount(expectedAmount)}
              className="text-xs px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold hover:bg-emerald-500/20"
            >
              Full (৳{expectedAmount})
            </button>
            <button
              type="button"
              onClick={() => setPaidAmount(Math.round(expectedAmount / 2))}
              className="text-xs px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold hover:bg-amber-500/20"
            >
              Half (৳{Math.round(expectedAmount / 2)})
            </button>
            <button
              type="button"
              onClick={() => setPaidAmount(0)}
              className="text-xs px-2.5 py-1 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 font-semibold hover:bg-rose-500/20"
            >
              Unpaid (0)
            </button>
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
                  className={`py-2.5 px-3 rounded-xl font-bold text-xs border flex items-center justify-center gap-1.5 transition-all ${
                    method === m
                      ? m === 'bKash'
                        ? 'bg-pink-600 text-white border-pink-600 shadow-lg shadow-pink-600/20'
                        : m === 'Nagad'
                        ? 'bg-orange-500 text-white border-orange-500 shadow-lg shadow-orange-500/20'
                        : 'bg-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-600/20'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
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
                placeholder="e.g. 9H7K2..."
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
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
                placeholder={isBangla ? 'মন্তব্য...' : 'Notes...'}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {payment.paidAmount > 0 && (
            <div>
              <label className="text-xs font-semibold text-amber-700 dark:text-amber-400 block mb-1">
                {isBangla
                  ? 'সংশোধনের কারণ (যদি পরিবর্তন করেন)'
                  : 'Correction Reason (if modifying)'}
              </label>
              <input
                type="text"
                value={correctionReason}
                onChange={(e) => setCorrectionReason(e.target.value)}
                placeholder={
                  isBangla
                    ? 'যেমন: ভুলবশত পরিশোধিত দেওয়া হয়েছিল / আংশিক জমা'
                    : 'e.g. Marked paid by mistake / partial adjustment'
                }
                className="w-full px-3 py-2 rounded-xl border border-amber-300 dark:border-amber-700 bg-amber-50/50 dark:bg-amber-950/30 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>
          )}

          {payment.correctionHistory && payment.correctionHistory.length > 0 && (
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-[11px] space-y-1">
              <div className="font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1">
                <History className="w-3.5 h-3.5 text-indigo-500" />
                <span>{isBangla ? 'সর্বশেষ অডিট রেকর্ড:' : 'Recent Audit Trail:'}</span>
              </div>
              {payment.correctionHistory.slice(-2).map((entry) => (
                <div
                  key={entry.id}
                  className="text-slate-500 dark:text-slate-400 flex justify-between"
                >
                  <span>
                    {entry.actorName}: ৳{entry.previousPaidAmount ?? 0} → ৳
                    {entry.newPaidAmount ?? 0} ({entry.newStatus})
                  </span>
                  <span>{new Date(entry.timestamp).toLocaleDateString('en-GB')}</span>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between pt-2 gap-2">
            {payment.paidAmount > 0 ? (
              <button
                type="button"
                onClick={handleMarkUnpaid}
                className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 font-semibold text-xs transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                {t.mark_unpaid}
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2 ml-auto">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                {t.cancel}
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/25 transition-all"
              >
                {paidAmount > 0 ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <AlertCircle className="w-4 h-4" />
                )}
                {t.save}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

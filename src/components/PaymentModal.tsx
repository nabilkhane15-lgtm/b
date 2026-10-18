import React, { useState } from 'react';
import { Member, Payment, Week } from '../types';
import { translations, Language, formatCurrency } from '../utils/language';
import { X, Check, DollarSign } from 'lucide-react';

interface Props {
  member: Member;
  payment: Payment;
  week: Week;
  lang: Language;
  onSave: (updatedPayment: Payment) => void;
  onClose: () => void;
}

export const PaymentModal: React.FC<Props> = ({
  member,
  payment,
  week,
  lang,
  onSave,
  onClose,
}) => {
  const t = translations[lang];
  const isBangla = lang === 'bn';
  const memberName = isBangla && member.banglaName ? member.banglaName : member.name;

  const [paidAmount, setPaidAmount] = useState<number>(payment.paidAmount);
  const [method, setMethod] = useState<string>(payment.paymentMethod || 'bKash');
  const [date, setDate] = useState<string>(
    payment.paymentDate || new Date().toLocaleDateString('en-GB')
  );
  const [notes, setNotes] = useState<string>(payment.notes || '');

  const expected = payment.expectedAmount || member.weeklyAmount;

  const handleQuickStatus = (status: 'PAID' | 'PARTIAL' | 'UNPAID') => {
    if (status === 'PAID') {
      setPaidAmount(expected);
    } else if (status === 'UNPAID') {
      setPaidAmount(0);
    } else {
      setPaidAmount(Math.round(expected / 2));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalPaid = Number(paidAmount) || 0;
    let finalStatus: Payment['status'] = 'UNPAID';
    if (finalPaid >= expected) {
      finalStatus = 'PAID';
    } else if (finalPaid > 0) {
      finalStatus = 'PARTIAL';
    }

    onSave({
      ...payment,
      paidAmount: finalPaid,
      status: finalStatus,
      paymentMethod: method as any,
      paymentDate: finalPaid > 0 ? date : '',
      notes,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              {isBangla ? 'পেমেন্ট আপডেট করুন' : 'Update Payment Record'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {memberName} • {isBangla && week.titleBangla ? week.titleBangla : week.title}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Quick presets */}
          <div>
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1.5">
              {isBangla ? 'দ্রুত স্ট্যাটাস নির্বাচন' : 'Quick Presets'}
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickStatus('PAID')}
                className="py-1.5 px-2 rounded-lg text-xs font-bold border border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 hover:bg-emerald-100"
              >
                ✅ {t.status_paid} ({formatCurrency(expected, isBangla)})
              </button>
              <button
                type="button"
                onClick={() => handleQuickStatus('PARTIAL')}
                className="py-1.5 px-2 rounded-lg text-xs font-bold border border-amber-500 bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 hover:bg-amber-100"
              >
                ⏳ {t.status_partial}
              </button>
              <button
                type="button"
                onClick={() => handleQuickStatus('UNPAID')}
                className="py-1.5 px-2 rounded-lg text-xs font-bold border border-rose-500 bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 hover:bg-rose-100"
              >
                ❌ {t.status_unpaid} (৳0)
              </button>
            </div>
          </div>

          {/* Paid Amount */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
              {isBangla ? 'পরিশোধের পরিমাণ (৳)' : 'Paid Amount (৳)'}
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                ৳
              </span>
              <input
                type="number"
                min="0"
                step="10"
                value={paidAmount}
                onChange={(e) => setPaidAmount(Number(e.target.value))}
                className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                required
              />
            </div>
            <div className="flex justify-between text-[11px] text-slate-500 mt-1">
              <span>
                {isBangla ? 'নির্ধারিত ফি' : 'Expected Fee'}: {formatCurrency(expected, isBangla)}
              </span>
              <span>
                {isBangla ? 'বকেয়া থাকবে' : 'Remaining Due'}:{' '}
                <strong className={expected - paidAmount > 0 ? 'text-rose-500' : 'text-emerald-500'}>
                  {formatCurrency(Math.max(expected - paidAmount, 0), isBangla)}
                </strong>
              </span>
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
              {t.payment_method}
            </label>
            <div className="grid grid-cols-4 gap-2">
              {['bKash', 'Nagad', 'Cash', 'Bank'].map((m) => (
                <button
                  type="button"
                  key={m}
                  onClick={() => setMethod(m)}
                  className={`py-1.5 px-2 rounded-xl text-xs font-bold border transition-all ${
                    method === m
                      ? 'border-emerald-600 bg-emerald-600 text-white shadow-sm'
                      : 'border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Date */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
              {t.payment_date} (DD/MM/YYYY)
            </label>
            <input
              type="text"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              placeholder="DD/MM/YYYY"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
              {isBangla ? 'মন্তব্য বা ট্রানজেকশন আইডি (ঐচ্ছিক)' : 'Notes / Txn ID (Optional)'}
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. bKash TrxID #9X28A"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-500/20"
            >
              {t.save}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

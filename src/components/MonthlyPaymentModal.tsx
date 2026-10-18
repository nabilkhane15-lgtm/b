import React, { useState } from 'react';
import { Member, MonthlyPayment, MonthRecord } from '../types';
import { translations, Language, formatCurrency } from '../utils/language';
import { X, Check } from 'lucide-react';

interface Props {
  member: Member;
  payment: MonthlyPayment;
  month: MonthRecord;
  lang: Language;
  onSave: (updatedPayment: MonthlyPayment) => void;
  onClose: () => void;
}

export const MonthlyPaymentModal: React.FC<Props> = ({
  member,
  payment,
  month,
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

  const expected = payment.expectedAmount || member.monthlyAmount || 1400;

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
    let finalStatus: MonthlyPayment['status'] = 'UNPAID';
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
              {isBangla ? 'মাসিক পেমেন্ট আপডেট করুন' : 'Update Monthly Payment'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {memberName} • {isBangla && month.titleBangla ? month.titleBangla : month.title}
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
                ❌ {t.status_unpaid}
              </button>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                {isBangla ? 'পরিশোধিত টাকা' : 'Paid Amount (BDT)'}
              </label>
              <span className="text-xs text-slate-500">
                {isBangla ? 'প্রত্যাশিত:' : 'Expected:'} {formatCurrency(expected, isBangla)}
              </span>
            </div>
            <input
              type="number"
              min="0"
              value={paidAmount}
              onChange={(e) => setPaidAmount(Number(e.target.value))}
              className="w-full px-3 py-2 text-base font-bold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Payment Method */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
              {t.payment_method}
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

          {/* Payment Date */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
              {t.payment_date}
            </label>
            <input
              type="text"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              placeholder="DD/MM/YYYY"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
              {isBangla ? 'মন্তব্য (ঐচ্ছিক)' : 'Notes / Remarks'}
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={isBangla ? 'ট্রানজ্যাকশন আইডি বা রেফারেন্স' : 'Transaction ID or note'}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
            />
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>{t.save}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

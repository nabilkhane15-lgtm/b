import React from 'react';
import { Member, Payment, Week, ClubSettings } from '../types';
import { formatCurrency, Language } from '../utils/language';
import { X, Printer, Share2, CheckCircle2 } from 'lucide-react';

interface Props {
  member: Member;
  payment: Payment;
  week: Week;
  lang: Language;
  onClose: () => void;
  clubSettings?: ClubSettings;
}

export const ReceiptModal: React.FC<Props> = ({
  member,
  payment,
  week,
  lang,
  onClose,
  clubSettings,
}) => {
  const isBangla = lang === 'bn';
  const memberName = isBangla && member.banglaName ? member.banglaName : member.name;
  const clubTitle = clubSettings
    ? isBangla && clubSettings.clubNameBangla
      ? clubSettings.clubNameBangla
      : clubSettings.clubName
    : isBangla
    ? 'স্ম্যাশার্স ব্যাডমিন্টন ক্লাব'
    : 'Smashers Badminton Club';

  const handlePrint = () => {
    window.print();
  };

  const handleShareWhatsApp = () => {
    const text = isBangla
      ? `🏸 *${clubTitle} - পেমেন্ট রশিদ*\n━━━━━━━━━━━━━━━━━━━━\nরশিদ নং: #REC-${payment.id.toUpperCase()}\nসদস্য: ${memberName}\nসপ্তাহ: ${week.title}\nপরিশোধের পরিমাণ: ${formatCurrency(payment.paidAmount, true)}\nপেমেন্ট মাধ্যম: ${payment.paymentMethod}\nতারিখ: ${payment.paymentDate || 'আজ'}\nস্ট্যাটাস: ${payment.status === 'PAID' ? 'পরিশোধিত ✅' : 'আংশিক ⏳'}\n━━━━━━━━━━━━━━━━━━━━\nধন্যবাদ সাথে থাকার জন্য!`
      : `🏸 *${clubTitle} - Payment Receipt*\n━━━━━━━━━━━━━━━━━━━━\nReceipt No: #REC-${payment.id.toUpperCase()}\nMember: ${memberName}\nWeek: ${week.title}\nAmount Paid: ${formatCurrency(payment.paidAmount, false)}\nMethod: ${payment.paymentMethod}\nDate: ${payment.paymentDate || 'Today'}\nStatus: ${payment.status === 'PAID' ? 'PAID ✅' : 'PARTIAL ⏳'}\n━━━━━━━━━━━━━━━━━━━━\nThank you for your contribution!`;

    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800">
        {/* Top Header Controls (Hidden on print) */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800 no-print">
          <span className="text-sm font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            {isBangla ? 'অফিসিয়াল মানি রশিদ' : 'Official Money Receipt'}
          </span>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Receipt Paper */}
        <div className="p-6 bg-emerald-50/40 dark:bg-slate-950/40" id="receipt-paper">
          <div className="border-2 border-dashed border-emerald-300 dark:border-emerald-800/80 rounded-xl p-5 bg-white dark:bg-slate-900 shadow-sm relative">
            {/* Watermark */}
            <div className="absolute inset-0 flex items-center justify-center opacity-5 select-none pointer-events-none text-9xl">
              🏸
            </div>

            <div className="text-center pb-3 border-b border-slate-200 dark:border-slate-800">
              {clubSettings?.logoUrl ? (
                <div className="w-14 h-14 mx-auto mb-1.5 p-1 bg-white dark:bg-slate-800 rounded-xl border border-emerald-300 dark:border-emerald-800 shadow-sm flex items-center justify-center overflow-hidden">
                  <img src={clubSettings.logoUrl} alt={clubTitle} className="w-full h-full object-contain" />
                </div>
              ) : (
                <span className="text-3xl block mb-1">🏸</span>
              )}
              <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white">
                {clubTitle}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isBangla ? 'অফিসিয়াল চাঁদা জমার রশিদ' : 'Official Contribution Money Receipt'}
              </p>
              <div className="inline-block mt-1 px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[11px] font-mono font-bold">
                #REC-{payment.id.toUpperCase()}
              </div>
            </div>

            {/* Receipt Details Table */}
            <div className="space-y-2.5 my-4 text-xs sm:text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">
                  {isBangla ? 'সদস্যের নাম' : 'Member Name'}:
                </span>
                <span className="font-bold text-slate-900 dark:text-white">{memberName}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">
                  {isBangla ? 'মোবাইল' : 'Phone'}:
                </span>
                <span className="font-medium text-slate-800 dark:text-slate-200">{member.phone}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">
                  {isBangla ? 'সপ্তাহ' : 'Week'}:
                </span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {isBangla && week.titleBangla ? week.titleBangla : week.title}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">
                  {isBangla ? 'পেমেন্ট মাধ্যম' : 'Method'}:
                </span>
                <span className="font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  {payment.paymentMethod}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">
                  {isBangla ? 'তারিখ' : 'Date'}:
                </span>
                <span className="font-medium text-slate-800 dark:text-slate-200">
                  {payment.paymentDate || '23/01/2026'}
                </span>
              </div>

              {payment.notes && (
                <div className="flex justify-between text-xs italic">
                  <span className="text-slate-400">{isBangla ? 'নোট' : 'Notes'}:</span>
                  <span className="text-slate-600 dark:text-slate-400">{payment.notes}</span>
                </div>
              )}
            </div>

            {/* Total Paid Highlight Box */}
            <div className="rounded-xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 p-3.5 border border-emerald-300 dark:border-emerald-700/60 my-4 flex items-center justify-between">
              <div>
                <span className="text-xs text-emerald-800 dark:text-emerald-300 font-medium block">
                  {isBangla ? 'মোট পরিশোধিত পরিমাণ' : 'Total Amount Paid'}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {payment.status === 'PAID'
                    ? (isBangla ? 'সম্পূর্ণ পরিশোধিত' : 'Fully Paid')
                    : (isBangla ? 'আংশিক পরিশোধ' : 'Partial Payment')}
                </span>
              </div>
              <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                {formatCurrency(payment.paidAmount, isBangla)}
              </span>
            </div>

            {/* Signature row */}
            <div className="pt-6 flex justify-between items-end text-[10px] text-slate-400 border-t border-slate-100 dark:border-slate-800">
              <div>
                <div className="w-20 border-b border-slate-300 dark:border-slate-700 mb-1" />
                <span>{isBangla ? 'সদস্যের স্বাক্ষর' : 'Member Sign'}</span>
              </div>
              <div className="text-right">
                <div className="w-20 border-b border-slate-300 dark:border-slate-700 mb-1 ml-auto" />
                <span>{isBangla ? 'কোষাধ্যক্ষ / অ্যাডমিন' : 'Treasurer / Admin'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons (No print) */}
        <div className="p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex gap-2 no-print">
          <button
            onClick={handlePrint}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-bold text-xs transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>{isBangla ? 'প্রিন্ট রশিদ' : 'Print Receipt'}</span>
          </button>

          <button
            onClick={handleShareWhatsApp}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors shadow-sm"
          >
            <Share2 className="w-4 h-4" />
            <span>{isBangla ? 'হোয়াটসঅ্যাপে পাঠান' : 'Share WhatsApp'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

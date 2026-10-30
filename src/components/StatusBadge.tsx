import React from 'react';
import { PaymentStatus } from '../types';
import { translations, Language } from '../utils/language';
import { CheckCircle2, Clock, AlertCircle, CalendarClock } from 'lucide-react';

interface Props {
  status: PaymentStatus | 'UPCOMING';
  lang: Language;
  size?: 'sm' | 'md';
  isUpcoming?: boolean;
}

export const StatusBadge: React.FC<Props> = ({ status, lang, size = 'md', isUpcoming = false }) => {
  const t = translations[lang];
  const isBangla = lang === 'bn';

  if (status === 'PAID') {
    return (
      <span
        className={`inline-flex items-center gap-1 font-semibold rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 ${
          size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'
        }`}
      >
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
        {t.status_paid}
      </span>
    );
  }

  if (status === 'PARTIAL') {
    return (
      <span
        className={`inline-flex items-center gap-1 font-semibold rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300 dark:border-amber-800 ${
          size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'
        }`}
      >
        <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
        {t.status_partial}
      </span>
    );
  }

  if (status === 'UPCOMING' || isUpcoming) {
    return (
      <span
        className={`inline-flex items-center gap-1 font-semibold rounded-full bg-sky-100 text-sky-800 dark:bg-sky-950/80 dark:text-sky-300 border border-sky-300 dark:border-sky-800 ${
          size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'
        }`}
      >
        <CalendarClock className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
        {isBangla ? 'আসন্ন' : 'Upcoming'}
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1 font-semibold rounded-full bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-300 dark:border-rose-800 ${
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'
      }`}
    >
      <AlertCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
      {t.status_unpaid}
    </span>
  );
};

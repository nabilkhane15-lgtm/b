import React, { useState } from 'react';
import {
  X,
  Share2,
  Copy,
  Check,
  Smartphone,
  Globe,
  QrCode,
  ExternalLink,
  ShieldCheck,
  Flame,
} from 'lucide-react';
import { Language } from '../utils/language';
import { getPublicShareUrl, isFirebaseConfigured } from '../utils/firebase';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  clubName?: string;
}

export const SharePublicModal: React.FC<Props> = ({
  isOpen,
  onClose,
  lang,
  clubName,
}) => {
  const [copied, setCopied] = useState(false);
  const [showQr, setShowQr] = useState(true);
  const isBangla = lang === 'bn';

  if (!isOpen) return null;

  const publicUrl = getPublicShareUrl();
  const title = clubName || (isBangla ? 'ব্যাডমিন্টন ক্লাব ফান্ড ম্যানেজার' : 'Badminton Club Fund Manager');

  const handleCopy = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleShareSystem = () => {
    if (navigator.share) {
      navigator.share({
        title,
        text: isBangla
          ? `🏸 আমাদের ${title}-এর লাইভ হিসাব, মেম্বারদের চাঁদা ও খরচের তালিকা দেখতে নিচের লিঙ্কে প্রবেশ করুন:`
          : `🏸 Check out live financials, membership fees, and reports for ${title}:`,
        url: publicUrl,
      }).catch(() => {});
    } else {
      handleCopy();
    }
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `🏸 *${title}*\nআমাদের ক্লাবের লাইভ চাঁদা, টুর্নামেন্ট, পিকনিক ও খরচের হিসাব দেখতে এখানে প্রবেশ করুন:\n👉 ${publicUrl}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank', 'noopener,noreferrer');
  };

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(publicUrl)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/25 shrink-0">
            <Share2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <span>{isBangla ? 'সবার সাথে শেয়ার করুন' : 'Share Public Link'}</span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                {isBangla ? 'পাবলিক' : 'Public'}
              </span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isBangla
                ? 'যেকোনো মোবাইল বা ব্রাউজার থেকে যে কেউ দেখতে পারবে'
                : 'Accessible on any phone, browser, or device'}
            </p>
          </div>
        </div>

        {/* Feature Highlights Banner */}
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border border-emerald-200 dark:border-emerald-800/60 rounded-xl p-3.5 mb-5 space-y-2 text-xs">
          <div className="flex items-start gap-2 text-emerald-900 dark:text-emerald-200">
            <Smartphone className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <span>
              {isBangla
                ? '📱 যেকোনো ফোন (Android / iPhone) বা কম্পিউটারে Chrome, Safari, Firefox দিয়ে সাথে সাথে ওপেন হবে।'
                : '📱 Opens directly in Chrome, Safari, or Firefox on any smartphone (Android/iPhone) or PC.'}
            </span>
          </div>
          <div className="flex items-start gap-2 text-emerald-900 dark:text-emerald-200">
            <Globe className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
            <span>
              {isBangla
                ? '🌐 কোনো অ্যাপ ইনস্টল বা Google অ্যাকাউন্টে লগইন করার প্রয়োজন নেই—লিঙ্কটিতে ক্লিক করলেই সরাসরি লোড হবে।'
                : '🌐 No app installation or Google account login needed—anyone with the link can view it.'}
            </span>
          </div>
          <div className="flex items-start gap-2 text-emerald-900 dark:text-emerald-200">
            <Flame className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <span>
              {isBangla
                ? '🔥 Firebase ক্লাউড ডাটাবেস সক্রিয়: অ্যাডমিন নতুন ডাটা যোগ করলে সবার ডিভাইসে লাইভ রিয়েল-টাইমে আপডেট দেখাবে।'
                : '🔥 Firebase Cloud Database Active: Updates from the admin sync automatically to everyone.'}
            </span>
          </div>
        </div>

        {/* Public URL Box */}
        <div className="mb-5">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
            {isBangla ? 'পাবলিক ওয়েব লিঙ্ক (সবার জন্য):' : 'Public Web Link (For Everyone):'}
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={publicUrl}
              className="flex-1 px-3 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700 text-xs font-mono select-all focus:outline-none"
            />
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-transform active:scale-95 shrink-0"
            >
              {copied ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? (isBangla ? 'কপি হয়েছে!' : 'Copied!') : (isBangla ? 'কপি করুন' : 'Copy')}</span>
            </button>
          </div>
        </div>

        {/* Quick Share Buttons */}
        <div className="grid grid-cols-2 gap-2.5 mb-5">
          <button
            onClick={handleShareWhatsApp}
            className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-sm transition-colors"
          >
            <span className="text-sm">💬</span>
            <span>WhatsApp-এ শেয়ার</span>
          </button>
          <button
            onClick={handleShareSystem}
            className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white font-bold text-xs shadow-sm transition-colors"
          >
            <Share2 className="w-4 h-4" />
            <span>{isBangla ? 'অন্যান্য অ্যাপে শেয়ার' : 'Share to Apps'}</span>
          </button>
        </div>

        {/* QR Code Section */}
        <div className="border-t border-slate-200 dark:border-slate-800 pt-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <QrCode className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>{isBangla ? 'QR কোড স্ক্যান করে মোবাইল থেকে ওপেন করুন' : 'Scan QR code with mobile camera'}</span>
            </span>
            <button
              onClick={() => setShowQr(!showQr)}
              className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              {showQr ? (isBangla ? 'লুকান' : 'Hide') : (isBangla ? 'দেখান' : 'Show')}
            </button>
          </div>

          {showQr && (
            <div className="flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/60">
              <div className="p-2.5 bg-white rounded-xl shadow-md">
                <img
                  src={qrImageUrl}
                  alt="Club App QR Code"
                  className="w-40 h-40 object-contain rounded-lg"
                />
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2.5 text-center">
                {isBangla
                  ? 'যেকোনো মোবাইল ফোনের ক্যামেরা অন করে এই কোডটি স্ক্যান করলেই সরাসরি অ্যাপটি খুলে যাবে!'
                  : 'Point any phone camera at this QR code to instantly launch the club web app!'}
              </p>
            </div>
          )}
        </div>

        {/* Security & Access Info */}
        <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>{isBangla ? 'সাধারণ মেম্বাররা শুধু দেখতে পারবে, এডিট করতে অ্যাডমিন পাসওয়ার্ড লাগবে' : 'Public view-only mode; admin PIN required for editing'}</span>
          </span>
          <button
            onClick={() => window.open(publicUrl, '_blank')}
            className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline flex items-center gap-1"
          >
            <span>{isBangla ? 'নিজে দেখুন' : 'Preview'}</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};

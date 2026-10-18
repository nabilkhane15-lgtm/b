import React, { useState } from 'react';
import { ClubSettings, SportType, CollectionFrequency, AdminProfile } from '../types';
import { SPORTS_MAP } from '../utils/sports';
import { translations, Language } from '../utils/language';
import {
  Settings,
  Languages,
  Moon,
  Sun,
  ShieldCheck,
  Eye,
  Share2,
  RefreshCw,
  Info,
  Check,
  Building2,
  Save,
  Lock,
  KeyRound,
  MessageCircle,
  Flame,
  Database,
  Upload,
  X,
  EyeOff,
  AlertCircle,
  UserCheck,
  Maximize2,
  Download,
  FileArchive,
  ExternalLink,
} from 'lucide-react';
import { isFirebaseConfigured, getFirebaseConfig, getPublicShareUrl } from '../utils/firebase';
import { loadAdminPassword, saveAdminPassword, loadData, loadAdminProfile } from '../utils/storage';
import { ImageLightboxModal } from '../components/ImageLightboxModal';

interface Props {
  lang: Language;
  onToggleLang: () => void;
  isDark: boolean;
  onToggleDark: () => void;
  isAdmin: boolean;
  onToggleAdmin: () => void;
  onOpenPinModal: () => void;
  onOpenChangePassword?: () => void;
  onResetDemo: () => void;
  clubSettings: ClubSettings;
  onUpdateClubSettings: (settings: ClubSettings) => void;
  onOpenFirebaseModal?: () => void;
  adminProfile?: AdminProfile;
  onOpenAdminProfile?: () => void;
}

export const SettingsView: React.FC<Props> = ({
  lang,
  onToggleLang,
  isDark,
  onToggleDark,
  isAdmin,
  onToggleAdmin,
  onOpenPinModal,
  onOpenChangePassword,
  onResetDemo,
  clubSettings,
  onUpdateClubSettings,
  onOpenFirebaseModal,
  adminProfile,
  onOpenAdminProfile,
}) => {
  const t = translations[lang];
  const isBangla = lang === 'bn';
  const [copied, setCopied] = useState(false);
  const [savedClub, setSavedClub] = useState(false);
  const [isPhotoLightboxOpen, setIsPhotoLightboxOpen] = useState(false);
  const [exportedSuccess, setExportedSuccess] = useState(false);

  const [clubName, setClubName] = useState(clubSettings.clubName);
  const [clubNameBangla, setClubNameBangla] = useState(clubSettings.clubNameBangla);
  const [location, setLocation] = useState(clubSettings.location);
  const [established, setEstablished] = useState(clubSettings.established);
  const [sportType, setSportType] = useState<SportType>(clubSettings.sportType || 'multi');
  const [collectionFrequency, setCollectionFrequency] = useState<CollectionFrequency>(
    clubSettings.collectionFrequency || 'both'
  );
  const [defaultWeeklyFee, setDefaultWeeklyFee] = useState<number>(
    clubSettings.defaultWeeklyFee || 350
  );
  const [defaultMonthlyFee, setDefaultMonthlyFee] = useState<number>(
    clubSettings.defaultMonthlyFee || 1400
  );
  const [defaultMonthlySavings, setDefaultMonthlySavings] = useState<number>(
    clubSettings.defaultMonthlySavings || 500
  );
  const [messengerLink, setMessengerLink] = useState<string>(
    clubSettings.messengerLink || ''
  );
  const [logoUrl, setLogoUrl] = useState<string>(
    clubSettings.logoUrl || ''
  );

  // Inline PIN change state
  const [currentPinInput, setCurrentPinInput] = useState('');
  const [newPinInput, setNewPinInput] = useState('');
  const [confirmPinInput, setConfirmPinInput] = useState('');
  const [showCurrentPin, setShowCurrentPin] = useState(false);
  const [showNewPin, setShowNewPin] = useState(false);
  const [pinChangeError, setPinChangeError] = useState<string | null>(null);
  const [pinChangeSuccess, setPinChangeSuccess] = useState(false);
  const [savedPinDisplay, setSavedPinDisplay] = useState(() => loadAdminPassword());

  const handleLogoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert(isBangla ? 'ছবির সাইজ অনেক বড়! দয়া করে ৫MB এর কম ছবি দিন।' : 'File size too large (max 5MB)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const maxDim = 320;

        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/png', 0.85);
          setLogoUrl(dataUrl);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSaveClub = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clubName.trim()) return;

    onUpdateClubSettings({
      ...clubSettings,
      clubName: clubName.trim(),
      clubNameBangla: clubNameBangla.trim() || clubName.trim(),
      location: location.trim(),
      established: established.trim(),
      sportType,
      collectionFrequency,
      defaultWeeklyFee: Number(defaultWeeklyFee) || 350,
      defaultMonthlyFee: Number(defaultMonthlyFee) || 1400,
      defaultMonthlySavings: Number(defaultMonthlySavings) || 500,
      messengerLink: messengerLink.trim(),
      logoUrl: logoUrl.trim(),
    });

    setSavedClub(true);
    setTimeout(() => setSavedClub(false), 2500);
  };

  const handleInlinePinChange = (e: React.FormEvent) => {
    e.preventDefault();
    setPinChangeError(null);
    setPinChangeSuccess(false);

    const actualSavedPin = loadAdminPassword();
    if (!isAdmin) {
      const isCurrentValid =
        currentPinInput.trim() === actualSavedPin ||
        (actualSavedPin === '1234' && (currentPinInput.trim() === 'admin' || currentPinInput.trim() === '1234'));
      if (!isCurrentValid) {
        setPinChangeError(isBangla ? 'বর্তমান পিনটি সঠিক নয়! ডিফল্ট পিন: 1234' : 'Current PIN is incorrect! Default is 1234');
        return;
      }
    }

    if (!newPinInput.trim() || newPinInput.trim().length < 4) {
      setPinChangeError(isBangla ? 'নতুন পিন কমপক্ষে ৪ সংখ্যার বা অক্ষরের হতে হবে।' : 'New PIN must be at least 4 characters/digits.');
      return;
    }

    if (newPinInput.trim() !== confirmPinInput.trim()) {
      setPinChangeError(isBangla ? 'নতুন পিন ও কনফার্ম পিন মেলেনি!' : 'New PIN and Confirm PIN do not match!');
      return;
    }

    saveAdminPassword(newPinInput.trim());
    setSavedPinDisplay(newPinInput.trim());
    setPinChangeSuccess(true);
    setCurrentPinInput('');
    setNewPinInput('');
    setConfirmPinInput('');
    setTimeout(() => setPinChangeSuccess(false), 4000);
  };

  const handleShareLink = () => {
    const url = getPublicShareUrl();
    if (navigator.share) {
      navigator
        .share({
          title: t.app_title,
          text: isBangla
            ? 'আমাদের ব্যাডমিন্টন ক্লাবের লাইভ চাঁদা ও খরচের ফান্ড ড্যাশবোর্ড দেখুন'
            : 'Access our Badminton Club live Fund Manager dashboard',
          url,
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleExportDataJson = () => {
    try {
      const data = loadData();
      const admin = loadAdminProfile();
      const backupPayload = {
        exportedAt: new Date().toISOString(),
        version: '1.0.0',
        clubSettings,
        adminProfile: admin,
        ...data,
      };
      const jsonString = JSON.stringify(backupPayload, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `club_fund_backup_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setExportedSuccess(true);
      setTimeout(() => setExportedSuccess(false), 4000);
    } catch (e) {
      console.error('Failed to export data JSON:', e);
    }
  };

  return (
    <div className="space-y-4 pb-24">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
          {t.settings_title}
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {isBangla
            ? 'ভাষা, ডার্ক মোড, অ্যাডমিন ভূমিকা ও সিস্টেম সেটিংস'
            : 'Language, theme, user role privileges, and database controls'}
        </p>
      </div>

      <div className="space-y-3">
        {/* App Creator & Admin Profile Card */}
        {onOpenAdminProfile && (
          <div className="rounded-3xl bg-gradient-to-r from-emerald-50 via-teal-50 to-amber-50 dark:from-emerald-950/40 dark:via-teal-950/30 dark:to-amber-950/20 p-5 border border-emerald-200/80 dark:border-emerald-800/60 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 text-center sm:text-left">
              <div className="relative shrink-0 group">
                <div
                  onClick={() => {
                    if (adminProfile?.photoUrl || (adminProfile?.photos && adminProfile.photos.length > 0)) {
                      setIsPhotoLightboxOpen(true);
                    } else {
                      onOpenAdminProfile();
                    }
                  }}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-white dark:bg-slate-900 border-2 border-emerald-500 shadow-lg p-0.5 flex items-center justify-center cursor-pointer transition-transform hover:scale-105 active:scale-95 relative"
                  title={isBangla ? 'ক্লিক করে পুরো ছবি বড় আকারে দেখুন' : 'Click to view full photo'}
                >
                  {adminProfile?.photoUrl ? (
                    <img
                      src={adminProfile.photoUrl}
                      alt={adminProfile.name}
                      className="w-full h-full object-cover rounded-xl"
                    />
                  ) : (
                    <div className="w-full h-full rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-700 text-white flex items-center justify-center text-2xl font-black">
                      👑
                    </div>
                  )}

                  {adminProfile?.photoUrl && (
                    <div className="absolute inset-0.5 rounded-xl bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                      <Maximize2 className="w-4 h-4 text-emerald-300" />
                    </div>
                  )}
                </div>
                <span className="absolute -bottom-1 -right-1 bg-amber-500 text-white text-[9px] font-black px-1.5 py-0.2 rounded-full shadow border border-white">
                  👑
                </span>
              </div>
              <div>
                <div className="flex items-center gap-2 justify-center sm:justify-start flex-wrap">
                  <h4 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                    {adminProfile
                      ? isBangla && adminProfile.banglaName
                        ? adminProfile.banglaName
                        : adminProfile.name
                      : 'অ্যাডমিন প্রোফাইল'}
                  </h4>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500 text-white">
                    {adminProfile?.designation || 'প্রধান অ্যাডমিন'}
                  </span>
                  {adminProfile?.photos && adminProfile.photos.length > 1 && (
                    <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/80 px-2 py-0.5 rounded-full">
                      {adminProfile.photos.length} {isBangla ? 'টি ছবি' : 'Photos'}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 max-w-md">
                  {isBangla
                    ? 'আপনার ছবিসমূহ, বায়ো, পদবি ও সোশ্যাল মিডিয়া লিংক ম্যানেজ করুন।'
                    : 'Manage creator identity, multiple photos, bio, and social connections.'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onOpenAdminProfile}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition-all active:scale-95 whitespace-nowrap"
            >
              <span>👑</span>
              <span>{isBangla ? 'অ্যাডমিন পরিচিতি দেখুন ও এডিট করুন' : 'View / Edit Admin Profile'}</span>
            </button>
          </div>
        )}

        {/* Club Name & Info Card */}
        <div className="rounded-2xl bg-white dark:bg-slate-900 p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                  {isBangla ? 'ক্লাবের নাম ও প্রোফাইল' : 'Club Name & Profile'}
                </h4>
                <p className="text-xs text-slate-400">
                  {isBangla
                    ? 'ক্লাবের নাম পরিবর্তন করুন ও অ্যাপ জুড়ে প্রদর্শন আপডেট করুন'
                    : 'Change club name and banner identity across the whole app'}
                </p>
              </div>
            </div>

            {isAdmin && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                {isBangla ? 'সম্পাদনাযোগ্য' : 'Editable'}
              </span>
            )}
          </div>

          <form onSubmit={handleSaveClub} className="space-y-4">
            {/* Club Logo Upload Section */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 flex flex-col sm:flex-row items-center gap-4">
              <div className="relative shrink-0">
                {logoUrl ? (
                  <div className="w-20 h-20 rounded-2xl bg-white dark:bg-slate-900 border-2 border-emerald-500 shadow-md p-1 flex items-center justify-center overflow-hidden">
                    <img
                      src={logoUrl}
                      alt="Club Logo"
                      className="w-full h-full object-contain rounded-xl"
                    />
                  </div>
                ) : (
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white flex items-center justify-center text-3xl shadow-md shadow-emerald-500/20 font-black">
                    🏸
                  </div>
                )}
                {isAdmin && logoUrl && (
                  <button
                    type="button"
                    onClick={() => setLogoUrl('')}
                    title={isBangla ? 'লোগো সরান' : 'Remove Logo'}
                    className="absolute -top-2 -right-2 p-1 rounded-full bg-rose-500 text-white hover:bg-rose-600 shadow-sm transition-transform active:scale-95"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="flex-1 text-center sm:text-left space-y-2">
                <div>
                  <h4 className="text-xs font-black text-slate-800 dark:text-slate-200">
                    {isBangla ? 'ক্লাবের অফিসিয়াল লোগো (Club Official Logo)' : 'Club Official Logo'}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {isBangla
                      ? 'লোগোটি অ্যাপের মেনুবার, ড্যাশবোর্ড এবং টাকা জমার অফিসিয়াল রসিদে স্বয়ংক্রিয়ভাবে প্রদর্শিত হবে।'
                      : 'Logo automatically appears on navbar, dashboard banner, and money receipts.'}
                  </p>
                </div>

                {isAdmin ? (
                  <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
                    <label className="cursor-pointer px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all active:scale-95">
                      <Upload className="w-3.5 h-3.5" />
                      <span>{isBangla ? 'লোগো বা ছবি সিলেক্ট করুন (Phone/PC)' : 'Upload Logo / Photo'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleLogoFileUpload}
                      />
                    </label>

                    {logoUrl && (
                      <button
                        type="button"
                        onClick={() => setLogoUrl('')}
                        className="px-3 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors"
                      >
                        {isBangla ? 'লোগো রিসেট' : 'Reset Logo'}
                      </button>
                    )}
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={onOpenPinModal}
                    className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
                  >
                    <span>🔒</span>
                    <span>{isBangla ? 'লোগো আপলোড করতে অ্যাডমিন লগইন করুন' : 'Login as Admin to Upload Logo'}</span>
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  {isBangla ? 'ক্লাবের নাম (English)' : 'Club Name (English)'} *
                </label>
                <input
                  type="text"
                  disabled={!isAdmin}
                  required
                  value={clubName}
                  onChange={(e) => setClubName(e.target.value)}
                  placeholder="e.g. Smashers Badminton Club"
                  className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border-0 text-xs focus:ring-2 focus:ring-emerald-500 disabled:opacity-75"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  {isBangla ? 'ক্লাবের নাম (বাংলা)' : 'Club Name (Bengali)'}
                </label>
                <input
                  type="text"
                  disabled={!isAdmin}
                  value={clubNameBangla}
                  onChange={(e) => setClubNameBangla(e.target.value)}
                  placeholder="যেমন: স্ম্যাশার্স ব্যাডমিন্টন ক্লাব"
                  className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border-0 text-xs focus:ring-2 focus:ring-emerald-500 disabled:opacity-75"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  {isBangla ? 'ঠিকানা / এলাকা' : 'Location / Area'}
                </label>
                <input
                  type="text"
                  disabled={!isAdmin}
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Dhaka, Bangladesh"
                  className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border-0 text-xs focus:ring-2 focus:ring-emerald-500 disabled:opacity-75"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  {isBangla ? 'প্রতিষ্ঠিত সাল' : 'Established Year'}
                </label>
                <input
                  type="text"
                  disabled={!isAdmin}
                  value={established}
                  onChange={(e) => setEstablished(e.target.value)}
                  placeholder="2024"
                  className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border-0 text-xs focus:ring-2 focus:ring-emerald-500 disabled:opacity-75"
                />
              </div>
            </div>

            {/* Sport Category Configuration */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                {isBangla ? 'ক্লাবের প্রধান খেলা (Sport Type)' : 'Primary Club Sport Type'}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(['multi', 'badminton', 'cricket', 'football'] as SportType[]).map((st) => {
                  const meta = SPORTS_MAP[st];
                  const isSelected = sportType === st;
                  return (
                    <button
                      key={st}
                      type="button"
                      disabled={!isAdmin}
                      onClick={() => setSportType(st)}
                      className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center gap-1 ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-extrabold shadow-sm'
                          : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <span className="text-xl">{meta.emoji}</span>
                      <span className="text-xs">{isBangla ? meta.nameBangla : meta.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Collection Frequency & Fees Configuration */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                {isBangla ? 'চাঁদা ও সঞ্চয় সংগ্রহের ধরন (Frequency)' : 'Contribution Frequency'}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { key: 'both' as const, labelEn: 'Weekly & Monthly', labelBn: 'সাপ্তাহিক ও মাসিক সঞ্চয়' },
                  { key: 'weekly' as const, labelEn: 'Weekly Only', labelBn: 'শুধু সাপ্তাহিক' },
                  { key: 'monthly' as const, labelEn: 'Monthly Only', labelBn: 'শুধু মাসিক' },
                ].map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    disabled={!isAdmin}
                    onClick={() => setCollectionFrequency(item.key)}
                    className={`py-2 px-2 rounded-xl border text-center text-xs font-bold transition-all ${
                      collectionFrequency === item.key
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {isBangla ? item.labelBn : item.labelEn}
                  </button>
                ))}
              </div>

              {/* Default Fee Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                    {isBangla ? 'ডিফল্ট সাপ্তাহিক ফি (৳)' : 'Default Weekly Fee (৳)'}
                  </label>
                  <input
                    type="number"
                    disabled={!isAdmin}
                    value={defaultWeeklyFee}
                    onChange={(e) => setDefaultWeeklyFee(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border-0 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                    {isBangla ? 'ডিফল্ট মাসিক ফি (৳)' : 'Default Monthly Fee (৳)'}
                  </label>
                  <input
                    type="number"
                    disabled={!isAdmin}
                    value={defaultMonthlyFee}
                    onChange={(e) => setDefaultMonthlyFee(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border-0 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                    {isBangla ? 'ডিফল্ট মাসিক সঞ্চয় / Sonsoy (৳)' : 'Default Monthly Savings (৳)'}
                  </label>
                  <input
                    type="number"
                    disabled={!isAdmin}
                    value={defaultMonthlySavings}
                    onChange={(e) => setDefaultMonthlySavings(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border-0 text-xs font-bold text-emerald-600"
                  />
                </div>

                {/* Facebook Messenger Group / Chat Link */}
                <div className="md:col-span-2">
                  <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                    {isBangla ? 'ক্লাবের ফেসবুক মেসেঞ্জার লিংক / গ্রুপ চ্যাট (Messenger Connect)' : 'Club Facebook Messenger Group / Chat Link'}
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      disabled={!isAdmin}
                      value={messengerLink}
                      onChange={(e) => setMessengerLink(e.target.value)}
                      placeholder={isBangla ? 'https://m.me/yourclub বা মেসেঞ্জার লিংক' : 'https://m.me/yourclub or group link'}
                      className="flex-1 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border-0 text-xs font-medium focus:ring-2 focus:ring-emerald-500"
                    />
                    {messengerLink && (
                      <a
                        href={messengerLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1 shrink-0 transition-colors shadow-sm"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>{isBangla ? 'টেস্ট লিংক' : 'Open'}</span>
                      </a>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    {isBangla
                      ? '💡 এখানে ক্লাবের মেসেঞ্জার লিংক দিলে মেম্বাররা উপরের মেসেঞ্জার আইকনে চাপ দিয়ে সরাসরি যোগাযোগ করতে পারবে।'
                      : '💡 Provide club Messenger page or group link for instant member connection.'}
                  </p>
                </div>
              </div>
            </div>

            {isAdmin ? (
              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-slate-400">
                  {savedClub ? (
                    <span className="text-emerald-600 font-bold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" />
                      {isBangla ? 'ক্লাবের তথ্য সফলভাবে সংরক্ষিত হয়েছে!' : 'Club info updated successfully!'}
                    </span>
                  ) : (
                    isBangla ? 'পরিবর্তন সেভ করতে পাশের বাটনে চাপুন' : 'Click save to apply changes'
                  )}
                </span>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm shadow-emerald-600/20 transition-all"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isBangla ? 'সেভ করুন' : 'Save Club Info'}</span>
                </button>
              </div>
            ) : (
              <p className="text-[11px] text-slate-400 italic">
                {isBangla
                  ? '🔒 ক্লাবের নাম ও ফি পরিবর্তনের জন্য অ্যাডমিন পিন দিয়ে আনলক করুন'
                  : '🔒 Unlock Admin Mode to change club settings'}
              </p>
            )}
          </form>
        </div>

        {/* User Role & Admin Security Card */}
        <div className="rounded-2xl bg-white dark:bg-slate-900 p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className={`p-3 rounded-2xl ${isAdmin ? 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400' : 'bg-amber-100 dark:bg-amber-950/70 text-amber-600 dark:text-amber-400'}`}>
                {isAdmin ? <ShieldCheck className="w-6 h-6" /> : <Eye className="w-6 h-6" />}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-black text-base text-slate-900 dark:text-white">
                    {isAdmin ? (isBangla ? '👑 অ্যাডমিন মোড (সক্রিয়)' : '👑 Admin Mode (Active)') : (isBangla ? '🔒 ভিউয়ার মোড (সাধারণ সদস্য)' : '🔒 Viewer Mode (Member View)')}
                  </h4>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${isAdmin ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'}`}>
                    {isAdmin ? 'Admin' : 'Viewer'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {isAdmin
                    ? (isBangla ? 'আপনি ক্লাবের সমস্ত আর্থিক হিসাব, খরচ, মেম্বার ও টুর্নামেন্ট সম্পাদনা করতে পারছেন।' : 'You have full permission to add/edit records, members, and expenses.')
                    : (isBangla ? 'সাধারণ সদস্যরা শুধু দেখতে পারবেন। কোনো হিসাব পরিবর্তন করতে অ্যাডমিন পাসওয়ার্ড দিয়ে লগইন করুন।' : 'General members are restricted to view-only. Admin password required to make changes.')}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {isAdmin ? (
                <>
                  {onOpenChangePassword && (
                    <button
                      type="button"
                      onClick={onOpenChangePassword}
                      className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center gap-1.5 transition-colors border border-slate-200 dark:border-slate-700"
                    >
                      <KeyRound className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>{isBangla ? 'পাসওয়ার্ড পরিবর্তন' : 'Change Password'}</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={onToggleAdmin}
                    className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/50 dark:hover:bg-rose-900 text-rose-700 dark:text-rose-300 font-bold text-xs flex items-center gap-1.5 transition-colors"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>{isBangla ? 'লক / ভিউয়ার মোড' : 'Lock Admin Mode'}</span>
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={onOpenPinModal}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-emerald-600/20 transition-all"
                >
                  <KeyRound className="w-4 h-4" />
                  <span>{isBangla ? 'অ্যাডমিন লগইন' : 'Admin Login'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Security Guarantee Note */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 flex items-start gap-2.5">
            <span className="text-base">🛡️</span>
            <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
              <p className="font-semibold text-slate-800 dark:text-slate-200">
                {isBangla ? 'সদস্যদের সুরক্ষা ও ডেটা নিরাপত্তা গ্যারান্টি:' : 'Security & Member Restrictions:'}
              </p>
              <p>
                {isBangla
                  ? 'সাধারণ সদস্যরা অ্যাপের লিংক খুললে শুধুমাত্র "ভিউয়ার মোডে" থাকবে। অ্যাডমিন পাসওয়ার্ড ছাড়া মেম্বাররা কোনো আর্থিক তথ্য, খরচ বা পেমেন্ট পরিবর্তন করতে পারবে না।'
                  : 'When members open the shared app, they are strictly in read-only mode. Financial records cannot be altered without the admin security key.'}
              </p>
            </div>
          </div>
        </div>

        {/* Dedicated Admin Password Change Card (Inline Form) */}
        <div className="rounded-2xl bg-white dark:bg-slate-900 p-5 sm:p-6 border border-emerald-200/90 dark:border-emerald-900/40 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3.5">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white shadow-md shadow-emerald-500/20 shrink-0">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-black text-sm sm:text-base text-slate-900 dark:text-white">
                    {isBangla ? 'অ্যাডমিন সিকিউরিটি PIN / পাসওয়ার্ড পরিবর্তন' : 'Change Admin Security PIN / Password'}
                  </h4>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                    {isBangla ? 'সুরক্ষিত' : 'Secured'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {isBangla
                    ? 'ক্লাবের ডাটা এডিট ও অ্যাডমিন লক সুরক্ষিত রাখতে আপনার নিজস্ব ৪ সংখ্যার PIN সেট করুন।'
                    : 'Set a custom 4-digit PIN to secure administrative privileges.'}
                </p>
              </div>
            </div>

            {isAdmin && (
              <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl self-start sm:self-auto border border-slate-200 dark:border-slate-700">
                {isBangla ? 'বর্তমান পিন: ' : 'Current PIN: '}
                <span className="text-emerald-600 dark:text-emerald-400 font-black">
                  {showCurrentPin ? savedPinDisplay : '••••'}
                </span>
                <button
                  type="button"
                  onClick={() => setShowCurrentPin(!showCurrentPin)}
                  className="ml-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 align-middle"
                >
                  {showCurrentPin ? <EyeOff className="w-3.5 h-3.5 inline" /> : <Eye className="w-3.5 h-3.5 inline" />}
                </button>
              </span>
            )}
          </div>

          {/* Feedback messages */}
          {pinChangeSuccess && (
            <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 flex items-center gap-2 text-xs text-emerald-800 dark:text-emerald-200 font-bold animate-fadeIn">
              <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>
                {isBangla
                  ? `🎉 আপনার নতুন অ্যাডমিন PIN (${savedPinDisplay}) সফলভাবে সংরক্ষিত হয়েছে!`
                  : `🎉 Admin PIN successfully updated to (${savedPinDisplay})!`}
              </span>
            </div>
          )}

          {pinChangeError && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800 flex items-center gap-2 text-xs text-rose-800 dark:text-rose-200 font-bold animate-shake">
              <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
              <span>{pinChangeError}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleInlinePinChange} className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-3">
            <div className={`grid grid-cols-1 ${!isAdmin ? 'sm:grid-cols-3' : 'sm:grid-cols-2'} gap-3`}>
              {!isAdmin && (
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    {isBangla ? '১. বর্তমান পাসওয়ার্ড দিন *' : '1. Current Password *'}
                  </label>
                  <input
                    type="password"
                    required
                    value={currentPinInput}
                    onChange={(e) => setCurrentPinInput(e.target.value)}
                    placeholder={isBangla ? 'ডিফল্ট: 1234' : 'Default: 1234'}
                    className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border-0 text-xs font-mono focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  {isBangla ? 'নতুন ৪ সংখ্যার PIN লিখুন *' : 'New 4-digit PIN *'}
                </label>
                <div className="relative">
                  <input
                    type={showNewPin ? 'text' : 'password'}
                    required
                    value={newPinInput}
                    onChange={(e) => setNewPinInput(e.target.value)}
                    placeholder={isBangla ? 'যেমন: 5678' : 'e.g. 5678'}
                    className="w-full px-3 py-2 pr-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border-0 text-xs font-mono focus:ring-2 focus:ring-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPin(!showNewPin)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {showNewPin ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  {isBangla ? 'নতুন PIN নিশ্চিত করুন *' : 'Confirm New PIN *'}
                </label>
                <input
                  type="password"
                  required
                  value={confirmPinInput}
                  onChange={(e) => setConfirmPinInput(e.target.value)}
                  placeholder={isBangla ? 'নতুন পিন পুনরায় লিখুন' : 'Re-type new PIN'}
                  className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border-0 text-xs font-mono focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              <span className="text-[11px] text-slate-400">
                {isBangla ? '💡 নতুন পাসওয়ার্ড কমপক্ষে ৪ অক্ষরের বা সংখ্যার হতে হবে।' : '💡 Password must be at least 4 characters long.'}
              </span>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all shrink-0 active:scale-95"
              >
                <KeyRound className="w-4 h-4" />
                <span>{isBangla ? 'নতুন PIN সেভ করুন' : 'Save New PIN'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Language Preference Card */}
        <div className="rounded-2xl bg-white dark:bg-slate-900 p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <Languages className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                {t.lang_toggle}
              </h4>
              <p className="text-xs text-slate-400">
                {isBangla ? 'বর্তমানে বাংলা ভাষা সক্রিয়' : 'English language currently active'}
              </p>
            </div>
          </div>

          <button
            onClick={onToggleLang}
            className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-bold text-xs transition-colors"
          >
            {lang === 'bn' ? 'Switch to English' : 'বাংলায় দেখুন'}
          </button>
        </div>

        {/* Theme Preference Card */}
        <div className="rounded-2xl bg-white dark:bg-slate-900 p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </div>
            <div>
              <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                {t.dark_mode}
              </h4>
              <p className="text-xs text-slate-400">
                {isDark
                  ? (isBangla ? 'ডার্ক মোড সক্রিয়' : 'Dark theme active')
                  : (isBangla ? 'লাইট মোড সক্রিয়' : 'Light theme active')}
              </p>
            </div>
          </div>

          <button
            onClick={onToggleDark}
            className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
              isDark ? 'bg-emerald-600 justify-end' : 'bg-slate-300 justify-start'
            }`}
          >
            <div className="w-4 h-4 rounded-full bg-white shadow-md" />
          </button>
        </div>

        {/* Firebase Console & Cloud Database Card (Admin Only) */}
        {isAdmin && (
          <div className="rounded-2xl bg-white dark:bg-slate-900 p-5 border border-amber-200/90 dark:border-amber-900/40 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
                <Flame className="w-5 h-5 fill-amber-500 text-amber-500" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                    {isBangla ? 'Firebase কনসোল ও ক্লাউড ডাটাবেস' : 'Firebase Console & Cloud Sync'}
                  </h4>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isFirebaseConfigured()
                        ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {isFirebaseConfigured()
                      ? isBangla
                        ? 'কানেক্টেড'
                        : 'Connected'
                      : isBangla
                      ? 'ডিসকানেক্টেড'
                      : 'Not Connected'}
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  {isBangla
                    ? 'গুগল ফায়ারস্টোর লাইভ সিঙ্ক, রিয়েল-টাইম ডাটা ব্যাকআপ ও ক্লাউড সংযোগ'
                    : 'Google Firestore live sync, real-time multi-user backup & cloud connection'}
                </p>
              </div>
            </div>

            <button
              onClick={onOpenFirebaseModal}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-sm"
            >
              <Database className="w-3.5 h-3.5" />
              <span>
                {isFirebaseConfigured()
                  ? isBangla
                    ? 'ম্যানেজ / সিঙ্ক'
                    : 'Manage / Sync'
                  : isBangla
                  ? 'কানেক্ট ফায়ারবেস'
                  : 'Connect Firebase'}
              </span>
            </button>
          </div>
        )}

        {/* Share Live Dashboard Link */}
        <div className="rounded-2xl bg-white dark:bg-slate-900 p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                {t.shared_link}
              </h4>
              <p className="text-xs text-slate-400">{t.shared_link_desc}</p>
            </div>
          </div>

          <button
            onClick={handleShareLink}
            className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors flex items-center gap-1 shadow-sm"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>{isBangla ? 'কপি হয়েছে' : 'Copied'}</span>
              </>
            ) : (
              <span>{isBangla ? 'লিংক শেয়ার' : 'Share Link'}</span>
            )}
          </button>
        </div>

        {/* Reset Demo Data (Admin Only) */}
        {isAdmin && (
          <div className="rounded-2xl bg-white dark:bg-slate-900 p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
                <RefreshCw className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                  {t.reset_data}
                </h4>
                <p className="text-xs text-slate-400">{t.reset_desc}</p>
              </div>
            </div>

            <button
              onClick={() => {
                if (
                  confirm(
                    isBangla
                      ? 'আপনি কি নিশ্চিতভাবে নমুনা ডেটাসেট পুনরায় লোড করতে চান?'
                      : 'Reload sample club database?'
                  )
                ) {
                  onResetDemo();
                }
              }}
              className="px-3.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 dark:hover:bg-rose-900 text-rose-600 dark:text-rose-300 font-bold text-xs transition-colors"
            >
              {isBangla ? 'রিসেট' : 'Reset'}
            </button>
          </div>
        )}

        {/* Export Club Database Backup Card */}
        <div className="rounded-2xl bg-white dark:bg-slate-900 p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                {isBangla ? 'ক্লাব ডেটা ব্যাকআপ ও এক্সপোর্ট (JSON)' : 'Club Database Backup & Export (JSON)'}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isBangla
                  ? 'সমস্ত সদস্য, চাঁদা, খরচ, টুর্নামেন্ট ও অ্যাডমিন প্রোফাইলের পূর্ণাঙ্গ ব্যাকআপ ডাউনলোড করুন।'
                  : 'Download complete offline backup file of all members, fees, expenses, and records.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-stretch sm:self-auto">
            {exportedSuccess && (
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 animate-fadeIn">
                <Check className="w-4 h-4" />
                <span>{isBangla ? 'ডাউনলোড সম্পন্ন!' : 'Downloaded!'}</span>
              </span>
            )}
            <button
              type="button"
              onClick={handleExportDataJson}
              className="w-full sm:w-auto px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-95 whitespace-nowrap"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isBangla ? 'ডেটা ব্যাকআপ ডাউনলোড' : 'Download Backup JSON'}</span>
            </button>
          </div>
        </div>

        {/* AI Studio ZIP Download Troubleshooting Card */}
        <div className="rounded-2xl bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent dark:from-amber-950/30 dark:via-slate-900 dark:to-slate-900 p-5 border border-amber-300/60 dark:border-amber-800/50 shadow-sm space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500 text-white shadow-sm">
              <FileArchive className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-black text-xs sm:text-sm text-slate-900 dark:text-white">
                {isBangla ? '💡 কোড থেকে ZIP ফাইল ডাউনলোড না হওয়ার কারণ ও সমাধান' : '💡 Why ZIP Export might not download & Solutions'}
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {isBangla ? 'AI Studio থেকে জিপ ডাউনলোড করার সহজ সমাধান' : 'Quick troubleshooting for downloading ZIP in AI Studio'}
              </p>
            </div>
          </div>

          <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300 bg-white/70 dark:bg-slate-800/60 p-3.5 rounded-xl border border-amber-200/60 dark:border-amber-900/40">
            <div className="flex items-start gap-2">
              <span className="font-bold text-amber-600 shrink-0">১.</span>
              <p>
                <strong>{isBangla ? 'ব্রাউজারে Pop-up বা ডাউনলোড ব্লক:' : 'Browser Pop-up / Download Blocked:'}</strong>{' '}
                {isBangla
                  ? 'ব্রাউজারের অ্যাড্রেস বারের (URL bar) একেবারে ডানপাশে একটি লাল ক্রস দেওয়া ছোট আইকন (Pop-up blocked) আছে কিনা দেখুন। থাকলে সেটিতে ক্লিক করে "Always allow pop-ups and downloads" সিলেক্ট করে Done করুন।'
                  : 'Look at the far right of your browser address bar for a small red pop-up blocked icon. Click it and select "Always allow pop-ups and downloads".'}
              </p>
            </div>

            <div className="flex items-start gap-2">
              <span className="font-bold text-amber-600 shrink-0">২.</span>
              <p>
                <strong>{isBangla ? 'জিপ তৈরির সময়:' : 'Packaging Delay:'}</strong>{' '}
                {isBangla
                  ? 'Export as ZIP বাটনে ক্লিক করার পর সিস্টেম পুরো প্রোজেক্ট জিপ করতে ৩-১০ সেকেন্ড সময় নেয়। ক্লিক করার পর পেজ রিলোড না করে কয়েক সেকেন্ড অপেক্ষা করুন।'
                  : 'Packaging takes 3 to 10 seconds. Wait a few seconds after clicking before refreshing.'}
              </p>
            </div>

            <div className="flex items-start gap-2">
              <span className="font-bold text-amber-600 shrink-0">৩.</span>
              <p>
                <strong>{isBangla ? 'উপরের মেনু থেকে ডাউনলোড:' : 'Top Header Export Menu:'}</strong>{' '}
                {isBangla
                  ? 'AI Studio-র উপরের ডান কোনায় থ্রি-ডট (⋮) মেনু অথবা "Export" বাটনে ক্লিক করে "Download ZIP" চাপুন।'
                  : 'Click the top right three-dot menu (⋮) or Export button and select Download ZIP.'}
              </p>
            </div>

            <div className="flex items-start gap-2">
              <span className="font-bold text-amber-600 shrink-0">৪.</span>
              <p>
                <strong>{isBangla ? 'GitHub Push (সবচেয়ে সুবিধাজনক):' : 'GitHub Push (Recommended):'}</strong>{' '}
                {isBangla
                  ? 'বারবার ম্যানুয়ালি জিপ ডাউনলোড ও আপলোড না করে সরাসরি "Export to GitHub" ব্যবহার করে GitHub-এ পুশ করতে পারেন, যা নেটলিফাইতে অটোমেটিক বিল্ড হয়ে যায়।'
                  : 'You can export directly to GitHub via "Export to GitHub" for automated Netlify continuous deployment.'}
              </p>
            </div>
          </div>
        </div>

        {/* About App Banner */}
        <div className="rounded-2xl bg-slate-100/70 dark:bg-slate-800/40 p-5 text-center space-y-1">
          <span className="text-2xl">🏸</span>
          <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
            {t.app_title}
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {t.club_subtitle} • v1.0.0
          </p>
          <p className="text-[11px] text-slate-400">
            {isBangla
              ? 'মুদ্রা: বাংলাদেশী টাকা (৳) | ফরম্যাট: DD/MM/YYYY | রিয়েল-টাইম ক্লাউড সিঙ্ক'
              : 'Currency: Bangladeshi Taka (৳) | Date: DD/MM/YYYY | Multi-client broadcast sync'}
          </p>
        </div>
      </div>

      {/* Admin Photo Fullscreen Lightbox */}
      {adminProfile && (
        <ImageLightboxModal
          isOpen={isPhotoLightboxOpen}
          onClose={() => setIsPhotoLightboxOpen(false)}
          images={
            adminProfile.photos && adminProfile.photos.length > 0
              ? adminProfile.photos
              : adminProfile.photoUrl
              ? [adminProfile.photoUrl]
              : []
          }
          title={isBangla && adminProfile.banglaName ? adminProfile.banglaName : adminProfile.name}
          subtitle={adminProfile.designation || (isBangla ? 'অ্যাপ প্রতিষ্ঠাতা ও প্রধান অ্যাডমিন' : 'Admin & Founder')}
          lang={lang}
        />
      )}
    </div>
  );
};

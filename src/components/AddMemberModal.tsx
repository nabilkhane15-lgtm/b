import React, { useState, useRef, useMemo } from 'react';
import { Member, Role, SportType, ContributionType, MemberCategory } from '../types';
import { translations, Language } from '../utils/language';
import { SPORTS_MAP } from '../utils/sports';
import { X, UserPlus, CheckSquare, Square, Camera } from 'lucide-react';
import { processImageFile, DEFAULT_AVATARS } from '../utils/imageUtils';

interface Props {
  lang: Language;
  onSave: (member: Omit<Member, 'id'>) => void;
  onClose: () => void;
  existingMembers?: Member[];
}

export const AddMemberModal: React.FC<Props> = ({ lang, onSave, onClose, existingMembers = [] }) => {
  const t = translations[lang];
  const isBangla = lang === 'bn';

  // Compute next available 4-digit memberCode
  const suggestedCode = useMemo(() => {
    let maxNum = 1000;
    existingMembers.forEach((m) => {
      const num = parseInt(m.memberCode, 10);
      if (!isNaN(num) && num > maxNum) maxNum = num;
    });
    return (maxNum + 1).toString();
  }, [existingMembers]);

  const [memberCode, setMemberCode] = useState(suggestedCode);
  const [avatar, setAvatar] = useState<string | undefined>(undefined);
  const [name, setName] = useState('');
  const [banglaName, setBanglaName] = useState('');
  const [phone, setPhone] = useState('+880');
  const [weeklyAmount, setWeeklyAmount] = useState<number>(350);
  const [monthlyAmount, setMonthlyAmount] = useState<number>(1400);
  const [role, setRole] = useState<Role>('Member');
  const [preferredSport, setPreferredSport] = useState<SportType>('badminton');
  const [contributionType, setContributionType] = useState<ContributionType>('weekly');
  const [joiningDate, setJoiningDate] = useState(new Date().toLocaleDateString('en-GB'));
  const [memberCategory, setMemberCategory] = useState<MemberCategory>('youth');
  const [participatesInSports, setParticipatesInSports] = useState<boolean>(true);
  const [idError, setIdError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressed = await processImageFile(file, 280, 280, 0.75);
        setAvatar(compressed);
      } catch (err) {
        console.error('Failed to compress avatar', err);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    // Validate 4-digit code
    const cleanCode = memberCode.trim();
    if (!/^\d{4}$/.test(cleanCode)) {
      setIdError(isBangla ? 'আইডি অবশ্যই ঠিক ৪ সংখ্যার হতে হবে (যেমন: 1013)' : 'ID must be exactly 4 digits');
      return;
    }

    // Check uniqueness
    const duplicate = existingMembers.find((m) => m.memberCode === cleanCode);
    if (duplicate) {
      setIdError(isBangla ? `আইডি #${cleanCode} ইতিপূর্বে ${duplicate.banglaName || duplicate.name} এর জন্য নির্ধারিত আছে` : `ID #${cleanCode} is already assigned`);
      return;
    }

    onSave({
      memberCode: cleanCode,
      avatar,
      name: name.trim(),
      banglaName: banglaName.trim() || undefined,
      phone: phone.trim() || '+880',
      weeklyAmount: participatesInSports ? Number(weeklyAmount) || 0 : 0,
      monthlyAmount: participatesInSports && contributionType !== 'weekly' ? Number(monthlyAmount) || 0 : undefined,
      role,
      preferredSport,
      contributionType,
      memberCategory,
      participatesInSports,
      joiningDate: joiningDate || new Date().toLocaleDateString('en-GB'),
      isActive: true,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800 sticky top-0 bg-white dark:bg-slate-900 z-10">
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-emerald-600" />
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
              {t.add_member}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3.5">
          {/* 4-Digit Member ID Field & Avatar Upload Row */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-cyan-500/10 border border-emerald-500/30 flex items-center gap-4">
            {/* Avatar Preview & Upload */}
            <div className="relative group flex-shrink-0">
              <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-200 dark:bg-slate-800 flex items-center justify-center border-2 border-emerald-500/40 shadow-sm">
                {avatar ? (
                  <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl">
                    {preferredSport === 'badminton'
                      ? '🏸'
                      : preferredSport === 'cricket'
                      ? '🏏'
                      : preferredSport === 'football'
                      ? '⚽'
                      : '🌟'}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-1 -right-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full p-1 shadow transition-transform active:scale-95"
                title="ছবি আপলোড করুন"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarFile}
              />
            </div>

            {/* 4-digit ID input */}
            <div className="flex-1">
              <label className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1 mb-1">
                <span>{isBangla ? '৪ সংখ্যার মেম্বার আইডি' : '4-Digit Member ID'} *</span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-normal">
                  ({isBangla ? 'স্বয়ংক্রিয়ভাবে তৈরি' : 'Auto-generated'})
                </span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 font-mono font-bold text-emerald-600 text-sm">
                  #
                </span>
                <input
                  type="text"
                  maxLength={4}
                  required
                  value={memberCode}
                  onChange={(e) => {
                    setMemberCode(e.target.value.replace(/\D/g, ''));
                    setIdError('');
                  }}
                  className="w-full pl-7 pr-3 py-1.5 rounded-xl border border-emerald-400 dark:border-emerald-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-extrabold text-sm tracking-widest focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  placeholder="1001"
                />
              </div>
              {idError && (
                <p className="text-[11px] text-rose-500 font-semibold mt-1">{idError}</p>
              )}
            </div>
          </div>
          {/* Member Age Category (বাচ্চা, কিশোর, যুবক) */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
              {t.member_category} *
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'child' as const, label: isBangla ? '🧒 বাচ্চা' : '🧒 Child', desc: isBangla ? 'শিশু/জুনিয়র' : 'Junior' },
                { id: 'teen' as const, label: isBangla ? '🧑‍🦱 কিশোর' : '🧑‍🦱 Teen', desc: isBangla ? 'কিশোর' : 'Adolescent' },
                { id: 'youth' as const, label: isBangla ? '👨‍🦱 যুবক' : '👨‍🦱 Youth', desc: isBangla ? 'যুবক/সিনিয়র' : 'Senior' },
              ].map((cat) => (
                <button
                  type="button"
                  key={cat.id}
                  onClick={() => {
                    setMemberCategory(cat.id);
                    if (cat.id === 'child' && weeklyAmount > 200) setWeeklyAmount(200);
                    if (cat.id === 'teen' && weeklyAmount > 300) setWeeklyAmount(300);
                  }}
                  className={`p-2.5 rounded-xl border text-center transition-all ${
                    memberCategory === cat.id
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold ring-2 ring-emerald-500/20 shadow-sm'
                      : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="text-xs font-black">{cat.label}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{cat.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Participates in sports checkbox */}
          <div className="p-3 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-800/60">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={participatesInSports}
                onChange={(e) => setParticipatesInSports(e.target.checked)}
                className="mt-0.5 w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
              />
              <div className="text-xs">
                <span className="font-extrabold text-slate-900 dark:text-white block">
                  {t.participate_sports}
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 block leading-tight">
                  {isBangla
                    ? 'টিক উঠিয়ে দিলে উনি শুধু ক্লাবের সাধারণ ও বিশেষ ফান্ডে অনুদান দেবেন (খেলার কোনো সাপ্তাহিক চাঁদা ধার্য হবে না)'
                    : 'Uncheck if this member only contributes to general/special funds without playing game fees'}
                </span>
              </div>
            </label>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
              {t.member_name} (English) *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Tanvir Ahmed"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
              সদস্যের নাম (বাংলা)
            </label>
            <input
              type="text"
              value={banglaName}
              onChange={(e) => setBanglaName(e.target.value)}
              placeholder="যেমন: তানভীর আহমেদ"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                {t.phone}
              </label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+88017..."
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                {t.weekly_amount} (৳)
              </label>
              <input
                type="number"
                min="0"
                step="50"
                disabled={!participatesInSports}
                required={participatesInSports}
                value={participatesInSports ? weeklyAmount : 0}
                onChange={(e) => setWeeklyAmount(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold font-mono text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none disabled:opacity-50"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                {isBangla ? 'প্রিয় খেলা (Sport)' : 'Preferred Sport'}
              </label>
              <select
                value={preferredSport}
                onChange={(e) => setPreferredSport(e.target.value as SportType)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                <option value="badminton">🏸 ব্যাডমিন্টন (Badminton)</option>
                <option value="cricket">🏏 ক্রিকেট (Cricket)</option>
                <option value="football">⚽ ফুটবল (Football)</option>
                <option value="multi">🏆 সকল খেলা (Multi-Sport)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                {isBangla ? 'চাঁদার ধরন (Plan)' : 'Contribution Plan'}
              </label>
              <select
                disabled={!participatesInSports}
                value={contributionType}
                onChange={(e) => setContributionType(e.target.value as ContributionType)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none disabled:opacity-50"
              >
                <option value="weekly">{isBangla ? 'শুধু সাপ্তাহিক' : 'Weekly'}</option>
                <option value="monthly">{isBangla ? 'শুধু মাসিক' : 'Monthly'}</option>
                <option value="both">{isBangla ? 'সাপ্তাহিক ও মাসিক সঞ্চয়' : 'Weekly & Monthly'}</option>
              </select>
            </div>
          </div>

          {participatesInSports && contributionType !== 'weekly' && (
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                {isBangla ? 'মাসিক চাঁদা বা সঞ্চয় (৳)' : 'Monthly Fee or Savings (৳)'}
              </label>
              <input
                type="number"
                min="0"
                step="50"
                value={monthlyAmount}
                onChange={(e) => setMonthlyAmount(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold font-mono text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                {t.role}
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as Role)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                <option value="Member">Member (সদস্য)</option>
                <option value="Captain">Captain (অধিনায়ক)</option>
                <option value="Treasurer">Treasurer (কোষাধ্যক্ষ)</option>
                <option value="Admin">Admin (ম্যানেজার)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                {t.joining_date}
              </label>
              <input
                type="text"
                value={joiningDate}
                onChange={(e) => setJoiningDate(e.target.value)}
                placeholder="DD/MM/YYYY"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex gap-2 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-500/20"
            >
              {t.save}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


import React, { useState, useRef, useEffect } from 'react';
import { AdminProfile } from '../types';
import { Language } from '../utils/language';
import {
  X,
  ShieldCheck,
  User,
  Phone,
  Mail,
  MapPin,
  Camera,
  Edit3,
  Check,
  Save,
  MessageCircle,
  ExternalLink,
  Sparkles,
  Maximize2,
  Trash2,
  Star,
  Plus,
  ChevronLeft,
  ChevronRight,
  Images,
} from 'lucide-react';
import { processMultipleImageFiles } from '../utils/imageUtils';
import { ImageLightboxModal } from './ImageLightboxModal';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  profile: AdminProfile;
  onSaveProfile: (profile: AdminProfile) => void;
  isAdmin: boolean;
  lang: Language;
}

export const AdminProfileModal: React.FC<Props> = ({
  isOpen,
  onClose,
  profile,
  onSaveProfile,
  isAdmin,
  lang,
}) => {
  const isBangla = lang === 'bn';
  const [isEditing, setIsEditing] = useState(false);

  // Form states
  const [name, setName] = useState(profile.name);
  const [banglaName, setBanglaName] = useState(profile.banglaName || '');
  const [designation, setDesignation] = useState(profile.designation);
  const [bio, setBio] = useState(profile.bio);
  const [photoUrl, setPhotoUrl] = useState(profile.photoUrl || '');
  const [photos, setPhotos] = useState<string[]>([]);
  const [phone, setPhone] = useState(profile.phone || '');
  const [email, setEmail] = useState(profile.email || '');
  const [location, setLocation] = useState(profile.location || '');
  const [facebookUrl, setFacebookUrl] = useState(profile.facebookUrl || '');
  const [messengerUrl, setMessengerUrl] = useState(profile.messengerUrl || '');
  const [whatsappNumber, setWhatsappNumber] = useState(profile.whatsappNumber || '');
  const [youtubeUrl, setYoutubeUrl] = useState(profile.youtubeUrl || '');
  const [linkedinUrl, setLinkedinUrl] = useState(profile.linkedinUrl || '');
  const [instagramUrl, setInstagramUrl] = useState(profile.instagramUrl || '');
  const [websiteUrl, setWebsiteUrl] = useState(profile.websiteUrl || '');

  // UI helpers
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setName(profile.name);
      setBanglaName(profile.banglaName || '');
      setDesignation(profile.designation);
      setBio(profile.bio);
      setPhone(profile.phone || '');
      setEmail(profile.email || '');
      setLocation(profile.location || '');
      setFacebookUrl(profile.facebookUrl || '');
      setMessengerUrl(profile.messengerUrl || '');
      setWhatsappNumber(profile.whatsappNumber || '');
      setYoutubeUrl(profile.youtubeUrl || '');
      setLinkedinUrl(profile.linkedinUrl || '');
      setInstagramUrl(profile.instagramUrl || '');
      setWebsiteUrl(profile.websiteUrl || '');

      // Load photos list
      const loadedPhotos: string[] = [];
      if (profile.photos && profile.photos.length > 0) {
        loadedPhotos.push(...profile.photos);
      }
      if (profile.photoUrl && !loadedPhotos.includes(profile.photoUrl)) {
        loadedPhotos.unshift(profile.photoUrl);
      }
      setPhotos(loadedPhotos);
      setPhotoUrl(profile.photoUrl || loadedPhotos[0] || '');
      setActivePhotoIndex(0);
    }
  }, [isOpen, profile]);

  if (!isOpen) return null;

  // Compute all available photos for display
  const allDisplayPhotos: string[] = photos.length > 0
    ? photos
    : photoUrl
    ? [photoUrl]
    : [];

  const currentDisplayPhoto = allDisplayPhotos[activePhotoIndex] || photoUrl || '';

  const handleMultiplePhotosUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setIsUploading(true);
      try {
        const compressedList = await processMultipleImageFiles(files, 900, 900, 0.82);
        if (compressedList.length > 0) {
          setPhotos((prev) => {
            const nextList = [...prev, ...compressedList];
            if (!photoUrl && nextList.length > 0) {
              setPhotoUrl(nextList[0]);
            }
            return nextList;
          });
        }
      } catch (err) {
        console.error('Failed to process uploaded photos:', err);
      } finally {
        setIsUploading(false);
      }
    }
    if (e.target) e.target.value = '';
  };

  const handleSetPrimary = (index: number) => {
    const target = photos[index];
    if (target) {
      setPhotoUrl(target);
      // Place primary photo at index 0
      const remaining = photos.filter((_, i) => i !== index);
      setPhotos([target, ...remaining]);
      setActivePhotoIndex(0);
    }
  };

  const handleRemovePhoto = (index: number) => {
    const target = photos[index];
    const updated = photos.filter((_, i) => i !== index);
    setPhotos(updated);
    if (photoUrl === target) {
      setPhotoUrl(updated[0] || '');
    }
    if (activePhotoIndex >= updated.length) {
      setActivePhotoIndex(Math.max(0, updated.length - 1));
    }
  };

  const handleOpenLightbox = (index: number) => {
    setLightboxIndex(index);
    setIsLightboxOpen(true);
  };

  const handleNextPhoto = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (allDisplayPhotos.length <= 1) return;
    setActivePhotoIndex((prev) => (prev + 1) % allDisplayPhotos.length);
  };

  const handlePrevPhoto = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (allDisplayPhotos.length <= 1) return;
    setActivePhotoIndex((prev) => (prev - 1 + allDisplayPhotos.length) % allDisplayPhotos.length);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    // Primary photo is photoUrl or the first photo in gallery
    const primary = photoUrl.trim() || photos[0] || undefined;
    const finalPhotos = photos.length > 0 ? photos : primary ? [primary] : undefined;

    const updated: AdminProfile = {
      name: name.trim() || profile.name,
      banglaName: banglaName.trim() || undefined,
      designation: designation.trim() || profile.designation,
      bio: bio.trim() || profile.bio,
      photoUrl: primary,
      photos: finalPhotos,
      phone: phone.trim() || undefined,
      email: email.trim() || undefined,
      location: location.trim() || undefined,
      facebookUrl: facebookUrl.trim() || undefined,
      messengerUrl: messengerUrl.trim() || undefined,
      whatsappNumber: whatsappNumber.trim() || undefined,
      youtubeUrl: youtubeUrl.trim() || undefined,
      linkedinUrl: linkedinUrl.trim() || undefined,
      instagramUrl: instagramUrl.trim() || undefined,
      websiteUrl: websiteUrl.trim() || undefined,
    };

    onSaveProfile(updated);
    setIsEditing(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 sm:p-4 backdrop-blur-sm animate-fadeIn">
        <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 animate-scale-up max-h-[92vh] flex flex-col">
          {/* Header Bar */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-xl">👑</span>
              <div>
                <h3 className="font-black text-sm sm:text-base">
                  {isBangla ? 'অ্যাপ প্রতিষ্ঠাতা ও অ্যাডমিন পরিচিতি' : 'App Founder & Admin Profile'}
                </h3>
                <p className="text-[11px] text-emerald-100">
                  {isBangla ? 'ক্লাব ম্যানেজমেন্ট ও ডেভেলপমেন্ট প্রধান' : 'Club Lead & System Administrator'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isAdmin && !isEditing && (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="px-3 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-bold flex items-center gap-1.5 transition-colors active:scale-95 shadow-sm"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>{isBangla ? 'সম্পাদনা' : 'Edit'}</span>
                </button>
              )}
              <button
                onClick={onClose}
                className="p-1.5 rounded-xl text-white/80 hover:text-white hover:bg-white/20 transition-colors"
                title={isBangla ? 'বন্ধ করুন' : 'Close'}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
            {savedSuccess && (
              <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 flex items-center gap-2 text-xs font-bold text-emerald-800 dark:text-emerald-200 animate-fadeIn">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{isBangla ? 'পরিচিতির তথ্য ও ছবি সফলভাবে সংরক্ষিত হয়েছে! 🎉' : 'Admin profile & photos updated successfully! 🎉'}</span>
              </div>
            )}

            {!isEditing ? (
              /* VIEW MODE */
              <div className="space-y-5">
                {/* Hero Profile Showcase Card */}
                <div className="flex flex-col sm:flex-row items-center gap-5 p-5 rounded-3xl bg-gradient-to-br from-emerald-50/70 via-teal-50/50 to-slate-50 dark:from-slate-800/80 dark:via-slate-800/50 dark:to-slate-900 border border-emerald-200/70 dark:border-slate-700/70 shadow-sm text-center sm:text-left">
                  {/* Photo Container with click-to-enlarge */}
                  <div className="relative group shrink-0">
                    <div
                      onClick={() => {
                        if (currentDisplayPhoto) {
                          handleOpenLightbox(activePhotoIndex);
                        }
                      }}
                      className="w-28 h-28 sm:w-36 sm:h-36 rounded-3xl overflow-hidden bg-white dark:bg-slate-900 border-4 border-emerald-500 shadow-xl p-1 flex items-center justify-center cursor-pointer transition-transform hover:scale-102 active:scale-98 relative group"
                      title={isBangla ? 'ক্লিক করে পুরো ছবি বড় আকারে দেখুন' : 'Click to view full image in high resolution'}
                    >
                      {currentDisplayPhoto ? (
                        <img
                          src={currentDisplayPhoto}
                          alt={profile.name}
                          className="w-full h-full object-cover rounded-2xl transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-700 text-white flex items-center justify-center text-4xl sm:text-5xl font-black">
                          {profile.name.charAt(0)}
                        </div>
                      )}

                      {/* Hover Overlay with Zoom Icon */}
                      {currentDisplayPhoto && (
                        <div className="absolute inset-1 rounded-2xl bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white backdrop-blur-[2px]">
                          <Maximize2 className="w-6 h-6 drop-shadow-md text-emerald-300" />
                          <span className="text-[10px] font-bold mt-1 text-white bg-black/60 px-2 py-0.5 rounded-full">
                            {isBangla ? 'ফুল ভিউ' : 'Full View'}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Founder Badge */}
                    <span className="absolute -bottom-1 -right-1 bg-amber-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-md border-2 border-white dark:border-slate-900 flex items-center gap-1 z-10">
                      <Sparkles className="w-3 h-3" />
                      <span>Founder</span>
                    </span>

                    {/* Prev/Next arrows on hero photo if multiple images */}
                    {allDisplayPhotos.length > 1 && (
                      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-1 pointer-events-none">
                        <button
                          type="button"
                          onClick={handlePrevPhoto}
                          className="p-1 rounded-full bg-black/60 hover:bg-emerald-600 text-white pointer-events-auto shadow-md transition-colors"
                          title={isBangla ? 'পূর্ববর্তী ছবি' : 'Previous'}
                        >
                          <ChevronLeft className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={handleNextPhoto}
                          className="p-1 rounded-full bg-black/60 hover:bg-emerald-600 text-white pointer-events-auto shadow-md transition-colors"
                          title={isBangla ? 'পরবর্তী ছবি' : 'Next'}
                        >
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2 justify-center sm:justify-start flex-wrap">
                      <span className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 font-extrabold text-xs shadow-sm">
                        {profile.designation}
                      </span>
                      {allDisplayPhotos.length > 1 && (
                        <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                          <Images className="w-3 h-3 text-emerald-600" />
                          <span>{allDisplayPhotos.length} {isBangla ? 'টি ছবি' : 'photos'}</span>
                        </span>
                      )}
                    </div>

                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white pt-1">
                      {isBangla && profile.banglaName ? profile.banglaName : profile.name}
                    </h2>
                    {profile.banglaName && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                        {profile.name}
                      </p>
                    )}

                    {profile.location && (
                      <p className="text-xs text-slate-600 dark:text-slate-300 flex items-center justify-center sm:justify-start gap-1 pt-1 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                        <span>{profile.location}</span>
                      </p>
                    )}

                    {/* Click photo hint button */}
                    {currentDisplayPhoto && (
                      <div className="pt-2">
                        <button
                          type="button"
                          onClick={() => handleOpenLightbox(activePhotoIndex)}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all shadow-sm active:scale-95"
                        >
                          <Maximize2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{isBangla ? '🔍 পুরো ছবি বড় করে দেখুন' : '🔍 View Full Size Photo'}</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Multiple Photos Gallery Strip (if 2 or more photos exist) */}
                {allDisplayPhotos.length > 1 && (
                  <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 shadow-sm space-y-2.5">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-black text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                        <Images className="w-4 h-4 text-emerald-600" />
                        <span>{isBangla ? 'অ্যাডমিন ফটো অ্যালবাম ও গ্যালারি' : 'Admin Photo Gallery & Album'}</span>
                      </h4>
                      <button
                        type="button"
                        onClick={() => handleOpenLightbox(activePhotoIndex)}
                        className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                      >
                        <span>{isBangla ? 'সবগুলো ফুল ভিউ' : 'View Fullscreen'}</span>
                        <Maximize2 className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="flex items-center gap-3 overflow-x-auto pb-1 pt-1">
                      {allDisplayPhotos.map((img, idx) => (
                        <div key={idx} className="relative shrink-0 group">
                          <button
                            type="button"
                            onClick={() => {
                              setActivePhotoIndex(idx);
                              handleOpenLightbox(idx);
                            }}
                            className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 transition-all p-0.5 ${
                              idx === activePhotoIndex
                                ? 'border-emerald-500 scale-105 shadow-md shadow-emerald-500/30 ring-2 ring-emerald-400/40'
                                : 'border-slate-200 dark:border-slate-700 hover:border-emerald-400 opacity-80 hover:opacity-100'
                            }`}
                          >
                            <img
                              src={img}
                              alt={`Admin Photo ${idx + 1}`}
                              className="w-full h-full object-cover rounded-xl"
                            />
                          </button>
                          {idx === 0 && (
                            <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-[8px] font-bold px-1 rounded-full shadow">
                              ⭐
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Bio Statement */}
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 shadow-sm space-y-1.5">
                  <h4 className="text-xs font-black text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>{isBangla ? 'পরিচিতি ও ক্লাবের দৃষ্টিভঙ্গি' : 'About & Club Mission'}</span>
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                    {profile.bio}
                  </p>
                </div>

                {/* Social & Contact Grid */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    {isBangla ? 'যোগাযোগ ও সোশ্যাল মিডিয়া' : 'Connect & Social Links'}
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {profile.phone && (
                      <a
                        href={`tel:${profile.phone}`}
                        className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 border border-slate-200/80 dark:border-slate-700/60 text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center gap-2.5 transition-colors group"
                      >
                        <div className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-600">
                          <Phone className="w-4 h-4" />
                        </div>
                        <div className="truncate">
                          <span className="text-[10px] text-slate-400 block font-normal">{isBangla ? 'ফোন করুন' : 'Phone'}</span>
                          <span className="font-mono group-hover:text-emerald-600 dark:group-hover:text-emerald-400">{profile.phone}</span>
                        </div>
                      </a>
                    )}

                    {profile.whatsappNumber && (
                      <a
                        href={`https://wa.me/${profile.whatsappNumber.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 border border-slate-200/80 dark:border-slate-700/60 text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center gap-2.5 transition-colors group"
                      >
                        <div className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-600">
                          <span className="text-sm">💬</span>
                        </div>
                        <div className="truncate">
                          <span className="text-[10px] text-slate-400 block font-normal">WhatsApp</span>
                          <span className="font-mono group-hover:text-emerald-600 dark:group-hover:text-emerald-400">{profile.whatsappNumber}</span>
                        </div>
                      </a>
                    )}

                    {profile.messengerUrl && (
                      <a
                        href={profile.messengerUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-blue-50 dark:hover:bg-blue-950/40 border border-slate-200/80 dark:border-slate-700/60 text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center gap-2.5 transition-colors group"
                      >
                        <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-600">
                          <MessageCircle className="w-4 h-4" />
                        </div>
                        <div className="truncate">
                          <span className="text-[10px] text-slate-400 block font-normal">Facebook Messenger</span>
                          <span className="group-hover:text-blue-600 dark:group-hover:text-blue-400">{isBangla ? 'মেসেজ পাঠান' : 'Send Message'}</span>
                        </div>
                      </a>
                    )}

                    {profile.facebookUrl && (
                      <a
                        href={profile.facebookUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-blue-50 dark:hover:bg-blue-950/40 border border-slate-200/80 dark:border-slate-700/60 text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center gap-2.5 transition-colors group"
                      >
                        <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-600">
                          <ExternalLink className="w-4 h-4" />
                        </div>
                        <div className="truncate">
                          <span className="text-[10px] text-slate-400 block font-normal">Facebook Profile</span>
                          <span className="group-hover:text-blue-600 dark:group-hover:text-blue-400">{isBangla ? 'ফেসবুকে ভিজিট করুন' : 'View Facebook'}</span>
                        </div>
                      </a>
                    )}

                    {profile.youtubeUrl && (
                      <a
                        href={profile.youtubeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-slate-200/80 dark:border-slate-700/60 text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center gap-2.5 transition-colors group"
                      >
                        <div className="p-1.5 rounded-lg bg-rose-100 dark:bg-rose-950 text-rose-600">
                          <span className="text-sm">▶️</span>
                        </div>
                        <div className="truncate">
                          <span className="text-[10px] text-slate-400 block font-normal">YouTube</span>
                          <span className="group-hover:text-rose-600 dark:group-hover:text-rose-400">{isBangla ? 'চ্যানেল দেখুন' : 'YouTube Channel'}</span>
                        </div>
                      </a>
                    )}

                    {profile.linkedinUrl && (
                      <a
                        href={profile.linkedinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-sky-50 dark:hover:bg-sky-950/40 border border-slate-200/80 dark:border-slate-700/60 text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center gap-2.5 transition-colors group"
                      >
                        <div className="p-1.5 rounded-lg bg-sky-100 dark:bg-sky-950 text-sky-600">
                          <span className="text-sm font-bold">in</span>
                        </div>
                        <div className="truncate">
                          <span className="text-[10px] text-slate-400 block font-normal">LinkedIn</span>
                          <span className="group-hover:text-sky-600 dark:group-hover:text-sky-400">{isBangla ? 'প্রোফাইল কানেক্ট' : 'LinkedIn Profile'}</span>
                        </div>
                      </a>
                    )}

                    {profile.instagramUrl && (
                      <a
                        href={profile.instagramUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-pink-50 dark:hover:bg-pink-950/40 border border-slate-200/80 dark:border-slate-700/60 text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center gap-2.5 transition-colors group"
                      >
                        <div className="p-1.5 rounded-lg bg-pink-100 dark:bg-pink-950 text-pink-600">
                          <span className="text-sm">📸</span>
                        </div>
                        <div className="truncate">
                          <span className="text-[10px] text-slate-400 block font-normal">Instagram</span>
                          <span className="group-hover:text-pink-600 dark:group-hover:text-pink-400">{isBangla ? 'ফলো করুন' : 'Instagram'}</span>
                        </div>
                      </a>
                    )}

                    {profile.websiteUrl && (
                      <a
                        href={profile.websiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-teal-50 dark:hover:bg-teal-950/40 border border-slate-200/80 dark:border-slate-700/60 text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center gap-2.5 transition-colors group"
                      >
                        <div className="p-1.5 rounded-lg bg-teal-100 dark:bg-teal-950 text-teal-600">
                          <ExternalLink className="w-4 h-4" />
                        </div>
                        <div className="truncate">
                          <span className="text-[10px] text-slate-400 block font-normal">{isBangla ? 'ওয়েবসাইট / পোর্টফোলিও' : 'Website'}</span>
                          <span className="group-hover:text-teal-600 dark:group-hover:text-teal-400">{profile.websiteUrl.replace(/^https?:\/\//, '')}</span>
                        </div>
                      </a>
                    )}

                    {profile.email && (
                      <a
                        href={`mailto:${profile.email}`}
                        className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 border border-slate-200/80 dark:border-slate-700/60 text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center gap-2.5 transition-colors group sm:col-span-2"
                      >
                        <div className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-600">
                          <Mail className="w-4 h-4" />
                        </div>
                        <div className="truncate">
                          <span className="text-[10px] text-slate-400 block font-normal">Email</span>
                          <span className="font-mono group-hover:text-emerald-600 dark:group-hover:text-emerald-400">{profile.email}</span>
                        </div>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              /* EDIT FORM */
              <form onSubmit={handleSave} className="space-y-5">
                {/* Multi-Photo Upload Section */}
                <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-emerald-50/50 to-slate-50 dark:from-slate-800/80 dark:to-slate-900 border border-emerald-200/80 dark:border-slate-700 space-y-3.5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h4 className="text-xs font-black text-slate-800 dark:text-white flex items-center gap-1.5">
                        <Camera className="w-4 h-4 text-emerald-600" />
                        <span>{isBangla ? 'অ্যাডমিনের ছবি ও গ্যালারি (একাধিক ছবি আপলোড)' : 'Admin Photos & Gallery (Upload Multiple Images)'}</span>
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {isBangla
                          ? 'একসাথে ২, ৩ বা তার বেশি ছবি আপলোড করতে পারবেন। যে ছবিটি মূল প্রোফাইল রাখতে চান সেটিতে ⭐ ক্লিক করুন।'
                          : 'Upload 2, 3, or more photos. Click ⭐ on any photo to set it as primary profile picture.'}
                      </p>
                    </div>

                    <button
                      type="button"
                      disabled={isUploading}
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/20 active:scale-95 transition-all self-start sm:self-auto shrink-0"
                    >
                      <Plus className="w-4 h-4" />
                      <span>{isUploading ? (isBangla ? 'আপলোড হচ্ছে...' : 'Uploading...') : (isBangla ? 'ছবি যোগ করুন' : 'Add Photos')}</span>
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={handleMultiplePhotosUpload}
                    />
                  </div>

                  {/* Photo Gallery Grid */}
                  {photos.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                      {photos.map((img, idx) => {
                        const isPrimary = photoUrl === img || (idx === 0 && !photoUrl);
                        return (
                          <div
                            key={idx}
                            className={`relative rounded-2xl overflow-hidden bg-white dark:bg-slate-800 border-2 transition-all group shadow-sm flex flex-col ${
                              isPrimary ? 'border-emerald-500 ring-2 ring-emerald-400/40' : 'border-slate-200 dark:border-slate-700'
                            }`}
                          >
                            <div className="w-full h-28 sm:h-32 relative bg-slate-100 dark:bg-slate-900">
                              <img
                                src={img}
                                alt={`Admin ${idx + 1}`}
                                className="w-full h-full object-cover"
                              />
                              {isPrimary && (
                                <span className="absolute top-1.5 left-1.5 bg-emerald-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow flex items-center gap-1">
                                  <Star className="w-2.5 h-2.5 fill-current" />
                                  <span>{isBangla ? 'মূল ছবি' : 'Primary'}</span>
                                </span>
                              )}
                              <button
                                type="button"
                                onClick={() => handleOpenLightbox(idx)}
                                className="absolute top-1.5 right-1.5 p-1 rounded-lg bg-black/60 hover:bg-black/80 text-white transition-colors"
                                title={isBangla ? 'বড় আকারে দেখুন' : 'Preview Fullscreen'}
                              >
                                <Maximize2 className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            {/* Actions under each photo */}
                            <div className="p-2 bg-slate-50 dark:bg-slate-800/80 flex items-center justify-between gap-1 border-t border-slate-100 dark:border-slate-700/60">
                              {!isPrimary ? (
                                <button
                                  type="button"
                                  onClick={() => handleSetPrimary(idx)}
                                  className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 flex items-center gap-1"
                                  title={isBangla ? 'মূল প্রোফাইল ছবি করুন' : 'Make Primary Photo'}
                                >
                                  <Star className="w-3 h-3" />
                                  <span>{isBangla ? 'মূল ছবি বানান' : 'Set Main'}</span>
                                </button>
                              ) : (
                                <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
                                  ✓ {isBangla ? 'মূল ছবি' : 'Main Photo'}
                                </span>
                              )}

                              <button
                                type="button"
                                onClick={() => handleRemovePhoto(idx)}
                                className="p-1 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                                title={isBangla ? 'মুছে ফেলুন' : 'Delete'}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="p-6 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-500 text-center cursor-pointer bg-white/50 dark:bg-slate-800/40 transition-colors"
                    >
                      <Camera className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        {isBangla ? 'কোনো ছবি আপলোড করা হয়নি' : 'No photos uploaded yet'}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        {isBangla ? 'এখানে ক্লিক করে ১টি বা একাধিক ছবি সিলেক্ট করুন' : 'Click here to select 1 or multiple photos'}
                      </p>
                    </div>
                  )}
                </div>

                {/* Names */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      {isBangla ? 'নাম (English)' : 'Name (English)'} *
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border-0 text-xs font-semibold focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      {isBangla ? 'নাম (বাংলা)' : 'Name (Bengali)'}
                    </label>
                    <input
                      type="text"
                      value={banglaName}
                      onChange={(e) => setBanglaName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border-0 text-xs font-semibold focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                {/* Designation & Location */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      {isBangla ? 'পদবি / ভূমিকা' : 'Designation / Role'} *
                    </label>
                    <input
                      type="text"
                      required
                      value={designation}
                      onChange={(e) => setDesignation(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border-0 text-xs font-semibold focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      {isBangla ? 'ঠিকানা / এলাকা' : 'Location / City'}
                    </label>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border-0 text-xs font-semibold focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                {/* Bio Description */}
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    {isBangla ? 'পরিচিতি / বিবরণ (Bio)' : 'About / Bio Statement'}
                  </label>
                  <textarea
                    rows={3}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder={isBangla ? 'আপনার বা ক্লাবের উদ্দেশ্য সম্পর্কে লিখুন...' : 'Write about yourself and club vision...'}
                    className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border-0 text-xs font-medium focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* Contact Links */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      {isBangla ? 'মোবাইল নম্বর' : 'Phone Number'}
                    </label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border-0 text-xs font-mono focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      {isBangla ? 'WhatsApp নম্বর' : 'WhatsApp Number'}
                    </label>
                    <input
                      type="text"
                      value={whatsappNumber}
                      onChange={(e) => setWhatsappNumber(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border-0 text-xs font-mono focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      {isBangla ? 'ইমেইল অ্যাড্রেস' : 'Email Address'}
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border-0 text-xs focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      {isBangla ? 'Facebook লিংক' : 'Facebook URL'}
                    </label>
                    <input
                      type="url"
                      value={facebookUrl}
                      onChange={(e) => setFacebookUrl(e.target.value)}
                      placeholder="https://facebook.com/..."
                      className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border-0 text-xs focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      {isBangla ? 'Messenger লিংক' : 'Messenger Link'}
                    </label>
                    <input
                      type="url"
                      value={messengerUrl}
                      onChange={(e) => setMessengerUrl(e.target.value)}
                      placeholder="https://m.me/..."
                      className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border-0 text-xs focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      {isBangla ? 'YouTube চ্যানেল লিংক' : 'YouTube Channel URL'}
                    </label>
                    <input
                      type="url"
                      value={youtubeUrl}
                      onChange={(e) => setYoutubeUrl(e.target.value)}
                      placeholder="https://youtube.com/@..."
                      className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border-0 text-xs focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      {isBangla ? 'LinkedIn প্রোফাইল লিংক' : 'LinkedIn URL'}
                    </label>
                    <input
                      type="url"
                      value={linkedinUrl}
                      onChange={(e) => setLinkedinUrl(e.target.value)}
                      placeholder="https://linkedin.com/in/..."
                      className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border-0 text-xs focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      {isBangla ? 'Instagram প্রোফাইল লিংক' : 'Instagram URL'}
                    </label>
                    <input
                      type="url"
                      value={instagramUrl}
                      onChange={(e) => setInstagramUrl(e.target.value)}
                      placeholder="https://instagram.com/..."
                      className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border-0 text-xs focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      {isBangla ? 'ওয়েবসাইট / পোর্টফোলিও লিংক' : 'Website / Portfolio URL'}
                    </label>
                    <input
                      type="url"
                      value={websiteUrl}
                      onChange={(e) => setWebsiteUrl(e.target.value)}
                      placeholder="https://yourwebsite.com"
                      className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border-0 text-xs focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                {/* Form Buttons */}
                <div className="flex gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="flex-1 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    {isBangla ? 'বাতিল' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs shadow-md shadow-emerald-500/20 transition-all flex items-center justify-center gap-1.5"
                  >
                    <Save className="w-4 h-4" />
                    <span>{isBangla ? 'তথ্য ও ছবি সেভ করুন' : 'Save Profile & Photos'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Fullscreen High-Resolution Image Lightbox Modal */}
      <ImageLightboxModal
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
        images={allDisplayPhotos}
        initialIndex={lightboxIndex}
        title={isBangla && profile.banglaName ? profile.banglaName : profile.name}
        subtitle={profile.designation || (isBangla ? 'অ্যাপ প্রতিষ্ঠাতা ও প্রধান অ্যাডমিন' : 'Admin & Founder')}
        lang={lang}
      />
    </>
  );
};

import React, { useState, useEffect } from 'react';
import { Language } from '../utils/language';

export type MascotMood =
  | 'idle'
  | 'watching'
  | 'hiding'
  | 'covering_eyes'
  | 'peeking'
  | 'error'
  | 'excited'
  | 'success';

interface Props {
  mood: MascotMood;
  lookProgress?: number; // 0 to 1 based on text length
  inputLength?: number;
  customMessage?: string;
  lang?: Language;
  isBangla?: boolean;
  activeTab?: 'login' | 'signup' | 'admin';
}

export const FunnyGirlMascot: React.FC<Props> = ({
  mood: rawMood,
  lookProgress: rawLookProgress,
  inputLength,
  customMessage,
  lang: rawLang,
  isBangla: isBanglaProp,
  activeTab = 'login',
}) => {
  const mood =
    rawMood === 'covering_eyes'
      ? 'hiding'
      : rawMood === 'success'
      ? 'excited'
      : rawMood;
  const lang: Language = rawLang || (isBanglaProp === false ? 'en' : 'bn');
  const lookProgress =
    rawLookProgress !== undefined
      ? rawLookProgress
      : inputLength !== undefined
      ? Math.min(1, Math.max(0.1, inputLength / 16))
      : 0.5;
  const isBangla = lang === 'bn';
  const [isBlinking, setIsBlinking] = useState(false);
  const [pokeIndex, setPokeIndex] = useState<number | null>(null);
  const [isJumping, setIsJumping] = useState(false);

  // Natural eye blink interval when idle or watching
  useEffect(() => {
    const interval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 180);
    }, 3200);
    return () => clearInterval(interval);
  }, []);

  // Reset poke message when mood changes
  useEffect(() => {
    setPokeIndex(null);
  }, [mood, activeTab]);

  const funnyPokeMessagesBn = [
    'এই! আমাকে খোঁচাচ্ছেন কেন? আগে লগইন তো করুন! 😂👉',
    'কাতুকুতু দেবেন না প্লিজ, শাটলকক হাত থেকে পড়ে যাবে! 🤭🏸',
    'পাসওয়ার্ডের ঘরে যান, দেখুন আমি কেমন লক্ষ্মী মেয়ের মতো চোখ ঢাকি! 🙈✨',
    'তাড়াতাড়ি ঢুকে পড়ুন, কোর্টে সবাই আপনার জন্য অপেক্ষা করছে! 🏃‍♀️💨',
    'আমি কিন্তু ক্লাবের সিকিউরিটি গার্ড! সব নজরে রাখছি! 🕵️‍♀️💖',
  ];

  const funnyPokeMessagesEn = [
    'Hey! Stop poking me and log in first! 😂👉',
    "Don't tickle me, I'll drop the shuttlecock! 🤭🏸",
    'Click the password box to see me cover my eyes! 🙈✨',
    'Hurry up! Everyone is waiting on the court! 🏃‍♀️💨',
    "I'm the club security guard! Watching everything! 🕵️‍♀️💖",
  ];

  const handleMascotClick = () => {
    setIsJumping(true);
    setTimeout(() => setIsJumping(false), 600);
    setPokeIndex((prev) =>
      prev === null ? 0 : (prev + 1) % funnyPokeMessagesBn.length
    );
  };

  // Compute pupil offset (-6px to +6px) when watching user type
  const pupilX =
    mood === 'watching'
      ? Math.max(-7, Math.min(7, (lookProgress - 0.5) * 14))
      : 0;
  const pupilY = mood === 'watching' ? 3 : 0;

  // Determine speech bubble message
  const getSpeechText = () => {
    if (pokeIndex !== null) {
      return isBangla
        ? funnyPokeMessagesBn[pokeIndex]
        : funnyPokeMessagesEn[pokeIndex];
    }
    if (customMessage) return customMessage;

    if (mood === 'error') {
      return isBangla
        ? 'ও মা গো! ভুল হয়ে গেছে তো! আরেকবার ঠিক করে দিন না প্লিজ! 😵‍💫💦'
        : 'Oopsie! Something is wrong! Please check and try again! 😵‍💫💦';
    }
    if (mood === 'peeking') {
      return isBangla
        ? 'হিহি! এক চোখ দিয়ে একটুখানি উঁকি মারলাম! কাউকে বলব না প্রমিস! 🫣😜'
        : 'Hehe! Taking a tiny one-eye peek! Your secret is safe with me! 🫣😜';
    }
    if (mood === 'hiding') {
      return isBangla
        ? 'কসম! আমি দুই হাত দিয়ে চোখ ঢেকেছি, আপনার গোপন পিন একদমই দেখছি না! 🙈🤫'
        : "I swear! Both hands over my eyes, I'm NOT looking at your secret PIN! 🙈🤫";
    }
    if (mood === 'excited') {
      return isBangla
        ? 'ওয়াও! দারুণ লাগছে একদম চ্যাম্পিয়ন! এবার নিচের বাটনে চাপ দিন! 🤩💖'
        : 'Wow! Looking like a true champion! Ready to go! 🤩💖';
    }
    if (mood === 'watching') {
      return isBangla
        ? 'হুমম... কী লিখছেন দেখি তো! একদম নির্ভুলভাবে লিখুন কিন্তু! 👀✍️'
        : 'Hmm... let me see what you are typing! Make sure it is accurate! 👀✍️';
    }

    // Idle messages per tab
    if (activeTab === 'signup') {
      return isBangla
        ? 'স্বাগতম! নতুন সদস্য হতে আপনার তথ্য দিন, পিন লেখার সময় আমি চোখ বন্ধ রাখব! 🎀✨'
        : "Welcome! Fill in your details to join—I'll close my eyes when you type your PIN! 🎀✨";
    }
    if (activeTab === 'admin') {
      return isBangla
        ? 'স্যালুট বস! 👑 গোপন অ্যাডমিন পাসওয়ার্ড দিন, আমি চোখ ঢেকে দাঁড়াচ্ছি! 🙈🛡️'
        : 'Salute Boss! 👑 Enter the secret admin password, covering my eyes now! 🙈🛡️';
    }
    return isBangla
      ? 'হ্যালো! ঝটপট লগইন করে ফেলুন! (আমাকে ট্যাপ করলে মজার কথা বলব 😜🏸)'
      : 'Hello! Log in quickly! (Tap me for a funny surprise 😜🏸)';
  };

  const isHandsUp = mood === 'hiding' || mood === 'peeking';

  return (
    <div className="relative flex flex-col items-center select-none pt-2 pb-1">
      {/* Speech Bubble */}
      <div
        onClick={handleMascotClick}
        className={`cursor-pointer relative mb-2 px-3.5 py-2 rounded-2xl text-xs font-bold text-center max-w-xs sm:max-w-sm shadow-md border transition-all duration-300 ${
          mood === 'error'
            ? 'bg-rose-50 dark:bg-rose-950/80 text-rose-700 dark:text-rose-200 border-rose-300 dark:border-rose-700 animate-bounce'
            : mood === 'hiding' || mood === 'peeking'
            ? 'bg-pink-50 dark:bg-pink-950/70 text-pink-800 dark:text-pink-200 border-pink-300 dark:border-pink-800'
            : 'bg-emerald-50 dark:bg-slate-800 text-emerald-900 dark:text-emerald-200 border-emerald-200 dark:border-slate-700'
        }`}
      >
        <span>{getSpeechText()}</span>
        {/* Bubble Triangle Pointer */}
        <div
          className={`w-3 h-3 rotate-45 absolute -bottom-1.5 left-1/2 -translate-x-1/2 border-r border-b ${
            mood === 'error'
              ? 'bg-rose-50 dark:bg-rose-950 border-rose-300 dark:border-rose-700'
              : mood === 'hiding' || mood === 'peeking'
              ? 'bg-pink-50 dark:bg-pink-950 border-pink-300 dark:border-pink-800'
              : 'bg-emerald-50 dark:bg-slate-800 border-emerald-200 dark:border-slate-700'
          }`}
        />
      </div>

      {/* Interactive Cartoon Girl Avatar Stage */}
      <div
        onClick={handleMascotClick}
        title={isBangla ? 'আমাকে ট্যাপ করুন!' : 'Tap me!'}
        className={`cursor-pointer relative w-36 h-32 flex items-center justify-center transition-transform duration-300 ${
          isJumping || mood === 'excited'
            ? '-translate-y-2 scale-105'
            : mood === 'watching'
            ? 'scale-[1.03]'
            : 'hover:scale-105'
        }`}
      >
        {/* Background Glow Circle */}
        <div
          className={`absolute w-28 h-28 rounded-full blur-md transition-colors duration-500 ${
            mood === 'error'
              ? 'bg-rose-400/30'
              : mood === 'hiding' || mood === 'peeking'
              ? 'bg-pink-400/30'
              : 'bg-emerald-400/25'
          }`}
        />

        {/* Floating Decorative Emojis */}
        <span
          className={`absolute -left-1 top-2 text-base transition-all duration-500 ${
            mood === 'hiding'
              ? 'scale-125 rotate-12'
              : mood === 'peeking'
              ? 'scale-125 -rotate-12'
              : 'animate-pulse'
          }`}
        >
          {mood === 'error'
            ? '💦'
            : mood === 'hiding'
            ? '🙈'
            : mood === 'peeking'
            ? '🫣'
            : mood === 'watching'
            ? '👀'
            : '🏸'}
        </span>
        <span className="absolute -right-1 top-3 text-base animate-bounce">
          {mood === 'error'
            ? '💫'
            : mood === 'hiding'
            ? '🤫'
            : mood === 'peeking'
            ? '😜'
            : '✨'}
        </span>

        {/* Main SVG Girl Character */}
        <svg
          viewBox="0 0 200 180"
          className="w-36 h-32 overflow-visible drop-shadow-md"
        >
          {/* Left & Right Bouncing Pigtails (Hair) */}
          <g
            className="transition-transform duration-500 origin-center"
            style={{
              transform:
                mood === 'hiding'
                  ? 'rotate(-4deg)'
                  : mood === 'peeking'
                  ? 'rotate(5deg)'
                  : mood === 'watching'
                  ? `rotate(${pupilX * 0.5}deg)`
                  : 'rotate(0deg)',
            }}
          >
            {/* Left Pigtail */}
            <path
              d="M 48 65 C 15 55, 8 95, 25 120 C 35 130, 48 115, 50 95 Z"
              fill="#2D1B4E"
            />
            <circle cx="48" cy="68" r="7" fill="#FF5E99" />

            {/* Right Pigtail */}
            <path
              d="M 152 65 C 185 55, 192 95, 175 120 C 165 130, 152 115, 150 95 Z"
              fill="#2D1B4E"
            />
            <circle cx="152" cy="68" r="7" fill="#FF5E99" />

            {/* Back Hair */}
            <ellipse cx="100" cy="75" rx="56" ry="52" fill="#2D1B4E" />

            {/* Neck & Shoulders (Sporty Jersey) */}
            <path
              d="M 65 138 C 65 138, 100 132, 135 138 L 148 172 L 52 172 Z"
              fill="#10B981"
            />
            {/* Jersey Collar */}
            <path
              d="M 82 136 L 100 154 L 118 136"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="4"
              strokeLinecap="round"
            />
            <rect x="89" y="122" width="22" height="20" rx="8" fill="#FFE0CC" />

            {/* Ears */}
            <circle cx="46" cy="92" r="10" fill="#FFE0CC" />
            <circle cx="154" cy="92" r="10" fill="#FFE0CC" />
            {/* Cute Earrings */}
            <circle cx="45" cy="101" r="3" fill="#FBBF24" />
            <circle cx="155" cy="101" r="3" fill="#FBBF24" />

            {/* Head / Face Base */}
            <rect
              x="50"
              y="36"
              width="100"
              height="96"
              rx="46"
              fill="#FFE4D1"
              stroke="#F3C6AA"
              strokeWidth="2"
            />

            {/* Forehead Bangs / Front Hair */}
            <path
              d="M 48 72 C 50 32, 150 32, 152 72 C 138 52, 125 65, 112 50 C 100 66, 82 64, 72 50 C 62 64, 54 62, 48 72 Z"
              fill="#2D1B4E"
            />
            {/* Cute Star Hairpin */}
            <circle cx="66" cy="52" r="5" fill="#FBBF24" />
            <circle cx="76" cy="48" r="3.5" fill="#EC4899" />

            {/* Rosy Blush Cheeks (extra bright when hiding/peeking/excited) */}
            <ellipse
              cx="67"
              cy="102"
              rx={isHandsUp || mood === 'excited' ? '11' : '8'}
              ry={isHandsUp || mood === 'excited' ? '6.5' : '4.5'}
              fill="#FF7EB6"
              opacity={isHandsUp || mood === 'excited' ? '0.65' : '0.4'}
            />
            <ellipse
              cx="133"
              cy="102"
              rx={isHandsUp || mood === 'excited' ? '11' : '8'}
              ry={isHandsUp || mood === 'excited' ? '6.5' : '4.5'}
              fill="#FF7EB6"
              opacity={isHandsUp || mood === 'excited' ? '0.65' : '0.4'}
            />

            {/* Eyebrows */}
            <path
              d={
                mood === 'error'
                  ? 'M 64 70 Q 74 76 84 68'
                  : mood === 'watching'
                  ? 'M 63 66 Q 74 59 85 66'
                  : 'M 64 69 Q 74 63 84 69'
              }
              fill="none"
              stroke="#2D1B4E"
              strokeWidth="3.2"
              strokeLinecap="round"
            />
            <path
              d={
                mood === 'error'
                  ? 'M 116 68 Q 126 76 136 70'
                  : mood === 'peeking'
                  ? 'M 115 63 Q 126 56 137 64'
                  : mood === 'watching'
                  ? 'M 115 66 Q 126 59 137 66'
                  : 'M 116 69 Q 126 63 136 69'
              }
              fill="none"
              stroke="#2D1B4E"
              strokeWidth="3.2"
              strokeLinecap="round"
            />

            {/* EYES SECTION */}
            {mood === 'error' ? (
              /* Dizzy >< Eyes */
              <g stroke="#2D1B4E" strokeWidth="3.5" strokeLinecap="round" fill="none">
                <path d="M 66 80 L 82 92 M 82 80 L 66 92" />
                <path d="M 118 80 L 134 92 M 134 80 L 118 92" />
                {/* Sweat Drop */}
                <path
                  d="M 145 58 C 145 58, 152 68, 148 73 C 145 76, 141 76, 139 73 C 136 68, 145 58, 145 58 Z"
                  fill="#38BDF8"
                  stroke="none"
                />
              </g>
            ) : mood === 'hiding' ? (
              /* Tightly Closed Happy/Shy Eyes (> <) */
              <g stroke="#2D1B4E" strokeWidth="3.5" strokeLinecap="round" fill="none">
                <path d="M 65 81 L 80 87 L 65 93" />
                <path d="M 135 81 L 120 87 L 135 93" />
              </g>
            ) : mood === 'peeking' ? (
              /* Left eye closed (>), Right eye wide open peeking! */
              <g>
                <path
                  d="M 65 81 L 80 87 L 65 93"
                  stroke="#2D1B4E"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  fill="none"
                />
                {/* Open Peeking Right Eye */}
                <ellipse cx="126" cy="86" rx="11" ry="12" fill="#FFFFFF" />
                <ellipse cx="126" cy="86" rx="8" ry="9" fill="#2D1B4E" />
                <circle cx="129" cy="83" r="3" fill="#FFFFFF" />
                <circle cx="123" cy="89" r="1.5" fill="#FFFFFF" />
              </g>
            ) : isBlinking ? (
              /* Blinking Line Eyes */
              <g stroke="#2D1B4E" strokeWidth="3.5" strokeLinecap="round" fill="none">
                <path d="M 64 87 Q 74 92 84 87" />
                <path d="M 116 87 Q 126 92 136 87" />
              </g>
            ) : (
              /* Big Expressive Anime Eyes that follow input cursor */
              <g>
                {/* Left Eye */}
                <ellipse cx="74" cy="86" rx="11" ry="12.5" fill="#FFFFFF" />
                <g
                  style={{
                    transform: `translate(${pupilX}px, ${pupilY}px)`,
                    transition: 'transform 120ms ease-out',
                  }}
                >
                  <ellipse cx="74" cy="86" rx="7.5" ry="8.5" fill="#2D1B4E" />
                  <circle cx="77" cy="83" r="2.8" fill="#FFFFFF" />
                  <circle cx="71" cy="89" r="1.4" fill="#FFFFFF" />
                </g>

                {/* Right Eye */}
                <ellipse cx="126" cy="86" rx="11" ry="12.5" fill="#FFFFFF" />
                <g
                  style={{
                    transform: `translate(${pupilX}px, ${pupilY}px)`,
                    transition: 'transform 120ms ease-out',
                  }}
                >
                  <ellipse cx="126" cy="86" rx="7.5" ry="8.5" fill="#2D1B4E" />
                  <circle cx="129" cy="83" r="2.8" fill="#FFFFFF" />
                  <circle cx="123" cy="89" r="1.4" fill="#FFFFFF" />
                </g>
              </g>
            )}

            {/* Cute Tiny Nose */}
            <path
              d="M 99 95 Q 102 98 99 100"
              fill="none"
              stroke="#E0A889"
              strokeWidth="2.2"
              strokeLinecap="round"
            />

            {/* MOUTH EXPRESSIONS */}
            {mood === 'error' ? (
              /* Wavy Sad/Shocked Mouth */
              <path
                d="M 88 115 Q 94 109 100 115 Q 106 121 112 115"
                fill="none"
                stroke="#2D1B4E"
                strokeWidth="3"
                strokeLinecap="round"
              />
            ) : mood === 'peeking' ? (
              /* Cheeky Grin with Playful Tongue Out */
              <g>
                <path
                  d="M 88 109 Q 100 118 112 109"
                  fill="none"
                  stroke="#2D1B4E"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                <path
                  d="M 96 113 C 96 123, 106 123, 106 113 Z"
                  fill="#FB7185"
                  stroke="#2D1B4E"
                  strokeWidth="2"
                />
              </g>
            ) : mood === 'hiding' ? (
              /* Shy Tiny 'o' or Cat Smile (ω) */
              <path
                d="M 90 112 Q 95 117 100 112 Q 105 117 110 112"
                fill="none"
                stroke="#2D1B4E"
                strokeWidth="2.8"
                strokeLinecap="round"
              />
            ) : mood === 'watching' ? (
              /* Curious 'O' or Big Happy Smile */
              <path
                d="M 88 108 C 88 122, 112 122, 112 108 Z"
                fill="#FB7185"
                stroke="#2D1B4E"
                strokeWidth="2.5"
              />
            ) : (
              /* Default Cheerful Smile */
              <path
                d="M 87 109 Q 100 120 113 109"
                fill="none"
                stroke="#2D1B4E"
                strokeWidth="3.2"
                strokeLinecap="round"
              />
            )}
          </g>

          {/* ANIMATED HANDS (Fly up to cover eyes on password focus, lower right hand on peek!) */}
          {/* Left Hand */}
          <g
            style={{
              transform:
                mood === 'hiding' || mood === 'peeking'
                  ? 'translate(0px, -54px) rotate(12deg)'
                  : mood === 'watching'
                  ? 'translate(-4px, -6px) rotate(-8deg)'
                  : 'translate(0px, 0px)',
              transition: 'transform 350ms cubic-bezier(0.34, 1.56, 0.64, 1)',
              transformOrigin: '65px 145px',
            }}
          >
            <rect
              x="48"
              y="128"
              width="34"
              height="26"
              rx="13"
              fill="#FFE4D1"
              stroke="#E5B293"
              strokeWidth="2.2"
            />
            {/* Cute Finger Lines */}
            <line x1="60" y1="130" x2="60" y2="137" stroke="#E5B293" strokeWidth="2" strokeLinecap="round" />
            <line x1="68" y1="129" x2="68" y2="136" stroke="#E5B293" strokeWidth="2" strokeLinecap="round" />
            <line x1="75" y1="131" x2="75" y2="138" stroke="#E5B293" strokeWidth="2" strokeLinecap="round" />
          </g>

          {/* Right Hand */}
          <g
            style={{
              transform:
                mood === 'hiding'
                  ? 'translate(0px, -54px) rotate(-12deg)'
                  : mood === 'peeking'
                  ? 'translate(14px, -30px) rotate(18deg)'
                  : mood === 'watching'
                  ? 'translate(4px, -6px) rotate(8deg)'
                  : 'translate(0px, 0px)',
              transition: 'transform 350ms cubic-bezier(0.34, 1.56, 0.64, 1)',
              transformOrigin: '135px 145px',
            }}
          >
            <rect
              x="118"
              y="128"
              width="34"
              height="26"
              rx="13"
              fill="#FFE4D1"
              stroke="#E5B293"
              strokeWidth="2.2"
            />
            <line x1="125" y1="131" x2="125" y2="138" stroke="#E5B293" strokeWidth="2" strokeLinecap="round" />
            <line x1="132" y1="129" x2="132" y2="136" stroke="#E5B293" strokeWidth="2" strokeLinecap="round" />
            <line x1="140" y1="130" x2="140" y2="137" stroke="#E5B293" strokeWidth="2" strokeLinecap="round" />
          </g>
        </svg>
      </div>
    </div>
  );
};

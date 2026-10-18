import { SportType } from '../types';

export interface SportInfo {
  id: SportType;
  name: string;
  nameBangla: string;
  emoji: string;
  badgeBg: string;
  badgeText: string;
  border: string;
  taglineEn: string;
  taglineBn: string;
  equipment: string[];
  sampleTournamentTypes: { en: string; bn: string }[];
  defaultCategories: string[];
}

export const SPORTS_MAP: Record<SportType, SportInfo> = {
  badminton: {
    id: 'badminton',
    name: 'Badminton',
    nameBangla: 'ব্যাডমিন্টন',
    emoji: '🏸',
    badgeBg: 'bg-emerald-50 dark:bg-emerald-950/60',
    badgeText: 'text-emerald-700 dark:text-emerald-300',
    border: 'border-emerald-200 dark:border-emerald-800',
    taglineEn: 'Smash, Court & Feather Fund',
    taglineBn: 'কোর্ট ভাড়া, ফেদার ও শাটল ফান্ড',
    equipment: ['Shuttlecock (Feather/Nylon)', 'Rackets', 'Court Net', 'Grip Tape'],
    sampleTournamentTypes: [
      { en: 'Doubles Winter Cup', bn: 'শীতকালীন ডাবলস কাপ' },
      { en: 'Open Singles Championship', bn: 'উন্মুক্ত একক চ্যাম্পিয়নশিপ' },
    ],
    defaultCategories: [
      'Court Rent',
      'Shuttlecock',
      'Lighting / Electricity',
      'Tournament',
      'Equipment',
      'Food / Drinks',
      'Other',
    ],
  },
  cricket: {
    id: 'cricket',
    name: 'Cricket',
    nameBangla: 'ক্রিকেট',
    emoji: '🏏',
    badgeBg: 'bg-amber-50 dark:bg-amber-950/60',
    badgeText: 'text-amber-700 dark:text-amber-300',
    border: 'border-amber-200 dark:border-amber-800',
    taglineEn: 'Pitch, Match Balls & Umpire Fund',
    taglineBn: 'মাঠ ভাড়া, বল, পিচ ও আম্পায়ার ফান্ড',
    equipment: ['Tape Tennis Ball', 'Leather Ball', 'Bats', 'Pads & Gloves', 'Wickets'],
    sampleTournamentTypes: [
      { en: 'T10 Tape Tennis Super League', bn: 'টি-১০ টেপ টেনিস সুপার লিগ' },
      { en: 'Winter Cricket Tournament', bn: 'শীতকালীন শর্ট-পিচ ক্রিকেট টুর্নামেন্ট' },
      { en: 'Inter-Ward Cricket Trophy', bn: 'আন্তঃওয়ার্ড ক্রিকেট ট্রফি' },
    ],
    defaultCategories: [
      'Court / Field Rent',
      'Shuttlecock / Balls',
      'Equipment & Gear',
      'Umpire / Referee',
      'Jersey / Bibs',
      'Tournament',
      'Food / Refreshment',
      'Other',
    ],
  },
  football: {
    id: 'football',
    name: 'Football',
    nameBangla: 'ফুটবল',
    emoji: '⚽',
    badgeBg: 'bg-sky-50 dark:bg-sky-950/60',
    badgeText: 'text-sky-700 dark:text-sky-300',
    border: 'border-sky-200 dark:border-sky-800',
    taglineEn: 'Turf, Match Balls & Referee Fund',
    taglineBn: 'টার্ফ/মাঠ ভাড়া, ম্যাচ বল ও রেফারি ফান্ড',
    equipment: ['Match Football (Size 5)', 'Goal Net', 'Bibs / Jerseys', 'Shin Guards', 'Ball Pump'],
    sampleTournamentTypes: [
      { en: '7-a-side Turf Futsal Cup', bn: '৭-এ-সাইড টার্ফ ফুটসাল কাপ' },
      { en: 'Monsoon Football League', bn: 'বর্ষাকালীন ফুটবল টুর্নামেন্ট' },
      { en: 'Knockout Football Championship', bn: 'নকআউট ফুটবল চ্যাম্পিয়নশিপ' },
    ],
    defaultCategories: [
      'Court / Field Rent',
      'Shuttlecock / Balls',
      'Jersey / Bibs',
      'Umpire / Referee',
      'Medical / First Aid',
      'Tournament',
      'Food / Refreshment',
      'Other',
    ],
  },
  multi: {
    id: 'multi',
    name: 'All Sports (Multi-Sport)',
    nameBangla: 'অল স্পোর্টস (ব্যাডমিন্টন, ক্রিকেট, ফুটবল)',
    emoji: '🏆',
    badgeBg: 'bg-indigo-50 dark:bg-indigo-950/60',
    badgeText: 'text-indigo-700 dark:text-indigo-300',
    border: 'border-indigo-200 dark:border-indigo-800',
    taglineEn: 'Badminton, Cricket & Football Club',
    taglineBn: 'ব্যাডমিন্টন, ক্রিকেট ও ফুটবল ক্লাবের সমন্বিত ফান্ড',
    equipment: ['Badminton, Cricket & Football Sports Gears'],
    sampleTournamentTypes: [
      { en: 'Multi-Sport Annual Sports Meet', bn: 'বার্ষিক ক্রীড়া প্রতিযোগিতা ও টুর্নামেন্ট' },
      { en: 'Winter Badminton & Cricket Cup', bn: 'শীতকালীন ব্যাডমিন্টন ও ক্রিকেট কাপ' },
    ],
    defaultCategories: [
      'Court / Field Rent',
      'Shuttlecock / Balls',
      'Lighting / Electricity',
      'Equipment & Gear',
      'Jersey / Bibs',
      'Umpire / Referee',
      'Medical / First Aid',
      'Tournament',
      'Food / Refreshment',
      'Other',
    ],
  },
};

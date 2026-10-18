import React, { useState, useRef } from 'react';
import {
  LeaderboardAward,
  AwardPeriod,
  Member,
  SportType,
} from '../types';
import { processImageFile } from '../utils/imageUtils';

interface LeaderboardViewProps {
  awards: LeaderboardAward[];
  members: Member[];
  isAdmin: boolean;
  onSaveAward: (award: LeaderboardAward) => void;
  onDeleteAward?: (awardId: string) => void;
  onSelectMemberForSearch?: (memberCode: string) => void;
  isBangla?: boolean;
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({
  awards,
  members,
  isAdmin,
  onSaveAward,
  onDeleteAward,
  onSelectMemberForSearch,
  isBangla = true,
}) => {
  const [activePeriod, setActivePeriod] = useState<AwardPeriod>('today');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAward, setEditingAward] = useState<LeaderboardAward | null>(null);

  // Form states for adding/editing award
  const [formPeriod, setFormPeriod] = useState<AwardPeriod>('today');
  const [formPeriodLabel, setFormPeriodLabel] = useState('');
  const [formDate, setFormDate] = useState(new Date().toLocaleDateString('en-GB'));
  const [formNotes, setFormNotes] = useState('');

  // Best Player states
  const [playerMemberId, setPlayerMemberId] = useState('');
  const [playerSport, setPlayerSport] = useState<SportType>('badminton');
  const [playerMatchesPlayed, setPlayerMatchesPlayed] = useState(3);
  const [playerMatchesWon, setPlayerMatchesWon] = useState(3);
  const [playerScoreText, setPlayerScoreText] = useState('');
  const [playerBadge, setPlayerBadge] = useState('MVP / আজকের সেরা');
  const [playerAvatar, setPlayerAvatar] = useState<string | undefined>(undefined);

  // Best Team states
  const [teamName, setTeamName] = useState('');
  const [teamSport, setTeamSport] = useState<SportType>('badminton');
  const [teamPlayerNames, setTeamPlayerNames] = useState('');
  const [teamMemberCodes, setTeamMemberCodes] = useState('');
  const [teamMatchesPlayed, setTeamMatchesPlayed] = useState(2);
  const [teamMatchesWon, setTeamMatchesWon] = useState(2);
  const [teamScoreText, setTeamScoreText] = useState('');
  const [teamTitle, setTeamTitle] = useState('অপরাজিত চ্যাম্পিয়ন দল');
  const [teamLogo, setTeamLogo] = useState<string | undefined>(undefined);

  // Best Score states
  const [scoreTitle, setScoreTitle] = useState('সেরা রেকর্ড স্কোর');
  const [scoreValue, setScoreValue] = useState('');
  const [scoreAchievedBy, setScoreAchievedBy] = useState('');
  const [scoreOpponent, setScoreOpponent] = useState('');
  const [scoreSport, setScoreSport] = useState<SportType>('badminton');
  const [scoreNotes, setScoreNotes] = useState('');

  const playerImageRef = useRef<HTMLInputElement>(null);
  const teamImageRef = useRef<HTMLInputElement>(null);

  // Current active award for period
  const currentAward = awards.find((a) => a.period === activePeriod);

  const openAddModal = (award?: LeaderboardAward) => {
    if (award) {
      setEditingAward(award);
      setFormPeriod(award.period);
      setFormPeriodLabel(award.periodLabel);
      setFormDate(award.date);
      setFormNotes(award.notes || '');

      if (award.bestPlayer) {
        setPlayerMemberId(award.bestPlayer.memberId);
        setPlayerSport(award.bestPlayer.sport);
        setPlayerMatchesPlayed(award.bestPlayer.matchesPlayed);
        setPlayerMatchesWon(award.bestPlayer.matchesWon);
        setPlayerScoreText(award.bestPlayer.bestScoreText);
        setPlayerBadge(award.bestPlayer.awardBadge);
        const member = members.find((m) => m.id === award.bestPlayer?.memberId);
        setPlayerAvatar(award.bestPlayer.avatar || member?.avatar);
      }

      if (award.bestTeam) {
        setTeamName(award.bestTeam.teamName);
        setTeamSport(award.bestTeam.sport);
        setTeamPlayerNames(award.bestTeam.playerNames);
        setTeamMemberCodes(award.bestTeam.memberCodes?.join(', ') || '');
        setTeamMatchesPlayed(award.bestTeam.matchesPlayed);
        setTeamMatchesWon(award.bestTeam.matchesWon);
        setTeamScoreText(award.bestTeam.bestScoreText);
        setTeamTitle(award.bestTeam.achievementTitle || '');
        setTeamLogo(award.bestTeam.logo);
      }

      if (award.bestScore) {
        setScoreTitle(award.bestScore.title);
        setScoreValue(award.bestScore.score);
        setScoreAchievedBy(award.bestScore.achievedBy);
        setScoreOpponent(award.bestScore.opponent || '');
        setScoreSport(award.bestScore.sport);
        setScoreNotes(award.bestScore.notes || '');
      }
    } else {
      setEditingAward(null);
      setFormPeriod(activePeriod);
      setFormPeriodLabel(
        activePeriod === 'today'
          ? "Today's Champions (আজকের সেরা)"
          : activePeriod === 'weekly'
          ? 'Weekly Champions (সাপ্তাহিক সেরা)'
          : activePeriod === 'monthly'
          ? 'Monthly Champions (মাসিক সেরা)'
          : 'Season Champions (সিজন সেরা)'
      );
      setFormDate(new Date().toLocaleDateString('en-GB'));
      setFormNotes('');

      // Default first member & auto-load their photo!
      if (members.length > 0) {
        setPlayerMemberId(members[0].id);
        setPlayerScoreText('21-14, 21-11');
        setPlayerAvatar(members[0].avatar || undefined);
      } else {
        setPlayerAvatar(undefined);
      }
      setPlayerSport('badminton');
      setPlayerMatchesPlayed(3);
      setPlayerMatchesWon(3);
      setPlayerBadge('MVP / ম্যাচ সেরা 🌟');

      setTeamName('ক্লাব চ্যাম্পিয়ন দল');
      setTeamSport('badminton');
      setTeamPlayerNames('তানভীর ও রাকিব');
      setTeamMemberCodes('1001, 1002');
      setTeamMatchesPlayed(2);
      setTeamMatchesWon(2);
      setTeamScoreText('21-12, 21-18');
      setTeamTitle('অপরাজিত চ্যাম্পিয়ন দল');
      setTeamLogo(undefined);

      setScoreTitle('আজকের সর্বোচ্চ ব্যবধানে জয়');
      setScoreValue('21-08');
      setScoreAchievedBy('মেহেদী হাসান (1003)');
      setScoreOpponent('রেড ফাইটার্স');
      setScoreSport('badminton');
      setScoreNotes('');
    }
    setIsModalOpen(true);
  };

  const handlePlayerPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressed = await processImageFile(file, 300, 300, 0.75);
        setPlayerAvatar(compressed);
      } catch (err) {
        console.error('Failed to compress player image', err);
      }
    }
  };

  const handleTeamLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressed = await processImageFile(file, 300, 300, 0.75);
        setTeamLogo(compressed);
      } catch (err) {
        console.error('Failed to compress team image', err);
      }
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    const selectedPlayerMember = members.find((m) => m.id === playerMemberId);

    const updatedAward: LeaderboardAward = {
      id: editingAward ? editingAward.id : `award-${formPeriod}-${Date.now()}`,
      period: formPeriod,
      periodLabel: formPeriodLabel,
      date: formDate,
      notes: formNotes,
      bestPlayer: selectedPlayerMember
        ? {
            memberId: selectedPlayerMember.id,
            memberCode: selectedPlayerMember.memberCode,
            name: selectedPlayerMember.name,
            banglaName: selectedPlayerMember.banglaName,
            avatar: playerAvatar || selectedPlayerMember.avatar,
            sport: playerSport,
            matchesPlayed: playerMatchesPlayed,
            matchesWon: playerMatchesWon,
            bestScoreText: playerScoreText,
            awardBadge: playerBadge,
          }
        : undefined,
      bestTeam: teamName
        ? {
            teamName,
            logo: teamLogo,
            sport: teamSport,
            playerNames: teamPlayerNames,
            memberCodes: teamMemberCodes
              ? teamMemberCodes.split(',').map((c) => c.trim())
              : undefined,
            matchesPlayed: teamMatchesPlayed,
            matchesWon: teamMatchesWon,
            bestScoreText: teamScoreText,
            achievementTitle: teamTitle,
          }
        : undefined,
      bestScore: scoreValue
        ? {
            title: scoreTitle,
            score: scoreValue,
            achievedBy: scoreAchievedBy,
            opponent: scoreOpponent,
            date: formDate,
            sport: scoreSport,
            notes: scoreNotes,
          }
        : undefined,
    };

    onSaveAward(updatedAward);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -right-6 -bottom-6 text-9xl opacity-15 select-none pointer-events-none">
          🏆
        </div>
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold uppercase tracking-wider mb-2 border border-white/20">
              <span>👑</span>
              <span>{isBangla ? 'হল অব ফেম ও সেরা তারকা' : 'Club Hall of Fame'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black">
              {isBangla ? 'সেরা দল, সেরা খেলোয়াড় ও সেরা স্কোর' : 'Best Team, Player & Best Score'}
            </h1>
            <p className="text-amber-100 text-xs sm:text-sm mt-1 max-w-xl">
              {isBangla
                ? 'আজকের, এই সপ্তাহের ও চলতি মাসের শীর্ষ পারফরমার ও ম্যাচ রেকর্ডসমূহ।'
                : 'Recognizing outstanding match performances, highest scores and winning teams.'}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {isAdmin && (
              <>
                {currentAward && (
                  <button
                    onClick={() => {
                      if (window.confirm(isBangla ? 'আপনি কি নিশ্চিত যে এই সেরা তারকার রেকর্ডটি মুছে ফেলতে চান?' : 'Are you sure you want to delete this award record?')) {
                        onDeleteAward?.(currentAward.id);
                      }
                    }}
                    className="px-3.5 py-2.5 bg-rose-600/90 hover:bg-rose-700 text-white rounded-xl font-bold text-xs sm:text-sm shadow-lg flex items-center gap-1.5 transition-all transform active:scale-95"
                    title={isBangla ? 'রেকর্ড মুছে ফেলুন' : 'Delete Award'}
                  >
                    <span>🗑️</span>
                    <span>{isBangla ? 'মুছে ফেলুন' : 'Delete'}</span>
                  </button>
                )}
                {currentAward && (
                  <button
                    onClick={() => openAddModal(currentAward)}
                    className="px-3.5 py-2.5 bg-amber-600/90 hover:bg-amber-700 text-white rounded-xl font-bold text-xs sm:text-sm shadow-lg flex items-center gap-1.5 transition-all transform active:scale-95 border border-white/20"
                    title={isBangla ? 'রেকর্ড এডিট করুন' : 'Edit Award'}
                  >
                    <span>✏️</span>
                    <span>{isBangla ? 'এডিট করুন' : 'Edit'}</span>
                  </button>
                )}
                <button
                  onClick={() => openAddModal()}
                  className="px-4 py-2.5 bg-white text-gray-900 hover:bg-amber-50 rounded-xl font-bold text-xs sm:text-sm shadow-lg flex items-center gap-2 transition-all transform active:scale-95"
                >
                  <span>✨</span>
                  <span>{isBangla ? 'নতুন রেকর্ড যোগ করুন' : 'Add New Record'}</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Time Period Tabs: Today, Weekly, Monthly, Season */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-gray-200 dark:border-gray-700">
        {[
          { id: 'today', label: isBangla ? '⚡ আজকের সেরা (Today)' : 'Today', icon: '⚡' },
          { id: 'weekly', label: isBangla ? '📅 সাপ্তাহিক সেরা (Weekly)' : 'Weekly', icon: '📅' },
          { id: 'monthly', label: isBangla ? '🏆 মাসিক সেরা (Monthly)' : 'Monthly', icon: '🏆' },
          { id: 'season', label: isBangla ? '👑 সিজন সেরা (Season)' : 'Season', icon: '👑' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActivePeriod(tab.id as AwardPeriod)}
            className={`px-4 py-2.5 font-bold text-xs sm:text-sm rounded-xl transition-all whitespace-nowrap flex items-center gap-2 border ${
              activePeriod === tab.id
                ? 'bg-amber-600 text-white border-amber-600 shadow-md scale-[1.02]'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Main Showcase */}
      {currentAward ? (
        <div className="space-y-6">
          {/* Action & Status Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-gray-800 dark:to-gray-800/90 border border-amber-200/80 dark:border-amber-900/50 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-700 dark:text-amber-300 flex items-center justify-center text-xl shrink-0 font-bold">
                🏆
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-extrabold text-sm sm:text-base text-gray-900 dark:text-white">
                    {currentAward.periodLabel}
                  </h3>
                  <span className="px-2 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-black uppercase">
                    Live Record
                  </span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-300">
                  তারিখ: {currentAward.date} {currentAward.notes ? `• ${currentAward.notes}` : ''}
                </p>
              </div>
            </div>

            {isAdmin && (
              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button
                  onClick={() => openAddModal(currentAward)}
                  className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all active:scale-95"
                >
                  <span>✏️</span>
                  <span>{isBangla ? 'এডিট করুন' : 'Edit Award'}</span>
                </button>
                {onDeleteAward && (
                  <button
                    onClick={() => {
                      if (window.confirm(isBangla ? 'আপনি কি নিশ্চিত যে এই সেরা তারকার রেকর্ডটি মুছে ফেলতে চান?' : 'Are you sure you want to delete this award record?')) {
                        onDeleteAward(currentAward.id);
                      }
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 font-bold text-xs border border-rose-300 dark:border-rose-800 flex items-center gap-1.5 transition-all active:scale-95"
                  >
                    <span>🗑️</span>
                    <span>{isBangla ? 'মুছে ফেলুন' : 'Delete'}</span>
                  </button>
                )}
              </div>
            )}
          </div>
          {/* Section 1: Best Player & Best Team Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Best Player Card */}
            {currentAward.bestPlayer && (
              <div className="rounded-2xl bg-white dark:bg-gray-800 border-2 border-amber-400 dark:border-amber-500/40 shadow-xl overflow-hidden flex flex-col">
                {/* Card Header Badge */}
                <div className="bg-gradient-to-r from-amber-500 to-amber-600 p-4 text-white flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-sm">
                    <span className="text-xl">🎖️</span>
                    <span>
                      {isBangla ? 'সেরা খেলোয়াড় (Best Player)' : 'Best Player'}
                    </span>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-extrabold uppercase border border-white/20">
                    {currentAward.bestPlayer.awardBadge || 'MVP'}
                  </span>
                </div>

                <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
                    {/* Player Avatar */}
                    <div className="relative group flex-shrink-0">
                      <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden bg-gradient-to-tr from-amber-400 to-orange-500 p-1 shadow-lg">
                        {currentAward.bestPlayer.avatar ? (
                          <img
                            src={currentAward.bestPlayer.avatar}
                            alt={currentAward.bestPlayer.name}
                            className="w-full h-full object-cover rounded-xl"
                          />
                        ) : (
                          <div className="w-full h-full rounded-xl bg-slate-900 flex items-center justify-center text-4xl">
                            {currentAward.bestPlayer.sport === 'cricket'
                              ? '🏏'
                              : currentAward.bestPlayer.sport === 'football'
                              ? '⚽'
                              : '🏸'}
                          </div>
                        )}
                      </div>
                      <div className="absolute -bottom-2 -right-2 bg-amber-500 text-white rounded-full px-2 py-0.5 text-[10px] font-black shadow border border-white">
                        ID #{currentAward.bestPlayer.memberCode}
                      </div>
                    </div>

                    {/* Player Info */}
                    <div className="text-center sm:text-left flex-1">
                      <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                        <span className="px-2.5 py-0.5 rounded-md bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 font-mono font-bold text-xs">
                          #{currentAward.bestPlayer.memberCode}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-semibold capitalize">
                          {currentAward.bestPlayer.sport}
                        </span>
                        {onSelectMemberForSearch && (
                          <button
                            onClick={() =>
                              onSelectMemberForSearch(currentAward.bestPlayer!.memberCode)
                            }
                            className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-bold"
                          >
                            🔍 পূর্ণ স্ট্যাটাস দেখুন
                          </button>
                        )}
                      </div>

                      <h2 className="text-2xl font-black text-gray-900 dark:text-white mt-1">
                        {currentAward.bestPlayer.banglaName || currentAward.bestPlayer.name}
                      </h2>
                      {currentAward.bestPlayer.banglaName && (
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {currentAward.bestPlayer.name}
                        </p>
                      )}

                      {/* Best Score Highlight Box */}
                      <div className="mt-3 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40">
                        <div className="text-[11px] font-semibold text-amber-800 dark:text-amber-300 uppercase">
                          {isBangla ? 'ম্যাচ সেরা স্কোর / পারফরম্যান্স' : 'Best Performance & Score'}
                        </div>
                        <div className="text-lg font-black text-amber-900 dark:text-amber-200 mt-0.5">
                          {currentAward.bestPlayer.bestScoreText}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Stats Bar */}
                  <div className="mt-5 pt-4 border-t border-gray-100 dark:border-gray-700 grid grid-cols-2 gap-3 text-center">
                    <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-700/40">
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {isBangla ? 'ম্যাচ খেলেছে' : 'Matches Played'}
                      </div>
                      <div className="text-base font-extrabold text-gray-900 dark:text-white">
                        {currentAward.bestPlayer.matchesPlayed} টি
                      </div>
                    </div>
                    <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/30">
                      <div className="text-xs text-emerald-700 dark:text-emerald-400">
                        {isBangla ? 'অপরাজিত জয়' : 'Matches Won'}
                      </div>
                      <div className="text-base font-extrabold text-emerald-700 dark:text-emerald-400">
                        {currentAward.bestPlayer.matchesWon} টি
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Best Team Card */}
            {currentAward.bestTeam && (
              <div className="rounded-2xl bg-white dark:bg-gray-800 border-2 border-orange-400 dark:border-orange-500/40 shadow-xl overflow-hidden flex flex-col">
                {/* Card Header Badge */}
                <div className="bg-gradient-to-r from-orange-500 to-rose-500 p-4 text-white flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-sm">
                    <span className="text-xl">🛡️</span>
                    <span>
                      {isBangla ? 'সেরা দল (Best Team)' : 'Best Team'}
                    </span>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-extrabold uppercase border border-white/20">
                    {currentAward.bestTeam.achievementTitle || 'Champions'}
                  </span>
                </div>

                <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
                    {/* Team Logo / Image */}
                    <div className="relative group flex-shrink-0">
                      <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden bg-gradient-to-tr from-orange-400 to-rose-500 p-1 shadow-lg flex items-center justify-center">
                        {currentAward.bestTeam.logo ? (
                          <img
                            src={currentAward.bestTeam.logo}
                            alt={currentAward.bestTeam.teamName}
                            className="w-full h-full object-cover rounded-xl"
                          />
                        ) : (
                          <div className="w-full h-full rounded-xl bg-slate-900 flex items-center justify-center text-4xl">
                            🛡️
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Team Details */}
                    <div className="text-center sm:text-left flex-1">
                      <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                        <span className="px-2 py-0.5 rounded-md bg-orange-100 dark:bg-orange-900/40 text-orange-800 dark:text-orange-300 text-xs font-semibold capitalize">
                          {currentAward.bestTeam.sport}
                        </span>
                        {currentAward.bestTeam.memberCodes && (
                          <span className="px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-mono font-bold">
                            আইডি: {currentAward.bestTeam.memberCodes.map((c) => `#${c}`).join(', ')}
                          </span>
                        )}
                      </div>

                      <h2 className="text-2xl font-black text-gray-900 dark:text-white mt-1">
                        {currentAward.bestTeam.teamName}
                      </h2>
                      <p className="text-xs text-gray-600 dark:text-gray-300 font-medium mt-0.5">
                        👥 স্কোয়াড: {currentAward.bestTeam.playerNames}
                      </p>

                      {/* Best Score Highlight Box */}
                      <div className="mt-3 p-3 rounded-xl bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800/40">
                        <div className="text-[11px] font-semibold text-orange-800 dark:text-orange-300 uppercase">
                          {isBangla ? 'দলের সেরা স্কোরলাইন' : 'Best Team Score'}
                        </div>
                        <div className="text-lg font-black text-orange-900 dark:text-orange-200 mt-0.5">
                          {currentAward.bestTeam.bestScoreText}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Stats Bar */}
                  <div className="mt-5 pt-4 border-t border-gray-100 dark:border-gray-700 grid grid-cols-2 gap-3 text-center">
                    <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-700/40">
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {isBangla ? 'ম্যাচ খেলেছে' : 'Matches Played'}
                      </div>
                      <div className="text-base font-extrabold text-gray-900 dark:text-white">
                        {currentAward.bestTeam.matchesPlayed} টি
                      </div>
                    </div>
                    <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/30">
                      <div className="text-xs text-emerald-700 dark:text-emerald-400">
                        {isBangla ? 'অপরাজিত জয়' : 'Matches Won'}
                      </div>
                      <div className="text-base font-extrabold text-emerald-700 dark:text-emerald-400">
                        {currentAward.bestTeam.matchesWon} টি
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Section 2: Best Score Banner (সর্বোচ্চ স্কোর ও রেকর্ড) */}
          {currentAward.bestScore && (
            <div className="rounded-2xl bg-gradient-to-br from-indigo-900 via-slate-900 to-purple-950 p-6 text-white border-2 border-indigo-500/30 shadow-xl relative overflow-hidden">
              <div className="absolute right-4 bottom-2 text-8xl opacity-10 select-none pointer-events-none">
                🎯
              </div>
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="space-y-2 text-center md:text-left">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/30 text-indigo-300 text-xs font-bold border border-indigo-500/40">
                    <span>⚡</span>
                    <span>{currentAward.bestScore.title}</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black">
                    {currentAward.bestScore.achievedBy}
                  </h3>
                  {currentAward.bestScore.opponent && (
                    <p className="text-xs text-indigo-200">
                      বনাম {currentAward.bestScore.opponent} • তারিখ: {currentAward.bestScore.date}
                    </p>
                  )}
                  {currentAward.bestScore.notes && (
                    <p className="text-xs text-gray-300 italic max-w-lg">
                      "{currentAward.bestScore.notes}"
                    </p>
                  )}
                </div>

                <div className="flex flex-col items-center justify-center p-4 sm:p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 min-w-[200px] text-center shadow-inner">
                  <span className="text-xs font-bold tracking-wider text-indigo-200 uppercase">
                    {isBangla ? 'সর্বোচ্চ স্কোর' : 'Record Score'}
                  </span>
                  <span className="text-3xl sm:text-4xl font-black text-amber-300 my-1 font-mono">
                    {currentAward.bestScore.score}
                  </span>
                  <span className="text-[11px] text-gray-300 capitalize">
                    {currentAward.bestScore.sport} Match
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-8 shadow-sm">
          <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-3xl">
            🏆
          </div>
          <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">
            {isBangla
              ? `${activePeriod === 'today' ? 'আজকের' : activePeriod === 'weekly' ? 'এই সপ্তাহের' : 'এই মাসের'} কোনো রেকর্ড যুক্ত নেই`
              : `No ${activePeriod} record recorded yet`}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-sm mx-auto">
            {isBangla
              ? 'অ্যাডমিন প্যানেল থেকে সেরা খেলোয়াড়, সেরা দল এবং সর্বোচ্চ স্কোরের রেকর্ড যুক্ত করুন।'
              : 'Add the best team, player and scores to showcase on this leaderboard.'}
          </p>
          {isAdmin && (
            <button
              onClick={() => openAddModal()}
              className="mt-4 px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow transition-colors"
            >
              + রেকর্ড তৈরি করুন
            </button>
          )}
        </div>
      )}

      {/* All Awards / Records History for Active Period */}
      {(() => {
        const periodAwards = awards.filter((a) => a.period === activePeriod);
        if (periodAwards.length > 0) {
          return (
            <div className="rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-extrabold text-sm text-gray-800 dark:text-gray-200 flex items-center gap-2">
                  <span>📜</span>
                  <span>{isBangla ? 'এই ক্যাটাগরির সমস্ত রেকর্ডের তালিকা' : 'All Records in this Category'}</span>
                  <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-xs font-bold font-mono">
                    {periodAwards.length} টি
                  </span>
                </h4>
              </div>

              <div className="divide-y divide-gray-100 dark:divide-gray-700/60">
                {periodAwards.map((aw) => (
                  <div key={aw.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 flex items-center justify-center font-bold text-lg shrink-0 overflow-hidden border border-amber-300 dark:border-amber-700">
                        {aw.bestPlayer?.avatar ? (
                          <img src={aw.bestPlayer.avatar} alt="" className="w-full h-full object-cover" />
                        ) : (
                          '🎖️'
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-sm text-gray-900 dark:text-white">
                            {aw.bestPlayer?.banglaName || aw.bestPlayer?.name || aw.bestTeam?.teamName || aw.periodLabel}
                          </span>
                          {aw.bestPlayer?.awardBadge && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300">
                              {aw.bestPlayer.awardBadge}
                            </span>
                          )}
                          <span className="text-xs text-gray-400 font-mono">#{aw.bestPlayer?.memberCode}</span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          তারিখ: {aw.date} {aw.bestPlayer?.bestScoreText ? `• স্কোর: ${aw.bestPlayer.bestScoreText}` : ''}
                        </p>
                      </div>
                    </div>

                    {isAdmin && (
                      <div className="flex items-center gap-2 self-end sm:self-auto">
                        <button
                          onClick={() => openAddModal(aw)}
                          className="px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 hover:bg-amber-100 text-xs font-bold border border-amber-200 dark:border-amber-800 flex items-center gap-1"
                        >
                          <span>✏️</span>
                          <span>{isBangla ? 'এডিট' : 'Edit'}</span>
                        </button>
                        {onDeleteAward && (
                          <button
                            onClick={() => {
                              if (window.confirm(isBangla ? 'আপনি কি নিশ্চিত যে এই রেকর্ডটি মুছে ফেলতে চান?' : 'Are you sure you want to delete this record?')) {
                                onDeleteAward(aw.id);
                              }
                            }}
                            className="px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 hover:bg-rose-100 text-xs font-bold border border-rose-200 dark:border-rose-800 flex items-center gap-1"
                          >
                            <span>🗑️</span>
                            <span>{isBangla ? 'মুছুন' : 'Delete'}</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        }
        return null;
      })()}

      {/* Admin Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-3xl bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden my-4 max-h-[92vh] flex flex-col">
            <div className="p-4 sm:p-5 bg-gradient-to-r from-amber-600 to-orange-600 text-white flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-xl">
                  🏆
                </div>
                <div>
                  <h2 className="text-lg font-bold">
                    {isBangla ? 'সেরা দল, খেলোয়াড় ও স্কোর রেকর্ড ফরম' : 'Award & Leaderboard Entry'}
                  </h2>
                  <p className="text-xs text-amber-100">
                    {isBangla
                      ? 'আজকের, সাপ্তাহিক বা মাসিক সেরা পারফরমার নির্ধারণ করুন'
                      : 'Define champions for today, weekly or monthly'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
              {/* Period selection */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    সময়কাল / ক্যাটাগরি *
                  </label>
                  <select
                    value={formPeriod}
                    onChange={(e) => {
                      const p = e.target.value as AwardPeriod;
                      setFormPeriod(p);
                      setFormPeriodLabel(
                        p === 'today'
                          ? "Today's Champions (আজকের সেরা)"
                          : p === 'weekly'
                          ? 'Weekly Champions (সাপ্তাহিক সেরা)'
                          : p === 'monthly'
                          ? 'Monthly Champions (মাসিক সেরা)'
                          : 'Season Champions (সিজন সেরা)'
                      );
                    }}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl text-sm font-semibold"
                  >
                    <option value="today">⚡ আজকের সেরা (Today)</option>
                    <option value="weekly">📅 সাপ্তাহিক সেরা (Weekly)</option>
                    <option value="monthly">🏆 মাসিক সেরা (Monthly)</option>
                    <option value="season">👑 সিজন সেরা (Season)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    লেবেল / শিরোনাম
                  </label>
                  <input
                    type="text"
                    value={formPeriodLabel}
                    onChange={(e) => setFormPeriodLabel(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    তারিখ
                  </label>
                  <input
                    type="text"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl text-sm"
                  />
                </div>
              </div>

              {/* SECTION 1: BEST PLAYER */}
              <div className="p-4 rounded-xl border-2 border-amber-200 dark:border-amber-900/40 bg-amber-50/40 dark:bg-amber-950/10 space-y-4">
                <div className="flex items-center justify-between border-b border-amber-200 dark:border-amber-900/40 pb-2">
                  <h3 className="font-extrabold text-amber-900 dark:text-amber-300 text-sm flex items-center gap-2">
                    <span>🎖️</span>
                    <span>১. সেরা খেলোয়াড় (Best Player)</span>
                  </h3>
                  <span className="text-xs text-gray-500">৪ সংখ্যার আইডি ভিত্তিক</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Select Member by 4-digit ID or Name */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                      সদস্য নির্বাচন করুন (৪ সংখ্যার আইডি সহ) *
                    </label>
                    <select
                      value={playerMemberId}
                      onChange={(e) => {
                        const newId = e.target.value;
                        setPlayerMemberId(newId);
                        const m = members.find((mem) => mem.id === newId);
                        if (m?.avatar) {
                          setPlayerAvatar(m.avatar);
                        } else {
                          setPlayerAvatar(undefined);
                        }
                      }}
                      className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl text-sm font-semibold"
                    >
                      {members.map((m) => (
                        <option key={m.id} value={m.id}>
                          #{m.memberCode} - {m.banglaName || m.name} ({m.role}) {m.avatar ? '📸' : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Sport */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                      খেলা
                    </label>
                    <select
                      value={playerSport}
                      onChange={(e) => setPlayerSport(e.target.value as SportType)}
                      className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl text-sm"
                    >
                      <option value="badminton">🏸 ব্যাডমিন্টন</option>
                      <option value="cricket">🏏 ক্রিকেট</option>
                      <option value="football">⚽ ফুটবল</option>
                      <option value="multi">🌟 অল-রাউন্ডার</option>
                    </select>
                  </div>

                  {/* Player Image Upload */}
                  <div className="sm:col-span-2 flex flex-col sm:flex-row sm:items-center gap-4 p-3.5 rounded-2xl bg-white/90 dark:bg-gray-900/80 border border-amber-300/80 dark:border-amber-800/60 shadow-sm">
                    <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-200 dark:bg-slate-700 flex items-center justify-center border-2 border-amber-400 dark:border-amber-600 shrink-0 shadow">
                      {playerAvatar ? (
                        <img
                          src={playerAvatar}
                          alt="Player Preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-3xl">👤</span>
                      )}
                    </div>
                    <div className="flex-1 space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <button
                          type="button"
                          onClick={() => playerImageRef.current?.click()}
                          className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow transition-all active:scale-95"
                        >
                          📷 কাস্টম ছবি আপলোড করুন
                        </button>
                        {(() => {
                          const sel = members.find((m) => m.id === playerMemberId);
                          if (sel?.avatar && playerAvatar !== sel.avatar) {
                            return (
                              <button
                                type="button"
                                onClick={() => setPlayerAvatar(sel.avatar)}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow transition-all active:scale-95"
                              >
                                🔄 সদস্যের মূল প্রোফাইল ছবি নিন
                              </button>
                            );
                          }
                          return null;
                        })()}
                        {playerAvatar && (
                          <button
                            type="button"
                            onClick={() => setPlayerAvatar(undefined)}
                            className="px-2.5 py-1.5 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-xl text-xs font-bold transition-all"
                          >
                            ❌ ছবি সরান
                          </button>
                        )}
                      </div>
                      <input
                        ref={playerImageRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handlePlayerPhotoUpload}
                      />
                      {(() => {
                        const sel = members.find((m) => m.id === playerMemberId);
                        if (sel?.avatar && playerAvatar === sel.avatar) {
                          return (
                            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1.5">
                              <span>✅</span>
                              <span>নির্বাচিত সদস্যের নিজস্ব প্রোফাইল ছবি স্বয়ংক্রিয়ভাবে যুক্ত হয়েছে (আলাদা আপলোডের প্রয়োজন নেই)</span>
                            </p>
                          );
                        }
                        return (
                          <p className="text-[11px] text-gray-500 dark:text-gray-400">
                            {sel?.avatar
                              ? 'সদস্যের নিজস্ব প্রোফাইল ছবি আছে। চাইলে উপরে বোতাম চেপে কাস্টম ছবিও দিতে পারেন।'
                              : '💡 এই সদস্যের কোনো প্রোফাইল ছবি নেই। আপনি চাইলে নতুন ছবি আপলোড করে দিতে পারেন।'}
                          </p>
                        );
                      })()}
                    </div>
                  </div>

                  {/* Best Score Text */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                      সেরা স্কোর / ম্যাচ ফিগার *
                    </label>
                    <input
                      type="text"
                      value={playerScoreText}
                      onChange={(e) => setPlayerScoreText(e.target.value)}
                      placeholder="যেমন: 21-14, 21-11 অথবা ৬৮* রান ও ৩ উইকেট"
                      className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl text-sm"
                      required
                    />
                  </div>

                  {/* Award Title */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                      সম্মাননা পদক / টাইটেল
                    </label>
                    <input
                      type="text"
                      value={playerBadge}
                      onChange={(e) => setPlayerBadge(e.target.value)}
                      placeholder="যেমন: MVP / ম্যান অব দ্য ম্যাচ / গোল্ডেন বুট"
                      className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 2: BEST TEAM */}
              <div className="p-4 rounded-xl border-2 border-orange-200 dark:border-orange-900/40 bg-orange-50/40 dark:bg-orange-950/10 space-y-4">
                <div className="flex items-center justify-between border-b border-orange-200 dark:border-orange-900/40 pb-2">
                  <h3 className="font-extrabold text-orange-900 dark:text-orange-300 text-sm flex items-center gap-2">
                    <span>🛡️</span>
                    <span>২. সেরা দল (Best Team)</span>
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Team Name */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                      দলের নাম *
                    </label>
                    <input
                      type="text"
                      value={teamName}
                      onChange={(e) => setTeamName(e.target.value)}
                      placeholder="যেমন: Smash Brothers / ঢাকা কিংস"
                      className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl text-sm font-semibold"
                      required
                    />
                  </div>

                  {/* Team Sport */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                      খেলা
                    </label>
                    <select
                      value={teamSport}
                      onChange={(e) => setTeamSport(e.target.value as SportType)}
                      className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl text-sm"
                    >
                      <option value="badminton">🏸 ব্যাডমিন্টন</option>
                      <option value="cricket">🏏 ক্রিকেট</option>
                      <option value="football">⚽ ফুটবল</option>
                    </select>
                  </div>

                  {/* Team Logo Upload */}
                  <div className="sm:col-span-2 flex items-center gap-4">
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-700 flex items-center justify-center border border-gray-300 dark:border-gray-600 flex-shrink-0">
                      {teamLogo ? (
                        <img
                          src={teamLogo}
                          alt="Team Preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-2xl">🛡️</span>
                      )}
                    </div>
                    <div>
                      <button
                        type="button"
                        onClick={() => teamImageRef.current?.click()}
                        className="px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-xs font-bold shadow"
                      >
                        📷 দলের ছবি / লোগো আপলোড
                      </button>
                      <input
                        ref={teamImageRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleTeamLogoUpload}
                      />
                      <p className="text-[11px] text-gray-500 mt-1">
                        দলের ফটো বা লোগো নির্বাচন করুন
                      </p>
                    </div>
                  </div>

                  {/* Player Names */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                      দলের খেলোয়াড়দের নাম
                    </label>
                    <input
                      type="text"
                      value={teamPlayerNames}
                      onChange={(e) => setTeamPlayerNames(e.target.value)}
                      placeholder="যেমন: তানভীর আহমেদ ও রাকিব হাসান"
                      className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl text-sm"
                    />
                  </div>

                  {/* Member Codes */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                      খেলোয়াড়দের ৪ সংখ্যার আইডি (কমা দিয়ে আলাদা করুন)
                    </label>
                    <input
                      type="text"
                      value={teamMemberCodes}
                      onChange={(e) => setTeamMemberCodes(e.target.value)}
                      placeholder="যেমন: 1001, 1002"
                      className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl text-sm font-mono"
                    />
                  </div>

                  {/* Best Team Score */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                      দলের সেরা স্কোরলাইন *
                    </label>
                    <input
                      type="text"
                      value={teamScoreText}
                      onChange={(e) => setTeamScoreText(e.target.value)}
                      placeholder="যেমন: 21-12, 21-18 অথবা ১৯৪/৩"
                      className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl text-sm"
                      required
                    />
                  </div>

                  {/* Team Title */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                      অর্জন / খেতাব
                    </label>
                    <input
                      type="text"
                      value={teamTitle}
                      onChange={(e) => setTeamTitle(e.target.value)}
                      placeholder="যেমন: অপরাজিত চ্যাম্পিয়ন"
                      className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 3: BEST SCORE */}
              <div className="p-4 rounded-xl border-2 border-indigo-200 dark:border-indigo-900/40 bg-indigo-50/40 dark:bg-indigo-950/10 space-y-4">
                <div className="flex items-center justify-between border-b border-indigo-200 dark:border-indigo-900/40 pb-2">
                  <h3 className="font-extrabold text-indigo-900 dark:text-indigo-300 text-sm flex items-center gap-2">
                    <span>🎯</span>
                    <span>৩. সেরা স্কোর ও রেকর্ড ম্যাচ (Best Score Record)</span>
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                      রেকর্ড স্কোরলাইন *
                    </label>
                    <input
                      type="text"
                      value={scoreValue}
                      onChange={(e) => setScoreValue(e.target.value)}
                      placeholder="যেমন: 21-08 অথবা ১৯৪/৩ অথবা ৫-১"
                      className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl text-sm font-mono font-bold"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                      রেকর্ড অর্জনকারী (খেলোয়াড় বা দল) *
                    </label>
                    <input
                      type="text"
                      value={scoreAchievedBy}
                      onChange={(e) => setScoreAchievedBy(e.target.value)}
                      placeholder="যেমন: মেহেদী হাসান (আইডি: 1003)"
                      className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl text-sm"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                      বিপক্ষ প্রতিদ্বন্দী দল / খেলোয়াড়
                    </label>
                    <input
                      type="text"
                      value={scoreOpponent}
                      onChange={(e) => setScoreOpponent(e.target.value)}
                      placeholder="যেমন: থান্ডার শাটলার্স"
                      className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                      রেকর্ডের বিবরণ / নোট
                    </label>
                    <input
                      type="text"
                      value={scoreNotes}
                      onChange={(e) => setScoreNotes(e.target.value)}
                      placeholder="যেমন: মাত্র ৮ পয়েন্ট দিয়ে প্রতিপক্ষকে অলআউট"
                      className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-between gap-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                {editingAward && onDeleteAward ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm(isBangla ? 'আপনি কি নিশ্চিত যে এই সেরা তারকার রেকর্ডটি মুছে ফেলতে চান?' : 'Are you sure you want to delete this award record?')) {
                        onDeleteAward(editingAward.id);
                        setIsModalOpen(false);
                      }
                    }}
                    className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 rounded-xl text-xs font-bold border border-rose-300 dark:border-rose-800 flex items-center gap-1.5 transition-all"
                  >
                    <span>🗑️</span>
                    <span>{isBangla ? 'রেকর্ড মুছুন' : 'Delete Record'}</span>
                  </button>
                ) : (
                  <div />
                )}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 rounded-xl text-xs font-bold text-gray-700 dark:text-gray-200"
                  >
                    {isBangla ? 'বাতিল' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-lg"
                  >
                    {isBangla ? '✓ সংরক্ষণ করুন' : '✓ Save Record'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

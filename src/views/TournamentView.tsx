import React, { useState } from 'react';
import { Tournament, TournamentTeam, TournamentMatch } from '../types';
import { translations, Language, formatCurrency, formatNumber } from '../utils/language';
import {
  Swords,
  Plus,
  Trophy,
  Calendar,
  MapPin,
  Users,
  CheckCircle2,
  Clock,
  Trash2,
  X,
  Share2,
  UserCheck,
  Check,
  Shield,
  Medal,
} from 'lucide-react';

interface Props {
  tournaments: Tournament[];
  lang: Language;
  isAdmin: boolean;
  onSaveTournament: (tournament: Tournament) => void;
  onDeleteTournament: (id: string) => void;
  onUpdateTournaments: (tournaments: Tournament[]) => void;
}

export const TournamentView: React.FC<Props> = ({
  tournaments,
  lang,
  isAdmin,
  onSaveTournament,
  onDeleteTournament,
  onUpdateTournaments,
}) => {
  const isBangla = lang === 'bn';
  const [selectedTourneyId, setSelectedTourneyId] = useState<string>(
    tournaments[0]?.id || ''
  );
  const [showAddModal, setShowAddModal] = useState(false);
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [showMatchModal, setShowMatchModal] = useState(false);

  // New Tournament Form State
  const [title, setTitle] = useState('');
  const [titleBangla, setTitleBangla] = useState('');
  const [venue, setVenue] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [entryFee, setEntryFee] = useState<number>(1000);
  const [prizePool, setPrizePool] = useState('৳20,000');
  const [notes, setNotes] = useState('');

  // New Team Form State
  const [teamName, setTeamName] = useState('');
  const [player1, setPlayer1] = useState('');
  const [player2, setPlayer2] = useState('');
  const [phone, setPhone] = useState('+880');
  const [isPaid, setIsPaid] = useState(true);

  // New Match Form State
  const [matchRound, setMatchRound] = useState('Quarter-Final');
  const [matchTeam1, setMatchTeam1] = useState('');
  const [matchTeam2, setMatchTeam2] = useState('');
  const [court, setCourt] = useState('Court 1');
  const [matchTime, setMatchTime] = useState('06:00 PM');

  const selectedTourney =
    tournaments.find((t) => t.id === selectedTourneyId) || tournaments[0];

  const handleCreateTournament = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newTourney: Tournament = {
      id: `tourney-${Date.now()}`,
      title: title.trim(),
      titleBangla: titleBangla.trim() || undefined,
      venue: venue.trim() || 'Club Court',
      startDate: startDate || new Date().toLocaleDateString('en-GB'),
      endDate: endDate || new Date().toLocaleDateString('en-GB'),
      entryFee: Number(entryFee) || 0,
      prizePool: prizePool.trim() || '৳15,000',
      status: 'REGISTRATION_OPEN',
      teams: [],
      matches: [],
      notes: notes.trim() || undefined,
    };

    onSaveTournament(newTourney);
    setSelectedTourneyId(newTourney.id);
    setShowAddModal(false);
    setTitle('');
    setTitleBangla('');
    setVenue('');
    setNotes('');
  };

  const handleAddTeam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTourney || !teamName.trim() || !player1.trim()) return;

    const newTeam: TournamentTeam = {
      id: `tm-${Date.now()}`,
      name: teamName.trim(),
      player1: player1.trim(),
      player2: player2.trim() || undefined,
      phone: phone.trim() || '+880',
      registrationFee: selectedTourney.entryFee,
      isPaid,
    };

    const updated = tournaments.map((t) =>
      t.id === selectedTourney.id
        ? { ...t, teams: [...t.teams, newTeam] }
        : t
    );

    onUpdateTournaments(updated);
    setShowTeamModal(false);
    setTeamName('');
    setPlayer1('');
    setPlayer2('');
    setPhone('+880');
  };

  const handleAddMatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTourney || !matchTeam1.trim() || !matchTeam2.trim()) return;

    const newMatch: TournamentMatch = {
      id: `match-${Date.now()}`,
      round: matchRound,
      team1: matchTeam1.trim(),
      team2: matchTeam2.trim(),
      court,
      time: matchTime,
      status: 'SCHEDULED',
    };

    const updated = tournaments.map((t) =>
      t.id === selectedTourney.id
        ? { ...t, matches: [...t.matches, newMatch] }
        : t
    );

    onUpdateTournaments(updated);
    setShowMatchModal(false);
  };

  const handleTogglePaymentStatus = (tourneyId: string, teamId: string) => {
    const updated = tournaments.map((t) => {
      if (t.id !== tourneyId) return t;
      return {
        ...t,
        teams: t.teams.map((tm) =>
          tm.id === teamId ? { ...tm, isPaid: !tm.isPaid } : tm
        ),
      };
    });
    onUpdateTournaments(updated);
  };

  const handleUpdateMatchWinner = (
    tourneyId: string,
    matchId: string,
    winner: string,
    score1: number,
    score2: number
  ) => {
    const updated = tournaments.map((t) => {
      if (t.id !== tourneyId) return t;
      return {
        ...t,
        matches: t.matches.map((m) =>
          m.id === matchId
            ? {
                ...m,
                status: 'COMPLETED' as const,
                winner,
                scoreTeam1: score1,
                scoreTeam2: score2,
              }
            : m
        ),
      };
    });
    onUpdateTournaments(updated);
  };

  const handleDeleteTeam = (tourneyId: string, teamId: string) => {
    const updated = tournaments.map((t) => {
      if (t.id !== tourneyId) return t;
      return {
        ...t,
        teams: t.teams.filter((tm) => tm.id !== teamId),
      };
    });
    onUpdateTournaments(updated);
  };

  const totalCollectedFee = selectedTourney
    ? selectedTourney.teams
        .filter((tm) => tm.isPaid)
        .reduce((sum, tm) => sum + tm.registrationFee, 0)
    : 0;

  return (
    <div className="space-y-5 pb-24">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Swords className="w-6 h-6 text-emerald-600" />
            <span>{isBangla ? 'টুর্নামেন্ট বুকিং ও ম্যানেজমেন্ট' : 'Tournament Management'}</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {isBangla
              ? 'টুর্নামেন্ট আয়োজন, টিম এন্ট্রি বুকিং, ফিক্সচার শিডিউল ও ফলাফল ট্র্যাকিং'
              : 'Organize tournaments, team booking, fixtures scheduling and prize tracking'}
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>{isBangla ? 'নতুন টুর্নামেন্ট তৈরি' : 'Create Tournament'}</span>
          </button>
        )}
      </div>

      {/* Tournament Selector Tabs */}
      {tournaments.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {tournaments.map((t) => (
            <button
              key={t.id}
              onClick={() => setSelectedTourneyId(t.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                t.id === selectedTourney?.id
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm shadow-emerald-600/20'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-300'
              }`}
            >
              {isBangla && t.titleBangla ? t.titleBangla : t.title}
            </button>
          ))}
        </div>
      )}

      {selectedTourney ? (
        <div className="space-y-5">
          {/* Banner Card */}
          <div className="rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-800 text-white p-6 shadow-lg shadow-emerald-700/20 relative overflow-hidden">
            <div className="absolute right-0 bottom-0 opacity-10 text-9xl translate-x-4 translate-y-6 pointer-events-none">
              🏸
            </div>
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-white/20 text-white backdrop-blur-md">
                    {selectedTourney.status.replace('_', ' ')}
                  </span>
                  <span className="text-xs text-emerald-100 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {selectedTourney.startDate} - {selectedTourney.endDate}
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black">
                  {isBangla && selectedTourney.titleBangla
                    ? selectedTourney.titleBangla
                    : selectedTourney.title}
                </h3>
                <p className="text-xs text-emerald-100 mt-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {selectedTourney.venue}
                </p>
                {selectedTourney.notes && (
                  <p className="text-xs text-emerald-200/90 mt-2 bg-black/15 px-3 py-1.5 rounded-lg max-w-xl">
                    ℹ️ {selectedTourney.notes}
                  </p>
                )}
              </div>

              {/* Quick Metrics */}
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md p-3.5 rounded-xl border border-white/20">
                <div>
                  <span className="text-[10px] text-emerald-200 block uppercase tracking-wider">
                    {isBangla ? 'প্রাইজমানি' : 'Prize Pool'}
                  </span>
                  <span className="text-base font-black text-amber-300">
                    {selectedTourney.prizePool}
                  </span>
                </div>
                <div className="w-px h-8 bg-white/20" />
                <div>
                  <span className="text-[10px] text-emerald-200 block uppercase tracking-wider">
                    {isBangla ? 'টিম এন্ট্রি ফি' : 'Entry Fee'}
                  </span>
                  <span className="text-base font-black">
                    {formatCurrency(selectedTourney.entryFee, isBangla)}
                  </span>
                </div>
                <div className="w-px h-8 bg-white/20" />
                <div>
                  <span className="text-[10px] text-emerald-200 block uppercase tracking-wider">
                    {isBangla ? 'টিম ফান্ড' : 'Collected'}
                  </span>
                  <span className="text-base font-black text-emerald-200">
                    {formatCurrency(totalCollectedFee, isBangla)}
                  </span>
                </div>
              </div>
            </div>

            {isAdmin && (
              <div className="mt-4 pt-3 border-t border-white/15 flex justify-end">
                <button
                  onClick={() => {
                    if (
                      confirm(
                        isBangla
                          ? 'আপনি কি নিশ্চিত যে এই টুর্নামেন্টটি মুছে ফেলতে চান?'
                          : 'Are you sure you want to delete this tournament?'
                      )
                    ) {
                      onDeleteTournament(selectedTourney.id);
                    }
                  }}
                  className="text-xs text-rose-200 hover:text-white flex items-center gap-1 bg-black/20 hover:bg-rose-600/60 px-3 py-1.5 rounded-lg transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{isBangla ? 'টুর্নামেন্ট মুছুন' : 'Delete Tournament'}</span>
                </button>
              </div>
            )}
          </div>

          {/* Teams Registration & Booking Section */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Users className="w-4 h-4 text-emerald-600" />
                  <span>{isBangla ? 'নিবন্ধিত টিমসমূহ' : 'Registered Teams'}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                    {formatNumber(selectedTourney.teams.length, isBangla)} {isBangla ? 'টি টিম' : 'teams'}
                  </span>
                </h4>
                <p className="text-xs text-slate-400">
                  {isBangla
                    ? 'টিমের রেজিস্ট্রেশন ফি পরিশোধ ও বুকিং স্ট্যাটাস'
                    : 'Team registration payment and slot booking'}
                </p>
              </div>

              {isAdmin && (
                <button
                  onClick={() => setShowTeamModal(true)}
                  className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900 font-bold text-xs flex items-center gap-1 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{isBangla ? 'টিম বুকিং / এন্ট্রি' : 'Register Team'}</span>
                </button>
              )}
            </div>

            {selectedTourney.teams.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs">
                {isBangla
                  ? 'এখনও কোনো টিম বুকিং করা হয়নি। "টিম বুকিং / এন্ট্রি" বাটনে ক্লিক করে টিম যুক্ত করুন।'
                  : 'No teams registered yet. Click "Register Team" to add.'}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {selectedTourney.teams.map((tm, idx) => (
                  <div
                    key={tm.id}
                    className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-black flex items-center justify-center text-xs">
                        #{idx + 1}
                      </div>
                      <div>
                        <span className="font-extrabold text-sm text-slate-900 dark:text-white block">
                          {tm.name}
                        </span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                          🏸 {tm.player1} {tm.player2 ? `& ${tm.player2}` : ''}
                        </span>
                        <span className="text-[10px] text-slate-400">📞 {tm.phone}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleTogglePaymentStatus(selectedTourney.id, tm.id)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-colors ${
                          tm.isPaid
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                            : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                        }`}
                        title={isBangla ? 'পেমেন্ট স্ট্যাটাস টগল করুন' : 'Toggle payment status'}
                      >
                        {tm.isPaid ? (
                          <>
                            <Check className="w-3 h-3" />
                            <span>{isBangla ? 'ফি পরিশোধিত' : 'Paid'}</span>
                          </>
                        ) : (
                          <span>{isBangla ? 'ফি বকেয়া' : 'Fee Due'}</span>
                        )}
                      </button>

                      {isAdmin && (
                        <button
                          onClick={() => handleDeleteTeam(selectedTourney.id, tm.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                          title="Remove Team"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Match Schedule & Fixtures */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-amber-500" />
                  <span>{isBangla ? 'ম্যাচ ফিক্সচার ও ফলাফল' : 'Matches & Results'}</span>
                </h4>
                <p className="text-xs text-slate-400">
                  {isBangla
                    ? 'কোর্ট নম্বর, শিডিউল সময় এবং স্কোরকার্ড'
                    : 'Court schedule, timings and live scores'}
                </p>
              </div>

              {isAdmin && (
                <button
                  onClick={() => setShowMatchModal(true)}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center gap-1 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{isBangla ? 'ম্যাচ শিডিউল যুক্ত করুন' : 'Add Match'}</span>
                </button>
              )}
            </div>

            {selectedTourney.matches.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs">
                {isBangla
                  ? 'এখনও কোনো ম্যাচ শিডিউল তৈরি করা হয়নি।'
                  : 'No matches scheduled yet.'}
              </div>
            ) : (
              <div className="space-y-3">
                {selectedTourney.matches.map((m) => (
                  <div
                    key={m.id}
                    className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-[11px] px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                          {m.round}
                        </span>
                        <span className="text-slate-400">
                          🏟️ {m.court} • ⏰ {m.time}
                        </span>
                        {m.status === 'COMPLETED' && (
                          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-1.5 py-0.5 rounded">
                            {isBangla ? 'সম্পন্ন' : 'Completed'}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 font-black text-sm text-slate-900 dark:text-white pt-1">
                        <span className={m.winner === m.team1 ? 'text-emerald-600 font-extrabold' : ''}>
                          {m.team1} {m.scoreTeam1 !== undefined ? `(${m.scoreTeam1})` : ''}
                        </span>
                        <span className="text-slate-400 text-xs font-normal">VS</span>
                        <span className={m.winner === m.team2 ? 'text-emerald-600 font-extrabold' : ''}>
                          {m.team2} {m.scoreTeam2 !== undefined ? `(${m.scoreTeam2})` : ''}
                        </span>
                      </div>
                    </div>

                    {m.status !== 'COMPLETED' && isAdmin ? (
                      <div className="flex items-center gap-1.5 self-end sm:self-auto">
                        <button
                          onClick={() => {
                            const s1 = prompt(`Score for ${m.team1}:`, '21');
                            const s2 = prompt(`Score for ${m.team2}:`, '19');
                            if (s1 !== null && s2 !== null) {
                              const score1 = Number(s1);
                              const score2 = Number(s2);
                              const winner = score1 > score2 ? m.team1 : m.team2;
                              handleUpdateMatchWinner(
                                selectedTourney.id,
                                m.id,
                                winner,
                                score1,
                                score2
                              );
                            }
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                        >
                          {isBangla ? 'ফলাফল এন্ট্রি' : 'Set Score'}
                        </button>
                      </div>
                    ) : (
                      m.winner && (
                        <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
                          <Medal className="w-4 h-4 text-amber-500" />
                          <span>Winner: {m.winner}</span>
                        </div>
                      )
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
          <p className="text-slate-500 mb-3 text-sm">
            {isBangla ? 'কোনো টুর্নামেন্ট যুক্ত করা নেই' : 'No tournaments created'}
          </p>
          {isAdmin && (
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs"
            >
              {isBangla ? 'প্রথম টুর্নামেন্ট তৈরি করুন' : 'Create First Tournament'}
            </button>
          )}
        </div>
      )}

      {/* Modal: Create Tournament */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Swords className="w-5 h-5 text-emerald-600" />
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                  {isBangla ? 'নতুন টুর্নামেন্ট যোগ করুন' : 'Create Tournament'}
                </h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTournament} className="p-5 space-y-3.5">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  {isBangla ? 'টুর্নামেন্টের নাম (English) *' : 'Tournament Title *'}
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Winter Badminton Championship 2026"
                  className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border-0 text-xs focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  {isBangla ? 'টুর্নামেন্টের নাম (বাংলা)' : 'Title in Bengali'}
                </label>
                <input
                  type="text"
                  value={titleBangla}
                  onChange={(e) => setTitleBangla(e.target.value)}
                  placeholder="যেমন: শীতকালীন টুর্নামেন্ট ২০২৬"
                  className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border-0 text-xs focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  {isBangla ? 'ভেন্যু / খেলার স্থান' : 'Venue / Court Location'}
                </label>
                <input
                  type="text"
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  placeholder="e.g. Club Court / Stadium"
                  className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border-0 text-xs focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    {isBangla ? 'টিম ফি (টাকা)' : 'Entry Fee (৳)'}
                  </label>
                  <input
                    type="number"
                    value={entryFee}
                    onChange={(e) => setEntryFee(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border-0 text-xs focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    {isBangla ? 'প্রাইজমানি' : 'Prize Pool'}
                  </label>
                  <input
                    type="text"
                    value={prizePool}
                    onChange={(e) => setPrizePool(e.target.value)}
                    placeholder="৳25,000"
                    className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border-0 text-xs focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    {isBangla ? 'শুরুর তারিখ' : 'Start Date'}
                  </label>
                  <input
                    type="text"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    placeholder="DD/MM/YYYY"
                    className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border-0 text-xs focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    {isBangla ? 'সমাপ্তির তারিখ' : 'End Date'}
                  </label>
                  <input
                    type="text"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    placeholder="DD/MM/YYYY"
                    className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border-0 text-xs focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  {isBangla ? 'নোট / নির্দেশাবলী' : 'Notes / Guidelines'}
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Feather shuttles provided, doubles tournament"
                  className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border-0 text-xs focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  {isBangla ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                >
                  {isBangla ? 'তৈরি করুন' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Register Team */}
      {showTeamModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-600" />
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                  {isBangla ? 'টিম এন্ট্রি ও স্লট বুকিং' : 'Register Tournament Team'}
                </h3>
              </div>
              <button
                onClick={() => setShowTeamModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddTeam} className="p-5 space-y-3.5">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  {isBangla ? 'টিমের নাম *' : 'Team Name *'}
                </label>
                <input
                  type="text"
                  required
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="e.g. Smash Brothers"
                  className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border-0 text-xs focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    {isBangla ? 'খেলোয়াড় ১ *' : 'Player 1 *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={player1}
                    onChange={(e) => setPlayer1(e.target.value)}
                    placeholder="e.g. Tanvir Ahmed"
                    className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border-0 text-xs focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    {isBangla ? 'খেলোয়াড় ২ (ডাবলস)' : 'Player 2 (Doubles)'}
                  </label>
                  <input
                    type="text"
                    value={player2}
                    onChange={(e) => setPlayer2(e.target.value)}
                    placeholder="e.g. Rakib Hasan"
                    className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border-0 text-xs focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  {isBangla ? 'যোগাযোগ নম্বর / ফোন' : 'Contact Phone'}
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border-0 text-xs focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="payCheck"
                  checked={isPaid}
                  onChange={(e) => setIsPaid(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <label htmlFor="payCheck" className="text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                  {isBangla
                    ? `রেজিস্ট্রেশন ফি ${formatCurrency(selectedTourney?.entryFee || 0, true)} এখনই পরিশোধিত হয়েছে`
                    : `Registration fee ${formatCurrency(selectedTourney?.entryFee || 0, false)} paid immediately`}
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowTeamModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  {isBangla ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                >
                  {isBangla ? 'টিম বুক করুন' : 'Confirm Registration'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Match */}
      {showMatchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-emerald-600" />
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                  {isBangla ? 'নতুন ম্যাচ ফিক্সচার যুক্ত করুন' : 'Schedule Match'}
                </h3>
              </div>
              <button
                onClick={() => setShowMatchModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddMatch} className="p-5 space-y-3.5">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  {isBangla ? 'রাউন্ড' : 'Tournament Round'}
                </label>
                <select
                  value={matchRound}
                  onChange={(e) => setMatchRound(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border-0 text-xs focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="Group Stage">Group Stage</option>
                  <option value="Quarter-Final">Quarter-Final</option>
                  <option value="Semi-Final">Semi-Final</option>
                  <option value="Grand Final">Grand Final</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    {isBangla ? 'টিম ১ *' : 'Team 1 *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={matchTeam1}
                    onChange={(e) => setMatchTeam1(e.target.value)}
                    placeholder="e.g. Smash Brothers"
                    className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border-0 text-xs focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    {isBangla ? 'টিম ২ *' : 'Team 2 *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={matchTeam2}
                    onChange={(e) => setMatchTeam2(e.target.value)}
                    placeholder="e.g. Court Kings"
                    className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border-0 text-xs focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    {isBangla ? 'কোর্ট' : 'Court'}
                  </label>
                  <input
                    type="text"
                    value={court}
                    onChange={(e) => setCourt(e.target.value)}
                    placeholder="Court 1"
                    className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border-0 text-xs focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    {isBangla ? 'সময়' : 'Time'}
                  </label>
                  <input
                    type="text"
                    value={matchTime}
                    onChange={(e) => setMatchTime(e.target.value)}
                    placeholder="07:00 PM"
                    className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border-0 text-xs focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowMatchModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  {isBangla ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                >
                  {isBangla ? 'ফিক্সচার সেভ করুন' : 'Schedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

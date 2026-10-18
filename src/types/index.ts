export type Role = 'Admin' | 'Captain' | 'Treasurer' | 'Member';
export type PaymentStatus = 'PAID' | 'PARTIAL' | 'UNPAID';
export type SportType = 'badminton' | 'cricket' | 'football' | 'multi';
export type ContributionType = 'weekly' | 'monthly' | 'both';
export type CollectionFrequency = 'weekly' | 'monthly' | 'both';
export type MemberCategory = 'child' | 'teen' | 'youth'; // বাচ্চা | কিশোর | যুবক

export type ExpenseCategory =
  | 'Court / Field Rent'
  | 'Shuttlecock / Balls'
  | 'Lighting / Electricity'
  | 'Tournament'
  | 'Equipment & Gear'
  | 'Food / Refreshment'
  | 'Umpire / Referee'
  | 'Jersey / Bibs'
  | 'Medical / First Aid'
  | 'Court Rent'
  | 'Shuttlecock'
  | 'Equipment'
  | 'Food / Drinks'
  | 'Other';

export interface Season {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  defaultWeeklyFee: number;
  defaultMonthlyFee?: number;
  weeklyTarget: number;
  monthlyTarget?: number;
  notes?: string;
}

export interface Member {
  id: string;
  memberCode: string; // 4-digit unique ID e.g. '1001'
  name: string;
  banglaName?: string;
  phone: string;
  avatar?: string; // photo/image data URL
  email?: string;
  joiningDate: string;
  weeklyAmount: number;
  monthlyAmount?: number;
  contributionType?: 'weekly' | 'monthly' | 'both';
  preferredSport?: SportType;
  memberCategory?: MemberCategory; // 'child' | 'teen' | 'youth'
  participatesInSports?: boolean; // whether member participates in sports & pays weekly/monthly game dues
  role: Role;
  assignedDuty?: string;
  delegatedPermissions?: DelegatedPermission[];
  subAdminPin?: string; // 4-digit PIN for sub-admin login
  pin?: string; // 4-digit personal PIN for member self-login
  bloodGroup?: string; // e.g. 'A+', 'B+', 'O+', 'AB+'
  address?: string; // Living address or area
  isActive: boolean;
}

export type DelegatedPermission =
  | 'manage_stars' // সেরা তারকা ও রেকর্ড
  | 'manage_members' // সদস্য ব্যবস্থাপনা
  | 'manage_collection' // চাঁদা ও পেমেন্ট এন্ট্রি
  | 'manage_expenses' // খরচ ও বিল ভাউচার
  | 'manage_tournaments' // টুর্নামেন্ট
  | 'manage_picnic' // পিকনিক
  | 'manage_funds'; // কল্যাণ তহবিল

export interface AdminProfile {
  name: string;
  banglaName?: string;
  designation: string; // e.g. "অ্যাপ প্রতিষ্ঠাতা ও প্রধান অ্যাডমিন"
  bio: string;
  photoUrl?: string;
  photos?: string[]; // Multiple photos / gallery images for admin
  phone?: string;
  email?: string;
  location?: string;
  facebookUrl?: string;
  messengerUrl?: string;
  whatsappNumber?: string;
  youtubeUrl?: string;
  linkedinUrl?: string;
  instagramUrl?: string;
  websiteUrl?: string;
}

export interface Week {
  id: string;
  seasonId: string;
  weekNumber: number;
  title: string;
  titleBangla?: string;
  startDate: string;
  endDate: string;
  weeklyTarget: number;
  isClosed: boolean;
}

export interface MonthRecord {
  id: string;
  seasonId: string;
  monthNumber: number;
  year: number;
  title: string;
  titleBangla?: string;
  targetAmount: number;
  isClosed: boolean;
}

export interface Payment {
  id: string;
  seasonId: string;
  weekId: string;
  memberId: string;
  expectedAmount: number;
  paidAmount: number;
  status: PaymentStatus;
  paymentDate: string;
  paymentMethod: 'Cash' | 'bKash' | 'Nagad' | 'Bank' | string;
  notes?: string;
}

export interface MonthlyPayment {
  id: string;
  seasonId: string;
  monthId: string;
  memberId: string;
  expectedAmount: number;
  paidAmount: number;
  status: PaymentStatus;
  paymentDate: string;
  paymentMethod: 'Cash' | 'bKash' | 'Nagad' | 'Bank' | string;
  notes?: string;
}

export interface SavingsDeposit {
  id: string;
  seasonId: string;
  memberId: string;
  date: string;
  monthPeriod: string;
  amount: number;
  type: 'DEPOSIT' | 'WITHDRAWAL';
  paymentMethod: 'Cash' | 'bKash' | 'Nagad' | 'Bank' | string;
  notes?: string;
  recordedBy?: string;
}

export interface Expense {
  id: string;
  seasonId: string;
  date: string;
  category: ExpenseCategory;
  description: string;
  amount: number;
  addedBy: string;
  sport?: SportType;
}

export interface ClubSettings {
  clubName: string;
  clubNameBangla: string;
  location: string;
  established: string;
  defaultWeeklyFee: number;
  defaultMonthlyFee?: number;
  defaultMonthlySavings?: number;
  sportType: SportType;
  collectionFrequency: 'weekly' | 'monthly' | 'both';
  messengerLink?: string;
  logoUrl?: string;
}

export interface TournamentMatch {
  id: string;
  round: string;
  team1: string;
  team2: string;
  court: string;
  time: string;
  scoreTeam1?: number;
  scoreTeam2?: number;
  status: 'SCHEDULED' | 'LIVE' | 'COMPLETED';
  winner?: string;
}

export interface TournamentTeam {
  id: string;
  name: string;
  player1: string;
  player2?: string;
  phone: string;
  registrationFee: number;
  isPaid: boolean;
}

export interface Tournament {
  id: string;
  sport?: SportType;
  title: string;
  titleBangla?: string;
  startDate: string;
  endDate: string;
  venue: string;
  entryFee: number;
  prizePool: string;
  status: 'UPCOMING' | 'REGISTRATION_OPEN' | 'ONGOING' | 'COMPLETED';
  teams: TournamentTeam[];
  matches: TournamentMatch[];
  notes?: string;
}

export interface PicnicParticipant {
  id: string;
  name: string;
  phone: string;
  membersCount: number; // e.g. self + family
  feePerPerson: number;
  totalFee: number;
  paidAmount: number;
  status: PaymentStatus;
  busSeat?: string;
}

export interface PicnicEvent {
  id: string;
  title: string;
  titleBangla?: string;
  date: string;
  destination: string;
  feePerPerson: number;
  estimatedBudget: number;
  status: 'PLANNING' | 'BOOKING_OPEN' | 'COMPLETED';
  participants: PicnicParticipant[];
  busNumber?: string;
  notes?: string;
}

export type FundCategory =
  | 'Welfare'
  | 'Emergency'
  | 'Infrastructure'
  | 'Religious'
  | 'Social'
  | 'General'
  | 'Other';

export interface CustomFund {
  id: string;
  seasonId?: string;
  title: string;
  titleBangla?: string;
  category: FundCategory;
  description?: string;
  targetAmount: number; // 0 if open-ended
  defaultTargetPerMember?: number;
  status: 'ACTIVE' | 'CLOSED';
  createdDate: string;
  icon?: string;
}

export interface FundContribution {
  id: string;
  fundId: string;
  memberId: string;
  expectedAmount: number;
  paidAmount: number;
  status: PaymentStatus;
  date: string;
  paymentMethod: 'Cash' | 'bKash' | 'Nagad' | 'Bank' | string;
  notes?: string;
}

export interface FundExpense {
  id: string;
  fundId: string;
  date: string;
  title: string;
  amount: number;
  disbursedTo?: string;
  notes?: string;
}

export type AwardPeriod = 'today' | 'weekly' | 'monthly' | 'season';

export interface LeaderboardPlayer {
  memberId: string;
  memberCode: string; // 4-digit ID
  name: string;
  banglaName?: string;
  avatar?: string; // uploaded photo
  sport: SportType;
  matchesPlayed: number;
  matchesWon: number;
  bestScoreText: string; // e.g. "21-12, 21-14" or "74* runs & 3 wkts" or "Hat-trick (3 goals)"
  awardBadge: string; // e.g. "MVP", "Player of the Match", "Best Shuttler", "Top Scorer"
}

export interface LeaderboardTeam {
  teamName: string;
  logo?: string; // uploaded image
  sport: SportType;
  playerNames: string; // "Tanvir Ahmed & Rakib Hasan"
  memberCodes?: string[]; // ["1001", "1002"]
  matchesPlayed: number;
  matchesWon: number;
  bestScoreText: string; // e.g. "21-9, 21-11" or "185/2 (10 ov)"
  achievementTitle?: string; // e.g. "Unbeaten Champions", "Best Doubles Duo"
}

export interface LeaderboardScoreRecord {
  title: string; // e.g. "Match Highest Score", "Fastest 50", "Big Margin Win"
  score: string; // e.g. "21-06 (Badminton)" or "215/3 (Cricket)" or "6-1 (Football)"
  achievedBy: string; // player or team name
  memberCode?: string; // 4-digit ID if individual
  opponent?: string;
  date: string;
  sport: SportType;
  notes?: string;
}

export interface LeaderboardAward {
  id: string;
  period: AwardPeriod; // 'today' | 'weekly' | 'monthly' | 'season'
  periodLabel: string; // e.g. "Today's Champions (আজকের সেরা)", "Week 4 Champions", "February 2026"
  date: string;
  bestPlayer?: LeaderboardPlayer;
  bestTeam?: LeaderboardTeam;
  bestScore?: LeaderboardScoreRecord;
  notes?: string;
}

export type TabType =
  | 'dashboard'
  | 'members'
  | 'weekly'
  | 'funds'
  | 'leaderboard'
  | 'tournament'
  | 'picnic'
  | 'expenses'
  | 'reports'
  | 'season'
  | 'settings';

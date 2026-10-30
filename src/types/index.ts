export type Role = 'Admin' | 'Treasurer' | 'Captain' | 'Member';
export type PaymentMethod = 'bKash' | 'Nagad' | 'Cash' | 'Bank' | (string & {});
export type PaymentStatus = 'PAID' | 'PARTIAL' | 'UNPAID';
export type SportType = 'badminton' | 'cricket' | 'football' | 'multi';
export type ContributionType = 'weekly' | 'monthly' | 'both';
export type CollectionFrequency = 'weekly' | 'monthly' | 'both';
export type MemberCategory = 'child' | 'teen' | 'youth';

export type TabType =
  | 'dashboard'
  | 'members'
  | 'leaderboard'
  | 'weekly'
  | 'funds'
  | 'tournament'
  | 'picnic'
  | 'expenses'
  | 'reports'
  | 'season'
  | 'email'
  | 'settings';

export type DelegatedPermission =
  | 'manage_collection'
  | 'manage_funds'
  | 'manage_expenses'
  | 'manage_tournaments'
  | 'manage_picnic'
  | 'manage_members'
  | 'manage_stars';

export type AdminPermission = DelegatedPermission;

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  action: 'PAYMENT_RECORDED' | 'PAYMENT_CORRECTED' | 'MARKED_PAID' | 'MARKED_UNPAID' | 'FEE_CHANGED';
  actorName: string;
  actorRole: 'MASTER_ADMIN' | 'SUB_ADMIN' | 'MEMBER' | 'SYSTEM';
  targetId: string;
  previousPaidAmount?: number;
  newPaidAmount?: number;
  previousStatus?: PaymentStatus;
  newStatus?: PaymentStatus;
  reason?: string;
  transactionRef?: string;
}

export interface Member {
  id: string;
  memberCode: string; // 4-digit ID e.g. '1001', '1002'
  avatar?: string; // Base64 or image URL
  name: string;
  banglaName?: string;
  phone: string;
  email?: string;
  bloodGroup?: string;
  address?: string;
  weeklyAmount: number;
  monthlyAmount?: number;
  role: Role;
  preferredSport?: SportType;
  contributionType?: ContributionType;
  memberCategory?: MemberCategory; // 'child' (বাচ্চা) | 'teen' (কিশোর) | 'youth' (যুবক)
  participatesInSports?: boolean; // true = plays & pays weekly fee, false = only contributes to funds
  pin?: string;
  pinHash?: string;
  loginPin?: string;
  subAdminPin?: string;
  isSubAdmin?: boolean;
  assignedDuty?: string;
  delegatedPermissions?: DelegatedPermission[];
  joiningDate: string;
  isActive: boolean;
}

export interface Season {
  id: string;
  name: string;
  banglaName?: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  defaultWeeklyFee: number;
  defaultMonthlyFee?: number;
  weeklyTarget: number;
  monthlyTarget?: number;
  notes?: string;
}

export interface Week {
  id: string;
  seasonId: string;
  weekNumber: number;
  title: string;
  titleBangla?: string;
  label?: string;
  banglaLabel?: string;
  startDate: string;
  endDate: string;
  weeklyTarget: number;
  targetAmount?: number;
  isClosed: boolean;
  isUpcoming?: boolean;
}

export type WeekPeriod = Week;

export interface MonthRecord {
  id: string;
  seasonId: string;
  monthNumber: number;
  year: number;
  title: string;
  titleBangla?: string;
  name?: string;
  banglaName?: string;
  targetAmount: number;
  isClosed: boolean;
  isUpcoming?: boolean;
}

export type MonthlyPeriod = MonthRecord;

export interface Payment {
  id: string;
  seasonId: string;
  weekId: string;
  memberId: string;
  expectedAmount: number;
  paidAmount: number;
  status: PaymentStatus;
  paymentDate: string;
  paymentMethod: PaymentMethod;
  method?: PaymentMethod;
  paidDate?: string;
  notes?: string;
  transactionRef?: string;
  recordedBy?: string;
  updatedAt?: string;
  correctionHistory?: AuditLogEntry[];
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
  paymentMethod: PaymentMethod;
  method?: PaymentMethod;
  paidDate?: string;
  notes?: string;
  transactionRef?: string;
  recordedBy?: string;
  updatedAt?: string;
  correctionHistory?: AuditLogEntry[];
}

export interface SavingsDeposit {
  id: string;
  seasonId: string;
  memberId: string;
  date: string;
  monthPeriod?: string;
  amount: number;
  type: 'DEPOSIT' | 'WITHDRAWAL';
  paymentMethod: PaymentMethod;
  method?: PaymentMethod;
  purpose?: string;
  notes?: string;
  recordedBy?: string;
  transactionRef?: string;
}

export type FundCategory =
  | 'Emergency'
  | 'Infrastructure'
  | 'Religious'
  | 'Welfare'
  | 'Social'
  | 'General';

export interface CustomFund {
  id: string;
  seasonId?: string;
  title: string;
  titleBangla?: string;
  name?: string;
  banglaName?: string;
  category: FundCategory;
  icon: string;
  description: string;
  banglaDescription?: string;
  targetAmount: number;
  defaultTargetPerMember?: number;
  defaultPerMember?: number;
  status: 'ACTIVE' | 'CLOSED' | 'COMPLETED';
  isActive?: boolean;
  createdDate: string;
  color?: string;
}

export interface FundContribution {
  id: string;
  fundId: string;
  seasonId?: string;
  memberId: string;
  donorName?: string;
  expectedAmount: number;
  paidAmount: number;
  status: PaymentStatus;
  date: string;
  paymentMethod: PaymentMethod;
  method?: PaymentMethod;
  paidDate?: string;
  notes?: string;
  transactionRef?: string;
  recordedBy?: string;
  updatedAt?: string;
  correctionHistory?: AuditLogEntry[];
}

export interface FundExpense {
  id: string;
  fundId: string;
  seasonId?: string;
  date: string;
  title: string;
  banglaTitle?: string;
  amount: number;
  disbursedTo?: string;
  beneficiary?: string;
  notes?: string;
}

export type ExpenseCategory =
  | 'Shuttlecock'
  | 'Shuttlecock / Balls'
  | 'Net'
  | 'Court Rent'
  | 'Court / Field Rent'
  | 'Lighting'
  | 'Lighting / Electricity'
  | 'Equipment'
  | 'Equipment & Gear'
  | 'Court Repair'
  | 'Refreshment'
  | 'Food / Refreshment'
  | 'Food / Drinks'
  | 'Tournament'
  | 'Cricket Gear'
  | 'Football Gear'
  | 'Jersey'
  | 'Jersey / Bibs'
  | 'Other';

export interface Expense {
  id: string;
  seasonId: string;
  date: string;
  category: ExpenseCategory;
  sport?: SportType;
  description: string;
  banglaDescription?: string;
  amount: number;
  addedBy: string;
  paidByMemberId?: string;
  payee?: string;
  paymentMethod?: PaymentMethod;
  reference?: string;
  fundId?: string;
  updatedAt?: string;
}

export interface TournamentTeam {
  id: string;
  name: string;
  player1: string;
  player2: string;
  phone: string;
  registrationFee: number;
  isPaid: boolean;
  feePaid?: boolean;
  matchesWon?: number;
  matchesLost?: number;
  points?: number;
}

export interface TournamentMatch {
  id: string;
  round: string;
  team1: string;
  team2: string;
  team1Id?: string;
  team2Id?: string;
  court: string;
  time: string;
  scoreTeam1?: number;
  scoreTeam2?: number;
  score1?: number;
  score2?: number;
  status: 'SCHEDULED' | 'LIVE' | 'COMPLETED';
  isCompleted?: boolean;
  winner?: string;
  winnerId?: string;
}

export interface TournamentExpenseItem {
  id: string;
  title: string;
  banglaTitle?: string;
  amount: number;
  date: string;
  category?: 'Prize' | 'Venue' | 'Shuttlecock' | 'Refreshment' | 'Referee' | 'Other';
  notes?: string;
}

export interface Tournament {
  id: string;
  seasonId?: string;
  sport?: SportType;
  title: string;
  titleBangla?: string;
  name?: string;
  banglaName?: string;
  startDate: string;
  endDate: string;
  date?: string;
  venue: string;
  entryFee: number;
  prizePool: string;
  status: 'UPCOMING' | 'REGISTRATION_OPEN' | 'ONGOING' | 'COMPLETED';
  teams: TournamentTeam[];
  matches: TournamentMatch[];
  expenses?: TournamentExpenseItem[];
  notes?: string;
}

export interface PicnicParticipant {
  id: string;
  memberId?: string;
  name: string;
  banglaName?: string;
  phone: string;
  membersCount: number;
  guestsCount?: number;
  feePerPerson: number;
  totalFee: number;
  expectedAmount?: number;
  paidAmount: number;
  status: PaymentStatus;
  busSeat?: string;
  dishContribution?: string;
  notes?: string;
  method?: PaymentMethod;
  paidDate?: string;
  transactionRef?: string;
  recordedBy?: string;
  updatedAt?: string;
  correctionHistory?: AuditLogEntry[];
}

export interface PicnicExpense {
  id: string;
  picnicId?: string;
  title: string;
  banglaTitle?: string;
  category: 'Market' | 'Transport' | 'Venue' | 'Cooking' | 'Decoration' | 'Food' | 'Prizes' | 'Other';
  amount: number;
  date: string;
  paidBy?: string;
  notes?: string;
}

export interface PicnicEvent {
  id: string;
  seasonId?: string;
  title: string;
  titleBangla?: string;
  banglaTitle?: string;
  date: string;
  destination: string;
  location?: string;
  banglaLocation?: string;
  feePerPerson: number;
  perPersonFee?: number;
  guestFee?: number;
  estimatedBudget: number;
  busNumber?: string;
  status: 'UPCOMING' | 'BOOKING_OPEN' | 'COMPLETED';
  participants: PicnicParticipant[];
  expenses?: PicnicExpense[];
  menuItems?: string[];
  activities?: string[];
  notes?: string;
}

export interface SubAdmin {
  id: string;
  memberId?: string;
  name: string;
  banglaName?: string;
  roleTitle: string;
  pin: string;
  pinHash?: string;
  permissions: DelegatedPermission[];
  isActive: boolean;
  addedDate: string;
}

export interface StarPlayer {
  id: string;
  memberId?: string;
  name: string;
  banglaName?: string;
  sport: SportType;
  badgeTitle: string;
  banglaBadgeTitle: string;
  statsText: string;
  banglaStatsText?: string;
  avatarUrl?: string;
  isFeatured: boolean;
}

export interface LeaderboardBestPlayer {
  memberId?: string;
  memberCode?: string;
  name: string;
  banglaName?: string;
  avatar?: string;
  sport: SportType;
  matchesPlayed: number;
  matchesWon: number;
  bestScoreText: string;
  awardBadge: string;
}

export interface LeaderboardBestTeam {
  teamName: string;
  logo?: string;
  sport: SportType;
  playerNames: string;
  memberCodes?: string[];
  matchesPlayed: number;
  matchesWon: number;
  bestScoreText: string;
  achievementTitle: string;
}

export interface LeaderboardBestScore {
  title: string;
  score: string;
  achievedBy: string;
  memberCode?: string;
  opponent: string;
  date: string;
  sport: SportType;
  notes?: string;
}

export type AwardPeriod = 'today' | 'weekly' | 'monthly' | 'season';

export interface LeaderboardAward {
  id: string;
  period: AwardPeriod;
  periodLabel: string;
  date: string;
  bestPlayer: LeaderboardBestPlayer;
  bestTeam: LeaderboardBestTeam;
  bestScore: LeaderboardBestScore;
  notes?: string;
}

export interface AdminProfile {
  name: string;
  banglaName?: string;
  designation: string;
  bio: string;
  photoUrl?: string;
  photos?: string[];
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

export interface ClubSettings {
  clubName: string;
  clubNameBangla?: string;
  clubBanglaName?: string;
  location: string;
  courtLocation?: string;
  established: string;
  defaultWeeklyFee: number;
  childWeeklyFee?: number;
  teenWeeklyFee?: number;
  youthWeeklyFee?: number;
  defaultMonthlyFee: number;
  defaultMonthlySavings: number;
  defaultFundAmount?: number;
  defaultPicnicFee?: number;
  defaultTournamentFee?: number;
  openingCashBalance?: number;
  sportType: SportType;
  collectionFrequency: CollectionFrequency;
  messengerLink?: string;
  logoUrl?: string;
  logoImage?: string;
  logoText?: string;
  tagline?: string;
  banglaTagline?: string;
  adminName?: string;
  adminRole?: string;
  adminPhone?: string;
  adminPin?: string;
  adminPinHash?: string;
  playingTime?: string;
  emergencyPhone?: string;
  subAdmins?: SubAdmin[];
  starPlayers?: StarPlayer[];
}

export type EmailTemplateType =
  | 'DUE_REMINDER'
  | 'PAID_RECEIPT'
  | 'PARTIAL_REMINDER'
  | 'FUND_NOTICE'
  | 'CUSTOM';

export interface EmailTemplateConfig {
  subjectBn: string;
  bodyBn: string;
  subjectEn: string;
  bodyEn: string;
}

export interface EmailSettings {
  autoSendOnPaid: boolean;
  autoSendOnPartial?: boolean;
  autoRemindUnpaid?: boolean;
  autoOpenGmailOnPaid: boolean;
  senderName: string;
  senderBrandName?: string;
  fromDomainEmail?: string;
  replyToEmail: string;
  paymentNumbersInfo: string;
  provider: 'GMAIL_DIRECT' | 'EMAILJS' | 'WEBHOOK' | 'CUSTOM_DOMAIN';
  emailJsServiceId?: string;
  emailJsTemplateId?: string;
  emailJsPublicKey?: string;
  webhookUrl?: string;
  brevoApiKey?: string;
  customTemplates?: Partial<Record<EmailTemplateType, EmailTemplateConfig>>;
}

export interface EmailLogEntry {
  id: string;
  timestamp: string;
  memberId: string;
  memberName: string;
  memberCode: string;
  recipientEmail: string;
  templateType: EmailTemplateType;
  subject: string;
  body: string;
  deliveryMethod: 'API_AUTO' | 'GMAIL_WEB' | 'MAILTO_CLIENT' | 'AUTO_LOG';
  status: 'SENT' | 'OPENED' | 'QUEUED' | 'FAILED';
  periodTitle?: string;
  amount?: number;
}


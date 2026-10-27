import {
  Season,
  Member,
  MemberCategory,
  Week,
  MonthRecord,
  Payment,
  PaymentStatus,
  MonthlyPayment,
  SavingsDeposit,
  Expense,
  ClubSettings,
  Tournament,
  PicnicEvent,
  CustomFund,
  FundContribution,
  FundExpense,
  LeaderboardAward,
  AdminProfile,
} from '../types';
import { syncAdminPinToFirestore } from './firebase';

const STORAGE_KEYS = {
  CLUB_SETTINGS: 'badminton_club_settings',
  SEASONS: 'badminton_seasons',
  MEMBERS: 'badminton_members',
  WEEKS: 'badminton_weeks',
  MONTHS: 'badminton_months',
  PAYMENTS: 'badminton_payments',
  MONTHLY_PAYMENTS: 'badminton_monthly_payments',
  SAVINGS_DEPOSITS: 'badminton_savings_deposits',
  EXPENSES: 'badminton_expenses',
  TOURNAMENTS: 'badminton_tournaments',
  PICNICS: 'badminton_picnics',
  CUSTOM_FUNDS: 'badminton_custom_funds',
  FUND_CONTRIBUTIONS: 'badminton_fund_contributions',
  FUND_EXPENSES: 'badminton_fund_expenses',
  LEADERBOARD_AWARDS: 'badminton_leaderboard_awards',
  ACTIVE_WEEK_ID: 'badminton_active_week_id',
  ACTIVE_MONTH_ID: 'badminton_active_month_id',
  IS_ADMIN: 'badminton_is_admin',
  ADMIN_PASSWORD: 'badminton_admin_password',
  ADMIN_PROFILE: 'badminton_admin_profile',
  LOGGED_IN_MEMBER_ID: 'badminton_logged_in_member_id',
  LANGUAGE: 'badminton_language',
  THEME: 'badminton_theme',
};

// Seed initial realistic data matching user specifications
export function getInitialData() {
  const clubSettings: ClubSettings = {
    clubName: 'Smashers Sports & Badminton Club',
    clubNameBangla: 'স্ম্যাশার্স স্পোর্টস ও ব্যাডমিন্টন ক্লাব',
    location: 'Dhaka, Bangladesh',
    established: '2024',
    defaultWeeklyFee: 350,
    defaultMonthlyFee: 1400,
    defaultMonthlySavings: 500,
    sportType: 'multi',
    collectionFrequency: 'both',
  };

  const tournaments: Tournament[] = [
    {
      id: 'tourney-1',
      sport: 'badminton',
      title: 'Winter Badminton Championship 2026',
      titleBangla: 'শীতকালীন ব্যাডমিন্টন চ্যাম্পিয়নশিপ ২০২৬',
      startDate: '15/02/2026',
      endDate: '20/02/2026',
      venue: 'National Badminton Stadium, Dhaka',
      entryFee: 1000,
      prizePool: '৳25,000 + Champions Trophy',
      status: 'REGISTRATION_OPEN',
      teams: [
        { id: 'tm-1', name: 'Smash Brothers', player1: 'Tanvir Ahmed', player2: 'Rakib Hasan', phone: '+8801711223344', registrationFee: 1000, isPaid: true },
        { id: 'tm-2', name: 'Court Kings', player1: 'Mehedi Hasan', player2: 'Shafiqul Islam', phone: '+8801912345678', registrationFee: 1000, isPaid: true },
        { id: 'tm-3', name: 'Falcon Strikers', player1: 'Mahmudul Karim', player2: 'Sabbir Hossain', phone: '+8801755667788', registrationFee: 1000, isPaid: true },
        { id: 'tm-4', name: 'Thunder Shuttlers', player1: 'Ariful Islam', player2: 'Zubair Al Mamun', phone: '+8801933557799', registrationFee: 1000, isPaid: false },
      ],
      matches: [
        { id: 'm-1', round: 'Semi-Final 1', team1: 'Smash Brothers', team2: 'Thunder Shuttlers', court: 'Court 1', time: '06:00 PM', scoreTeam1: 21, scoreTeam2: 18, status: 'COMPLETED', winner: 'Smash Brothers' },
        { id: 'm-2', round: 'Semi-Final 2', team1: 'Court Kings', team2: 'Falcon Strikers', court: 'Court 2', time: '07:00 PM', status: 'SCHEDULED' },
        { id: 'm-3', round: 'Grand Final', team1: 'Smash Brothers', team2: 'TBD', court: 'Center Court', time: '08:30 PM', status: 'SCHEDULED' },
      ],
      notes: 'Doubles tournament. Yonex Aerosensa shuttles will be provided.',
    },
    {
      id: 'tourney-2',
      sport: 'cricket',
      title: 'Dhaka Premier Tape Tennis Cricket Cup 2026',
      titleBangla: 'ঢাকা প্রিমিয়ার টেপ টেনিস ক্রিকেট কাপ ২০২৬',
      startDate: '01/03/2026',
      endDate: '05/03/2026',
      venue: 'Dhanmondi Cricket Ground, Dhaka',
      entryFee: 2000,
      prizePool: '৳40,000 + Champions Trophy',
      status: 'REGISTRATION_OPEN',
      teams: [
        { id: 'tm-c1', name: 'Dhaka Kings XI', player1: 'Tanvir Ahmed (C)', player2: 'Rakib Hasan (VC)', phone: '+8801711223344', registrationFee: 2000, isPaid: true },
        { id: 'tm-c2', name: 'Thunder Sixers', player1: 'Mehedi Hasan', player2: 'Shafiqul Islam', phone: '+8801912345678', registrationFee: 2000, isPaid: true },
        { id: 'tm-c3', name: 'Rising Stars CC', player1: 'Mahmudul Karim', player2: 'Sabbir Hossain', phone: '+8801755667788', registrationFee: 2000, isPaid: false },
      ],
      matches: [
        { id: 'mc-1', round: 'Quarter-Final 1', team1: 'Dhaka Kings XI', team2: 'Rising Stars CC', court: 'Pitch 1', time: '09:00 AM', status: 'SCHEDULED' },
        { id: 'mc-2', round: 'Quarter-Final 2', team1: 'Thunder Sixers', team2: 'TBD', court: 'Pitch 2', time: '11:30 AM', status: 'SCHEDULED' },
      ],
      notes: 'T10 Tape Tennis tournament with CA Super tape balls.',
    },
    {
      id: 'tourney-3',
      sport: 'football',
      title: 'Night Futsal & Turf Football Trophy 2026',
      titleBangla: 'নাইট ফুটসাল ও টার্ফ ফুটবল ট্রফি ২০২৬',
      startDate: '12/03/2026',
      endDate: '14/03/2026',
      venue: 'Jaflong Turf Arena, Gulshan, Dhaka',
      entryFee: 1500,
      prizePool: '৳30,000 + Gold Medals',
      status: 'REGISTRATION_OPEN',
      teams: [
        { id: 'tm-f1', name: 'Red Devils Futsal', player1: 'Tanvir Ahmed', player2: 'Ariful Islam', phone: '+8801711223344', registrationFee: 1500, isPaid: true },
        { id: 'tm-f2', name: 'Galacticos FC', player1: 'Mehedi Hasan', player2: 'Kamrul Hasan', phone: '+8801912345678', registrationFee: 1500, isPaid: true },
      ],
      matches: [
        { id: 'mf-1', round: 'Group Match A', team1: 'Red Devils Futsal', team2: 'Galacticos FC', court: 'Turf 1', time: '08:00 PM', status: 'SCHEDULED' },
      ],
      notes: '7-a-side floodlight futsal tournament with official referees.',
    },
  ];

  const picnics: PicnicEvent[] = [
    {
      id: 'picnic-1',
      title: 'Annual Club Picnic & Day Tour 2026',
      titleBangla: 'বার্ষিক স্পোর্টস ক্লাব পিকনিক ও ফ্যামিলি ডে ২০২৬',
      date: '06/03/2026',
      destination: 'Bhawal Resort & Golf Club, Gazipur',
      feePerPerson: 1200,
      estimatedBudget: 35000,
      busNumber: 'Dhaka Metro Cha-11-2233 (AC Bus)',
      status: 'BOOKING_OPEN',
      participants: [
        { id: 'p-1', name: 'Tanvir Ahmed', phone: '+8801711223344', membersCount: 2, feePerPerson: 1200, totalFee: 2400, paidAmount: 2400, status: 'PAID', busSeat: 'A1, A2' },
        { id: 'p-2', name: 'Rakib Hasan', phone: '+8801819876543', membersCount: 3, feePerPerson: 1200, totalFee: 3600, paidAmount: 3600, status: 'PAID', busSeat: 'A3, A4, B1' },
        { id: 'p-3', name: 'Mehedi Hasan', phone: '+8801912345678', membersCount: 1, feePerPerson: 1200, totalFee: 1200, paidAmount: 1200, status: 'PAID', busSeat: 'B2' },
        { id: 'p-4', name: 'Shafiqul Islam', phone: '+8801611334455', membersCount: 2, feePerPerson: 1200, totalFee: 2400, paidAmount: 1000, status: 'PARTIAL', busSeat: 'B3, B4' },
        { id: 'p-5', name: 'Mahmudul Karim', phone: '+8801755667788', membersCount: 1, feePerPerson: 1200, totalFee: 1200, paidAmount: 0, status: 'UNPAID' },
      ],
      notes: 'Breakfast, Buffet Lunch, Swimming Pool, Evening BBQ & Friendly Games included.',
    },
  ];

  const seasons: Season[] = [
    {
      id: 'season-2026',
      name: 'Sports Season 2026',
      startDate: '01/01/2026',
      endDate: '31/12/2026',
      isActive: true,
      defaultWeeklyFee: 350,
      defaultMonthlyFee: 1400,
      weeklyTarget: 5000,
      monthlyTarget: 16800,
      notes: 'Current multisport season: Badminton, Cricket & Football tournaments & weekly fund',
    },
    {
      id: 'season-2025',
      name: 'Sports Season 2025',
      startDate: '01/01/2025',
      endDate: '31/12/2025',
      isActive: false,
      defaultWeeklyFee: 300,
      defaultMonthlyFee: 1200,
      weeklyTarget: 4500,
      monthlyTarget: 14400,
      notes: 'Archived season with champions trophy',
    },
  ];

  const members: Member[] = [
    { id: 'm1', memberCode: '1001', name: 'Tanvir Ahmed', banglaName: 'তানভীর আহমেদ', phone: '+8801711223344', joiningDate: '01/01/2026', weeklyAmount: 400, monthlyAmount: 1600, contributionType: 'both', preferredSport: 'multi', memberCategory: 'youth', participatesInSports: true, role: 'Captain', isActive: true },
    { id: 'm2', memberCode: '1002', name: 'Rakib Hasan', banglaName: 'রাকিব হাসান', phone: '+8801819876543', joiningDate: '01/01/2026', weeklyAmount: 400, monthlyAmount: 1600, contributionType: 'both', preferredSport: 'cricket', memberCategory: 'youth', participatesInSports: true, role: 'Treasurer', isActive: true },
    { id: 'm3', memberCode: '1003', name: 'Mehedi Hasan', banglaName: 'মেহেদী হাসান', phone: '+8801912345678', joiningDate: '01/01/2026', weeklyAmount: 350, monthlyAmount: 1400, contributionType: 'both', preferredSport: 'badminton', memberCategory: 'youth', participatesInSports: true, role: 'Member', isActive: true },
    { id: 'm4', memberCode: '1004', name: 'Shafiqul Islam', banglaName: 'শফিকুল ইসলাম', phone: '+8801611334455', joiningDate: '05/01/2026', weeklyAmount: 350, monthlyAmount: 1400, contributionType: 'weekly', preferredSport: 'football', memberCategory: 'youth', participatesInSports: true, role: 'Member', isActive: true },
    { id: 'm5', memberCode: '1005', name: 'Mahmudul Karim', banglaName: 'মাহমুদুল করিম', phone: '+8801755667788', joiningDate: '01/01/2026', weeklyAmount: 350, monthlyAmount: 1400, contributionType: 'both', preferredSport: 'cricket', memberCategory: 'youth', participatesInSports: true, role: 'Member', isActive: true },
    { id: 'm6', memberCode: '1006', name: 'Sabbir Hossain', banglaName: 'সাব্বির হোসেন', phone: '+8801822446688', joiningDate: '08/01/2026', weeklyAmount: 300, monthlyAmount: 1200, contributionType: 'monthly', preferredSport: 'football', memberCategory: 'teen', participatesInSports: true, role: 'Member', isActive: true },
    { id: 'm7', memberCode: '1007', name: 'Ariful Islam', banglaName: 'আরিফুল ইসলাম', phone: '+8801933557799', joiningDate: '10/01/2026', weeklyAmount: 300, monthlyAmount: 1200, contributionType: 'both', preferredSport: 'badminton', memberCategory: 'teen', participatesInSports: true, role: 'Member', isActive: true },
    { id: 'm8', memberCode: '1008', name: 'Zubair Al Mamun', banglaName: 'জুবায়ের আল মামুন (পৃষ্ঠপোষক)', phone: '+8801744112233', joiningDate: '01/01/2026', weeklyAmount: 0, monthlyAmount: 0, contributionType: 'both', preferredSport: 'multi', memberCategory: 'youth', participatesInSports: false, role: 'Member', isActive: true },
    { id: 'm9', memberCode: '1009', name: 'Kamrul Hasan', banglaName: 'কামরুল হাসান', phone: '+8801811559922', joiningDate: '15/01/2026', weeklyAmount: 300, monthlyAmount: 1200, contributionType: 'weekly', preferredSport: 'football', memberCategory: 'teen', participatesInSports: true, role: 'Member', isActive: true },
    { id: 'm10', memberCode: '1010', name: 'Fahim Faisal', banglaName: 'ফাহিম ফয়সাল (জুনিয়র)', phone: '+8801688774411', joiningDate: '01/01/2026', weeklyAmount: 200, monthlyAmount: 800, contributionType: 'both', preferredSport: 'badminton', memberCategory: 'child', participatesInSports: true, role: 'Member', isActive: true },
    { id: 'm11', memberCode: '1011', name: 'Nasimul Gani', banglaName: 'নাসিমুল গণি (জুনিয়র)', phone: '+8801955331100', joiningDate: '18/01/2026', weeklyAmount: 200, monthlyAmount: 800, contributionType: 'both', preferredSport: 'multi', memberCategory: 'child', participatesInSports: true, role: 'Member', isActive: true },
    { id: 'm12', memberCode: '1012', name: 'Imtiaz Ahmed', banglaName: 'ইমতিয়াজ আহমেদ', phone: '+8801722998811', joiningDate: '01/01/2026', weeklyAmount: 350, monthlyAmount: 1400, contributionType: 'both', preferredSport: 'cricket', memberCategory: 'youth', participatesInSports: true, role: 'Member', isActive: true },
  ];

  const weeks: Week[] = [
    { id: 'w1', seasonId: 'season-2026', weekNumber: 1, title: 'Week 1', titleBangla: 'সপ্তাহ ১', startDate: '01/01/2026', endDate: '07/01/2026', weeklyTarget: 5000, isClosed: true },
    { id: 'w2', seasonId: 'season-2026', weekNumber: 2, title: 'Week 2', titleBangla: 'সপ্তাহ ২', startDate: '08/01/2026', endDate: '14/01/2026', weeklyTarget: 5000, isClosed: true },
    { id: 'w3', seasonId: 'season-2026', weekNumber: 3, title: 'Week 3', titleBangla: 'সপ্তাহ ৩', startDate: '15/01/2026', endDate: '21/01/2026', weeklyTarget: 5000, isClosed: true },
    { id: 'w4', seasonId: 'season-2026', weekNumber: 4, title: 'Week 4', titleBangla: 'সপ্তাহ ৪ (চলতি)', startDate: '22/01/2026', endDate: '28/01/2026', weeklyTarget: 5000, isClosed: false },
  ];

  const months: MonthRecord[] = [
    { id: 'm-2026-01', seasonId: 'season-2026', monthNumber: 1, year: 2026, title: 'January 2026', titleBangla: 'জানুয়ারি ২০২৬', targetAmount: 16800, isClosed: true },
    { id: 'm-2026-02', seasonId: 'season-2026', monthNumber: 2, year: 2026, title: 'February 2026', titleBangla: 'ফেব্রুয়ারি ২০২৬ (চলতি)', targetAmount: 16800, isClosed: false },
    { id: 'm-2026-03', seasonId: 'season-2026', monthNumber: 3, year: 2026, title: 'March 2026', titleBangla: 'মার্চ ২০২৬', targetAmount: 16800, isClosed: false },
  ];

  const payments: Payment[] = [
    // Week 1
    ...members.map((m, i) => ({
      id: `p-w1-${m.id}`,
      seasonId: 'season-2026',
      weekId: 'w1',
      memberId: m.id,
      expectedAmount: m.weeklyAmount,
      paidAmount: m.weeklyAmount,
      status: 'PAID' as const,
      paymentDate: '03/01/2026',
      paymentMethod: i % 2 === 0 ? 'bKash' : 'Cash',
      notes: 'On time',
    })),

    // Week 2
    ...members.map((m, i) => ({
      id: `p-w2-${m.id}`,
      seasonId: 'season-2026',
      weekId: 'w2',
      memberId: m.id,
      expectedAmount: m.weeklyAmount,
      paidAmount: i === 11 ? 0 : m.weeklyAmount,
      status: (i === 11 ? 'UNPAID' : 'PAID') as Payment['status'],
      paymentDate: i === 11 ? '' : '10/01/2026',
      paymentMethod: 'bKash',
      notes: i === 11 ? 'Out of city' : 'Paid',
    })),

    // Week 3
    ...members.map((m, i) => ({
      id: `p-w3-${m.id}`,
      seasonId: 'season-2026',
      weekId: 'w3',
      memberId: m.id,
      expectedAmount: m.weeklyAmount,
      paidAmount: i === 10 ? 200 : (i === 9 ? 0 : m.weeklyAmount),
      status: (i === 10 ? 'PARTIAL' : (i === 9 ? 'UNPAID' : 'PAID')) as Payment['status'],
      paymentDate: i === 10 ? '17/01/2026' : (i === 9 ? '' : '17/01/2026'),
      paymentMethod: 'bKash',
      notes: '',
    })),

    // Week 4
    { id: 'p-w4-m1', seasonId: 'season-2026', weekId: 'w4', memberId: 'm1', expectedAmount: 400, paidAmount: 400, status: 'PAID', paymentDate: '23/01/2026', paymentMethod: 'bKash', notes: 'Txn #BK9912' },
    { id: 'p-w4-m2', seasonId: 'season-2026', weekId: 'w4', memberId: 'm2', expectedAmount: 400, paidAmount: 400, status: 'PAID', paymentDate: '23/01/2026', paymentMethod: 'Cash', notes: 'Hand cash' },
    { id: 'p-w4-m3', seasonId: 'season-2026', weekId: 'w4', memberId: 'm3', expectedAmount: 350, paidAmount: 350, status: 'PAID', paymentDate: '24/01/2026', paymentMethod: 'bKash', notes: '' },
    { id: 'p-w4-m4', seasonId: 'season-2026', weekId: 'w4', memberId: 'm4', expectedAmount: 350, paidAmount: 350, status: 'PAID', paymentDate: '24/01/2026', paymentMethod: 'Nagad', notes: '' },
    { id: 'p-w4-m5', seasonId: 'season-2026', weekId: 'w4', memberId: 'm5', expectedAmount: 350, paidAmount: 350, status: 'PAID', paymentDate: '25/01/2026', paymentMethod: 'bKash', notes: '' },
    { id: 'p-w4-m6', seasonId: 'season-2026', weekId: 'w4', memberId: 'm6', expectedAmount: 350, paidAmount: 350, status: 'PAID', paymentDate: '25/01/2026', paymentMethod: 'Cash', notes: '' },
    { id: 'p-w4-m7', seasonId: 'season-2026', weekId: 'w4', memberId: 'm7', expectedAmount: 350, paidAmount: 350, status: 'PAID', paymentDate: '26/01/2026', paymentMethod: 'bKash', notes: '' },
    { id: 'p-w4-m8', seasonId: 'season-2026', weekId: 'w4', memberId: 'm8', expectedAmount: 350, paidAmount: 350, status: 'PAID', paymentDate: '26/01/2026', paymentMethod: 'bKash', notes: '' },
    { id: 'p-w4-m9', seasonId: 'season-2026', weekId: 'w4', memberId: 'm9', expectedAmount: 350, paidAmount: 350, status: 'PAID', paymentDate: '27/01/2026', paymentMethod: 'Cash', notes: '' },
    { id: 'p-w4-m10', seasonId: 'season-2026', weekId: 'w4', memberId: 'm10', expectedAmount: 350, paidAmount: 200, status: 'PARTIAL', paymentDate: '27/01/2026', paymentMethod: 'bKash', notes: 'Paid ৳200, ৳150 due' },
    { id: 'p-w4-m11', seasonId: 'season-2026', weekId: 'w4', memberId: 'm11', expectedAmount: 350, paidAmount: 100, status: 'PARTIAL', paymentDate: '27/01/2026', paymentMethod: 'Nagad', notes: 'Paid ৳100, ৳250 due' },
    { id: 'p-w4-m12', seasonId: 'season-2026', weekId: 'w4', memberId: 'm12', expectedAmount: 350, paidAmount: 0, status: 'UNPAID', paymentDate: '', paymentMethod: 'Cash', notes: 'Pending' },
  ];

  // Monthly dues payments for month 1 (Jan 2026) and month 2 (Feb 2026)
  const monthlyPayments: MonthlyPayment[] = [
    ...members.map((m, i) => ({
      id: `mp-jan-${m.id}`,
      seasonId: 'season-2026',
      monthId: 'm-2026-01',
      memberId: m.id,
      expectedAmount: m.monthlyAmount || 1400,
      paidAmount: m.monthlyAmount || 1400,
      status: 'PAID' as const,
      paymentDate: '10/01/2026',
      paymentMethod: i % 2 === 0 ? 'bKash' : 'Bank',
      notes: 'January monthly fund',
    })),
    ...members.map((m, i) => {
      const exp = m.monthlyAmount || 1400;
      let paid = exp;
      let st: PaymentStatus = 'PAID';
      if (i === 11) {
        paid = 0;
        st = 'UNPAID';
      } else if (i === 10) {
        paid = 800;
        st = 'PARTIAL';
      }
      return {
        id: `mp-feb-${m.id}`,
        seasonId: 'season-2026',
        monthId: 'm-2026-02',
        memberId: m.id,
        expectedAmount: exp,
        paidAmount: paid,
        status: st,
        paymentDate: paid > 0 ? '08/02/2026' : '',
        paymentMethod: 'bKash',
        notes: 'February monthly fund',
      };
    }),
  ];

  // Sonsoy / Savings fund deposits (মাসিক সঞ্চয় ও কল্যাণ তহবিল)
  const savingsDeposits: SavingsDeposit[] = [
    // January Savings Deposit (৳500 each)
    ...members.map((m) => ({
      id: `sav-jan-${m.id}`,
      seasonId: 'season-2026',
      memberId: m.id,
      date: '10/01/2026',
      monthPeriod: 'January 2026',
      amount: 500,
      type: 'DEPOSIT' as const,
      paymentMethod: 'bKash',
      notes: 'January Sonsoy contribution',
      recordedBy: 'Rakib Hasan (Treasurer)',
    })),
    // February Savings Deposit (৳500 each for active contributors)
    ...members.slice(0, 10).map((m) => ({
      id: `sav-feb-${m.id}`,
      seasonId: 'season-2026',
      memberId: m.id,
      date: '08/02/2026',
      monthPeriod: 'February 2026',
      amount: 500,
      type: 'DEPOSIT' as const,
      paymentMethod: 'bKash',
      notes: 'February Sonsoy contribution',
      recordedBy: 'Rakib Hasan (Treasurer)',
    })),
  ];

  const expenses: Expense[] = [
    { id: 'e1', seasonId: 'season-2026', date: '04/01/2026', category: 'Court Rent', description: 'Badminton Court Booking Fee (4 weeks)', amount: 4800, addedBy: 'Rakib Hasan', sport: 'badminton' },
    { id: 'e2', seasonId: 'season-2026', date: '08/01/2026', category: 'Shuttlecock', description: 'Yonex Aerosensa 30 Feather Shuttles (2 tubes)', amount: 3200, addedBy: 'Tanvir Ahmed', sport: 'badminton' },
    { id: 'e3', seasonId: 'season-2026', date: '12/01/2026', category: 'Lighting / Electricity', description: 'Floodlight usage & generator diesel bill', amount: 1500, addedBy: 'Rakib Hasan', sport: 'badminton' },
    { id: 'e4', seasonId: 'season-2026', date: '18/01/2026', category: 'Equipment & Gear', description: 'Net wire tightening clamp & grip tape', amount: 850, addedBy: 'Tanvir Ahmed', sport: 'badminton' },
    { id: 'e5', seasonId: 'season-2026', date: '22/01/2026', category: 'Food / Refreshment', description: 'Mineral water & glucose electrolyte for players', amount: 650, addedBy: 'Mehedi Hasan', sport: 'multi' },
    { id: 'e6', seasonId: 'season-2026', date: '26/01/2026', category: 'Shuttlecock / Balls', description: 'CA Plus 15000 Tape Tennis Balls (1 box / 6 balls)', amount: 1200, addedBy: 'Rakib Hasan', sport: 'cricket' },
    { id: 'e7', seasonId: 'season-2026', date: '28/01/2026', category: 'Court / Field Rent', description: 'Cricket Practice Pitch booking advance', amount: 2000, addedBy: 'Tanvir Ahmed', sport: 'cricket' },
    { id: 'e8', seasonId: 'season-2026', date: '02/02/2026', category: 'Shuttlecock / Balls', description: 'Nivia Storm Football (Size 5 match ball) + Hand pump', amount: 2200, addedBy: 'Mehedi Hasan', sport: 'football' },
    { id: 'e9', seasonId: 'season-2026', date: '05/02/2026', category: 'Jersey / Bibs', description: '12 Pcs Practice Bibs (Neon Green & Orange)', amount: 1400, addedBy: 'Shafiqul Islam', sport: 'football' },
  ];

  const customFunds: CustomFund[] = [
    {
      id: 'fund-1',
      title: 'Emergency Medical & Blood Fund',
      titleBangla: 'জরুরি চিকিৎসা ও রক্তদান ফান্ড',
      category: 'Emergency',
      icon: '🏥',
      description: 'জরুরি চিকিৎসা সেবা, অসুস্থ খেলোয়াড় ও এলাকার বাসিন্দাদের ওষুধ ও চিকিৎসার আর্থিক সহায়তা ফান্ড।',
      targetAmount: 15000,
      defaultTargetPerMember: 1000,
      status: 'ACTIVE',
      createdDate: '05/01/2026',
    },
    {
      id: 'fund-2',
      title: 'Club House & Turf Development Fund',
      titleBangla: 'ক্লাব ঘর ও টার্ফ সংস্কার ফান্ড',
      category: 'Infrastructure',
      icon: '🏢',
      description: 'ক্লাবের বসার ঘর, ফ্লাডলাইট পরিবর্তন, নেট পোল ও মাঠ আধুনিকায়ন তহবিল।',
      targetAmount: 30000,
      defaultTargetPerMember: 1500,
      status: 'ACTIVE',
      createdDate: '10/01/2026',
    },
    {
      id: 'fund-3',
      title: 'Ramadan Iftar & Eid Relief Fund',
      titleBangla: 'রমজান ইফতার ও ঈদ উপহার ফান্ড',
      category: 'Religious',
      icon: '🌙',
      description: 'রমজানের ক্লাব ইফতার মাহফিল ও এলাকার সুবিধাবঞ্চিত পরিবারে ঈদ সামগ্রী বিতরণ তহবিল।',
      targetAmount: 20000,
      defaultTargetPerMember: 1000,
      status: 'ACTIVE',
      createdDate: '15/01/2026',
    },
  ];

  const fundContributions: FundContribution[] = [
    // Fund 1 - Medical Fund
    { id: 'fc-1-1', fundId: 'fund-1', memberId: 'm1', expectedAmount: 1000, paidAmount: 1000, status: 'PAID', date: '06/01/2026', paymentMethod: 'bKash', notes: 'Full donation' },
    { id: 'fc-1-2', fundId: 'fund-1', memberId: 'm2', expectedAmount: 1000, paidAmount: 1000, status: 'PAID', date: '07/01/2026', paymentMethod: 'bKash', notes: 'Full donation' },
    { id: 'fc-1-3', fundId: 'fund-1', memberId: 'm3', expectedAmount: 1000, paidAmount: 500, status: 'PARTIAL', date: '10/01/2026', paymentMethod: 'Cash', notes: 'First installment' },
    { id: 'fc-1-8', fundId: 'fund-1', memberId: 'm8', expectedAmount: 2000, paidAmount: 2000, status: 'PAID', date: '08/01/2026', paymentMethod: 'Bank', notes: 'Patron contribution' },
    { id: 'fc-1-5', fundId: 'fund-1', memberId: 'm5', expectedAmount: 1000, paidAmount: 1000, status: 'PAID', date: '12/01/2026', paymentMethod: 'Nagad', notes: 'Paid' },
    { id: 'fc-1-12', fundId: 'fund-1', memberId: 'm12', expectedAmount: 1000, paidAmount: 0, status: 'UNPAID', date: '', paymentMethod: 'Cash', notes: 'Committed' },

    // Fund 2 - Club House Development
    { id: 'fc-2-1', fundId: 'fund-2', memberId: 'm1', expectedAmount: 1500, paidAmount: 1500, status: 'PAID', date: '12/01/2026', paymentMethod: 'bKash', notes: 'Club house fund' },
    { id: 'fc-2-2', fundId: 'fund-2', memberId: 'm2', expectedAmount: 1500, paidAmount: 1500, status: 'PAID', date: '12/01/2026', paymentMethod: 'Cash', notes: 'Club house fund' },
    { id: 'fc-2-4', fundId: 'fund-2', memberId: 'm4', expectedAmount: 1500, paidAmount: 1500, status: 'PAID', date: '15/01/2026', paymentMethod: 'bKash', notes: 'Club house fund' },
    { id: 'fc-2-8', fundId: 'fund-2', memberId: 'm8', expectedAmount: 5000, paidAmount: 5000, status: 'PAID', date: '11/01/2026', paymentMethod: 'Bank', notes: 'Large patron sponsor' },
    { id: 'fc-2-6', fundId: 'fund-2', memberId: 'm6', expectedAmount: 500, paidAmount: 500, status: 'PAID', date: '18/01/2026', paymentMethod: 'bKash', notes: 'Teen contribution' },
    { id: 'fc-2-7', fundId: 'fund-2', memberId: 'm7', expectedAmount: 500, paidAmount: 200, status: 'PARTIAL', date: '19/01/2026', paymentMethod: 'Cash', notes: 'Remaining 300 tk' },
    { id: 'fc-2-9', fundId: 'fund-2', memberId: 'm9', expectedAmount: 500, paidAmount: 0, status: 'UNPAID', date: '', paymentMethod: 'Cash', notes: 'Promised by Friday' },

    // Fund 3 - Ramadan Fund
    { id: 'fc-3-1', fundId: 'fund-3', memberId: 'm1', expectedAmount: 1000, paidAmount: 1000, status: 'PAID', date: '16/01/2026', paymentMethod: 'bKash', notes: 'Iftar sponsorship' },
    { id: 'fc-3-2', fundId: 'fund-3', memberId: 'm2', expectedAmount: 1000, paidAmount: 1000, status: 'PAID', date: '16/01/2026', paymentMethod: 'Nagad', notes: 'Iftar donation' },
    { id: 'fc-3-8', fundId: 'fund-3', memberId: 'm8', expectedAmount: 3000, paidAmount: 3000, status: 'PAID', date: '16/01/2026', paymentMethod: 'Bank', notes: 'Eid charity' },
    { id: 'fc-3-10', fundId: 'fund-3', memberId: 'm10', expectedAmount: 300, paidAmount: 300, status: 'PAID', date: '20/01/2026', paymentMethod: 'Cash', notes: 'Junior member' },
    { id: 'fc-3-11', fundId: 'fund-3', memberId: 'm11', expectedAmount: 300, paidAmount: 300, status: 'PAID', date: '20/01/2026', paymentMethod: 'Cash', notes: 'Junior member' },
  ];

  const fundExpenses: FundExpense[] = [
    {
      id: 'fe-1',
      fundId: 'fund-1',
      date: '20/01/2026',
      title: 'খেলোয়াড়ের চিকিৎসার প্রেসক্রিপশন ও ব্যান্ডেজ বাবদ সহায়তা',
      amount: 3500,
      disbursedTo: 'গ্রিন লাইফ হসপিটাল ও ফার্মেসি',
      notes: 'জুনিয়র মেম্বারের হাতের কব্জিতে চোটের চিকিৎসা সহায়তা',
    },
    {
      id: 'fe-2',
      fundId: 'fund-2',
      date: '25/01/2026',
      title: 'মাঠের ফ্লাডলাইট তার ও নতুন ২ টি এলইডি বাল্ব ক্রয়',
      amount: 4800,
      disbursedTo: 'রহমান ইলেকট্রনিক্স',
      notes: 'রাতের খেলার আলোর ব্যবস্থা মেরামত',
    },
  ];

  const leaderboardAwards: LeaderboardAward[] = [
    {
      id: 'award-today',
      period: 'today',
      periodLabel: "Today's Champions (আজকের সেরা)",
      date: new Date().toLocaleDateString('en-GB'),
      bestPlayer: {
        memberId: 'm1',
        memberCode: '1001',
        name: 'Tanvir Ahmed',
        banglaName: 'তানভীর আহমেদ',
        sport: 'badminton',
        matchesPlayed: 3,
        matchesWon: 3,
        bestScoreText: '21-14, 21-11 (Game MVP)',
        awardBadge: 'আজকের সেরা খেলোয়াড় (MVP)',
      },
      bestTeam: {
        teamName: 'Smash Brothers',
        sport: 'badminton',
        playerNames: 'Tanvir Ahmed & Rakib Hasan',
        memberCodes: ['1001', '1002'],
        matchesPlayed: 2,
        matchesWon: 2,
        bestScoreText: '21-12, 21-18',
        achievementTitle: 'আজকের অপরাজিত ডাবলস দল',
      },
      bestScore: {
        title: 'আজকের সেরা একক ব্যবধান স্কোর',
        score: '21-08',
        achievedBy: 'Mehedi Hasan (আইডি: 1003)',
        memberCode: '1003',
        opponent: 'Thunder Shuttlers',
        date: 'Today',
        sport: 'badminton',
        notes: 'আগ্রাসী স্ম্যাশ ও দুর্দান্ত শাটল প্লে',
      },
      notes: 'আজকের ডে-নাইট সেশনের পারফরম্যান্স রেকর্ড',
    },
    {
      id: 'award-weekly',
      period: 'weekly',
      periodLabel: 'Week 4 Champions (সাপ্তাহিক সেরা)',
      date: 'Week 4 (January 2026)',
      bestPlayer: {
        memberId: 'm2',
        memberCode: '1002',
        name: 'Rakib Hasan',
        banglaName: 'রাকিব হাসান',
        sport: 'cricket',
        matchesPlayed: 2,
        matchesWon: 2,
        bestScoreText: '৬৮* রান ও ৩ উইকেট',
        awardBadge: 'সপ্তাহের সেরা অলরাউন্ডার 🏏',
      },
      bestTeam: {
        teamName: 'Dhaka Kings XI',
        sport: 'cricket',
        playerNames: 'Tanvir Ahmed & Rakib Hasan (C)',
        memberCodes: ['1001', '1002'],
        matchesPlayed: 2,
        matchesWon: 2,
        bestScoreText: '১৯৪/৩ (১০ ওভার)',
        achievementTitle: 'উইকলি সুপার চ্যাম্পিয়ন',
      },
      bestScore: {
        title: 'সপ্তাহের দ্রুততম ফিফটি ও দলীয় স্কোর',
        score: '১৯৪/৩ (১০ ওভার)',
        achievedBy: 'Dhaka Kings XI',
        opponent: 'Rising Stars CC',
        date: 'Week 4',
        sport: 'cricket',
        notes: 'সর্বোচ্চ স্ট্রাইক রেট ও ছক্কার রেকর্ড',
      },
      notes: 'সাপ্তাহিক টেপ টেনিস ও ব্যাডমিন্টন রেটিং',
    },
    {
      id: 'award-monthly',
      period: 'monthly',
      periodLabel: 'Month of January 2026 (মাসিক সেরা)',
      date: 'January 2026',
      bestPlayer: {
        memberId: 'm5',
        memberCode: '1005',
        name: 'Mahmudul Karim',
        banglaName: 'মাহমুদুল করিম',
        sport: 'football',
        matchesPlayed: 4,
        matchesWon: 4,
        bestScoreText: '৭ গোল ও ৩ অ্যাসিস্ট (Golden Boot)',
        awardBadge: 'মাসের গোল্ডেন বুট ও শীর্ষ গোলদাতা ⚽',
      },
      bestTeam: {
        teamName: 'Red Devils Futsal',
        sport: 'football',
        playerNames: 'Tanvir Ahmed & Ariful Islam',
        memberCodes: ['1001', '1007'],
        matchesPlayed: 4,
        matchesWon: 4,
        bestScoreText: '৫-১ ফাইনাল জয়',
        achievementTitle: 'মাসের অপরাজিত চ্যাম্পিয়ন',
      },
      bestScore: {
        title: 'মাসের সবচেয়ে বড় ব্যবধানে জয়',
        score: '৫-১',
        achievedBy: 'Red Devils Futsal',
        opponent: 'Galacticos FC',
        date: 'January 2026',
        sport: 'football',
        notes: 'টার্ফ ফুটবল কাপে ক্লিন শিট ও হ্যাটট্রিক',
      },
      notes: 'জানুয়ারি মাসের সামগ্রিক ক্লাবের শীর্ষ পারফরমার',
    },
  ];

  return {
    clubSettings,
    seasons,
    members,
    weeks,
    months,
    payments,
    monthlyPayments,
    savingsDeposits,
    expenses,
    tournaments,
    picnics,
    customFunds,
    fundContributions,
    fundExpenses,
    leaderboardAwards,
    activeWeekId: 'w4',
    activeMonthId: 'm-2026-02',
  };
}

let syncChannel: BroadcastChannel | null = null;
try {
  syncChannel = new BroadcastChannel('badminton_club_fund_sync');
} catch {
  // Safari / fallback
}

export function notifySync(action: string) {
  if (syncChannel) {
    try {
      syncChannel.postMessage({ type: 'DATA_UPDATED', action, timestamp: Date.now() });
    } catch {
      // ignore
    }
  }
}

export function subscribeToSync(callback: () => void) {
  if (syncChannel) {
    const handler = () => callback();
    syncChannel.addEventListener('message', handler);
    return () => syncChannel?.removeEventListener('message', handler);
  }
  return () => {};
}

export function loadData() {
  const storedClub = localStorage.getItem(STORAGE_KEYS.CLUB_SETTINGS);
  const storedSeasons = localStorage.getItem(STORAGE_KEYS.SEASONS);
  const storedMembers = localStorage.getItem(STORAGE_KEYS.MEMBERS);
  const storedWeeks = localStorage.getItem(STORAGE_KEYS.WEEKS);
  const storedMonths = localStorage.getItem(STORAGE_KEYS.MONTHS);
  const storedPayments = localStorage.getItem(STORAGE_KEYS.PAYMENTS);
  const storedMonthlyPayments = localStorage.getItem(STORAGE_KEYS.MONTHLY_PAYMENTS);
  const storedSavings = localStorage.getItem(STORAGE_KEYS.SAVINGS_DEPOSITS);
  const storedExpenses = localStorage.getItem(STORAGE_KEYS.EXPENSES);
  const storedTournaments = localStorage.getItem(STORAGE_KEYS.TOURNAMENTS);
  const storedPicnics = localStorage.getItem(STORAGE_KEYS.PICNICS);
  const storedCustomFunds = localStorage.getItem(STORAGE_KEYS.CUSTOM_FUNDS);
  const storedFundContributions = localStorage.getItem(STORAGE_KEYS.FUND_CONTRIBUTIONS);
  const storedFundExpenses = localStorage.getItem(STORAGE_KEYS.FUND_EXPENSES);
  const storedLeaderboardAwards = localStorage.getItem(STORAGE_KEYS.LEADERBOARD_AWARDS);
  const storedWeekId = localStorage.getItem(STORAGE_KEYS.ACTIVE_WEEK_ID);
  const storedMonthId = localStorage.getItem(STORAGE_KEYS.ACTIVE_MONTH_ID);

  const initial = getInitialData();

  if (!storedSeasons || !storedMembers || !storedWeeks || !storedPayments || !storedExpenses) {
    saveData(initial);
    return initial;
  }

  try {
    const parsedClub: ClubSettings = storedClub ? JSON.parse(storedClub) : initial.clubSettings;
    // ensure sportType & collectionFrequency exist
    if (!parsedClub.sportType) parsedClub.sportType = 'multi';
    if (!parsedClub.collectionFrequency) parsedClub.collectionFrequency = 'both';
    if (!parsedClub.defaultMonthlyFee) parsedClub.defaultMonthlyFee = 1400;
    if (!parsedClub.defaultMonthlySavings) parsedClub.defaultMonthlySavings = 500;

    const parsedMembers: Member[] = storedMembers ? JSON.parse(storedMembers) : initial.members;
    // ensure memberCategory, participatesInSports & 4-DIGIT memberCode
    let nextCode = 1001;
    const sanitizedMembers: Member[] = parsedMembers.map((m) => {
      let code = m.memberCode;
      if (!code || !/^\d{4}$/.test(code)) {
        code = (nextCode++).toString();
      } else {
        const num = parseInt(code, 10);
        if (num >= nextCode) nextCode = num + 1;
      }
      return {
        ...m,
        memberCode: code,
        memberCategory: m.memberCategory || 'youth',
        participatesInSports: m.participatesInSports !== undefined ? m.participatesInSports : true,
      };
    });

    return {
      clubSettings: parsedClub,
      seasons: JSON.parse(storedSeasons) as Season[],
      members: sanitizedMembers,
      weeks: JSON.parse(storedWeeks) as Week[],
      months: storedMonths ? (JSON.parse(storedMonths) as MonthRecord[]) : initial.months,
      payments: JSON.parse(storedPayments) as Payment[],
      monthlyPayments: storedMonthlyPayments ? (JSON.parse(storedMonthlyPayments) as MonthlyPayment[]) : initial.monthlyPayments,
      savingsDeposits: storedSavings ? (JSON.parse(storedSavings) as SavingsDeposit[]) : initial.savingsDeposits,
      expenses: JSON.parse(storedExpenses) as Expense[],
      tournaments: storedTournaments ? (JSON.parse(storedTournaments) as Tournament[]) : initial.tournaments,
      picnics: storedPicnics ? (JSON.parse(storedPicnics) as PicnicEvent[]) : initial.picnics,
      customFunds: storedCustomFunds ? (JSON.parse(storedCustomFunds) as CustomFund[]) : initial.customFunds,
      fundContributions: storedFundContributions ? (JSON.parse(storedFundContributions) as FundContribution[]) : initial.fundContributions,
      fundExpenses: storedFundExpenses ? (JSON.parse(storedFundExpenses) as FundExpense[]) : initial.fundExpenses,
      leaderboardAwards: storedLeaderboardAwards ? (JSON.parse(storedLeaderboardAwards) as LeaderboardAward[]) : initial.leaderboardAwards,
      activeWeekId: storedWeekId || 'w4',
      activeMonthId: storedMonthId || 'm-2026-02',
    };
  } catch {
    saveData(initial);
    return initial;
  }
}

export function saveData(data: {
  clubSettings?: ClubSettings;
  seasons: Season[];
  members: Member[];
  weeks: Week[];
  months?: MonthRecord[];
  payments: Payment[];
  monthlyPayments?: MonthlyPayment[];
  savingsDeposits?: SavingsDeposit[];
  expenses: Expense[];
  tournaments?: Tournament[];
  picnics?: PicnicEvent[];
  customFunds?: CustomFund[];
  fundContributions?: FundContribution[];
  fundExpenses?: FundExpense[];
  leaderboardAwards?: LeaderboardAward[];
  activeWeekId?: string;
  activeMonthId?: string;
}) {
  if (data.clubSettings) {
    localStorage.setItem(STORAGE_KEYS.CLUB_SETTINGS, JSON.stringify(data.clubSettings));
  }
  localStorage.setItem(STORAGE_KEYS.SEASONS, JSON.stringify(data.seasons));
  localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(data.members));
  localStorage.setItem(STORAGE_KEYS.WEEKS, JSON.stringify(data.weeks));
  if (data.months) {
    localStorage.setItem(STORAGE_KEYS.MONTHS, JSON.stringify(data.months));
  }
  localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(data.payments));
  if (data.monthlyPayments) {
    localStorage.setItem(STORAGE_KEYS.MONTHLY_PAYMENTS, JSON.stringify(data.monthlyPayments));
  }
  if (data.savingsDeposits) {
    localStorage.setItem(STORAGE_KEYS.SAVINGS_DEPOSITS, JSON.stringify(data.savingsDeposits));
  }
  localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(data.expenses));
  if (data.tournaments) {
    localStorage.setItem(STORAGE_KEYS.TOURNAMENTS, JSON.stringify(data.tournaments));
  }
  if (data.picnics) {
    localStorage.setItem(STORAGE_KEYS.PICNICS, JSON.stringify(data.picnics));
  }
  if (data.customFunds) {
    localStorage.setItem(STORAGE_KEYS.CUSTOM_FUNDS, JSON.stringify(data.customFunds));
  }
  if (data.fundContributions) {
    localStorage.setItem(STORAGE_KEYS.FUND_CONTRIBUTIONS, JSON.stringify(data.fundContributions));
  }
  if (data.fundExpenses) {
    localStorage.setItem(STORAGE_KEYS.FUND_EXPENSES, JSON.stringify(data.fundExpenses));
  }
  if (data.leaderboardAwards) {
    localStorage.setItem(STORAGE_KEYS.LEADERBOARD_AWARDS, JSON.stringify(data.leaderboardAwards));
  }
  if (data.activeWeekId) {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_WEEK_ID, data.activeWeekId);
  }
  if (data.activeMonthId) {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_MONTH_ID, data.activeMonthId);
  }
  notifySync('SAVE_DATA');
}

export function resetToDemo() {
  const initial = getInitialData();
  saveData(initial);
  return initial;
}

export const resetToDefaultData = resetToDemo;
export const subscribeToStorageSync = subscribeToSync;

export function loadClubSettings(): ClubSettings {
  return loadData().clubSettings;
}

export function saveClubSettings(clubSettings: ClubSettings): void {
  const current = loadData();
  saveData({ ...current, clubSettings });
}

export function loadTournaments(): Tournament[] {
  return loadData().tournaments;
}

export function saveTournaments(tournaments: Tournament[]): void {
  const current = loadData();
  saveData({ ...current, tournaments });
}

export function loadPicnics(): PicnicEvent[] {
  return loadData().picnics;
}

export function savePicnics(picnics: PicnicEvent[]): void {
  const current = loadData();
  saveData({ ...current, picnics });
}

export function loadCustomFunds(): CustomFund[] {
  return loadData().customFunds;
}

export function saveCustomFunds(customFunds: CustomFund[]): void {
  const current = loadData();
  saveData({ ...current, customFunds });
}

export function loadFundContributions(): FundContribution[] {
  return loadData().fundContributions;
}

export function saveFundContributions(fundContributions: FundContribution[]): void {
  const current = loadData();
  saveData({ ...current, fundContributions });
}

export function loadFundExpenses(): FundExpense[] {
  return loadData().fundExpenses;
}

export function saveFundExpenses(fundExpenses: FundExpense[]): void {
  const current = loadData();
  saveData({ ...current, fundExpenses });
}

export function loadSeasons(): Season[] {
  return loadData().seasons;
}

export function saveSeasons(seasons: Season[]): void {
  const current = loadData();
  saveData({ ...current, seasons });
}

export function loadWeeks(): Week[] {
  return loadData().weeks;
}

export function saveWeeks(weeks: Week[]): void {
  const current = loadData();
  saveData({ ...current, weeks });
}

export function loadMonths(): MonthRecord[] {
  return loadData().months;
}

export function saveMonths(months: MonthRecord[]): void {
  const current = loadData();
  saveData({ ...current, months });
}

export function loadMembers(): Member[] {
  return loadData().members;
}

export function saveMembers(members: Member[]): void {
  const current = loadData();
  saveData({ ...current, members });
}

export function loadPayments(): Payment[] {
  return loadData().payments;
}

export function savePayments(payments: Payment[]): void {
  const current = loadData();
  saveData({ ...current, payments });
}

export function loadMonthlyPayments(): MonthlyPayment[] {
  return loadData().monthlyPayments;
}

export function saveMonthlyPayments(monthlyPayments: MonthlyPayment[]): void {
  const current = loadData();
  saveData({ ...current, monthlyPayments });
}

export function loadSavingsDeposits(): SavingsDeposit[] {
  return loadData().savingsDeposits;
}

export function saveSavingsDeposits(savingsDeposits: SavingsDeposit[]): void {
  const current = loadData();
  saveData({ ...current, savingsDeposits });
}

export function loadExpenses(): Expense[] {
  return loadData().expenses;
}

export function saveExpenses(expenses: Expense[]): void {
  const current = loadData();
  saveData({ ...current, expenses });
}

export function loadLeaderboardAwards(): LeaderboardAward[] {
  return loadData().leaderboardAwards || [];
}

export function saveLeaderboardAwards(leaderboardAwards: LeaderboardAward[]): void {
  const current = loadData();
  saveData({ ...current, leaderboardAwards });
}

export function loadAdminPassword(): string {
  try {
    return localStorage.getItem(STORAGE_KEYS.ADMIN_PASSWORD) || '1234';
  } catch {
    return '1234';
  }
}

export function saveAdminPassword(newPassword: string, syncToCloud: boolean = true): void {
  try {
    const trimmed = newPassword.trim();
    localStorage.setItem(STORAGE_KEYS.ADMIN_PASSWORD, trimmed);
    notifySync('SAVE_ADMIN_PASSWORD');
    if (syncToCloud) {
      syncAdminPinToFirestore(trimmed).catch((err) => {
        console.warn('Background sync admin pin failed:', err);
      });
    }
  } catch (e) {
    console.error('Failed to save admin password:', e);
  }
}

export function saveAdminPinFromCloud(cloudPin: string): void {
  try {
    if (!cloudPin) return;
    const trimmed = String(cloudPin).trim();
    const current = localStorage.getItem(STORAGE_KEYS.ADMIN_PASSWORD);
    if (current !== trimmed) {
      localStorage.setItem(STORAGE_KEYS.ADMIN_PASSWORD, trimmed);
      notifySync('SAVE_ADMIN_PASSWORD');
    }
  } catch (e) {
    console.error('Failed to apply cloud admin pin:', e);
  }
}

export const DEFAULT_ADMIN_PROFILE: AdminProfile = {
  name: 'Nabil Khan',
  banglaName: 'নাবিল খান',
  designation: 'অ্যাপ প্রতিষ্ঠাতা ও প্রধান অ্যাডমিন',
  bio: 'আমাদের স্পোর্টস ক্লাবের ডিজিটালাইজেশন, নির্ভুল হিসাবরক্ষণ ও স্বচ্ছতার জন্য এই ক্লাব ফান্ড ম্যানেজার তৈরি করা হয়েছে।',
  phone: '01700000000',
  email: 'nabilkhane15@gmail.com',
  location: 'ঢাকা, বাংলাদেশ',
  facebookUrl: 'https://facebook.com',
  messengerUrl: 'https://m.me',
  whatsappNumber: '01700000000',
};

export function loadAdminProfile(): AdminProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ADMIN_PROFILE);
    if (!raw) return DEFAULT_ADMIN_PROFILE;
    return { ...DEFAULT_ADMIN_PROFILE, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_ADMIN_PROFILE;
  }
}

export function saveAdminProfile(profile: AdminProfile): void {
  try {
    localStorage.setItem(STORAGE_KEYS.ADMIN_PROFILE, JSON.stringify(profile));
    notifySync('SAVE_ADMIN_PROFILE');
  } catch (e) {
    console.error('Failed to save admin profile:', e);
  }
}

export function loadLoggedInMemberId(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEYS.LOGGED_IN_MEMBER_ID);
  } catch {
    return null;
  }
}

export function saveLoggedInMemberId(memberId: string | null): void {
  try {
    if (memberId) {
      localStorage.setItem(STORAGE_KEYS.LOGGED_IN_MEMBER_ID, memberId);
    } else {
      localStorage.removeItem(STORAGE_KEYS.LOGGED_IN_MEMBER_ID);
    }
  } catch (e) {
    console.error('Failed to save logged-in member ID:', e);
  }
}



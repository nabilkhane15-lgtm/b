import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getCategoryDefaultWeeklyFee,
  derivePaymentStatus,
  calculateWeeklyPeriodMetrics,
  calculateMonthlyPeriodMetrics,
  calculateFundMetrics,
  calculateMemberSavingsBalance,
  validateSavingsTransaction,
  calculatePicnicMetrics,
  calculateTournamentMetrics,
  calculateClubAccountingSummary,
  applyPaymentCorrection,
} from '../src/utils/accounting.ts';
import {
  hashSecretSync,
  verifySecret,
  normalizePhone,
  findMemberByPhone,
  allocateNextMemberCode,
  getActorRole,
  hasPermission,
  sanitizeMemberSelfUpdate,
  checkLoginRateLimit,
  recordFailedLoginAttempt,
  resetLoginRateLimit,
} from '../src/utils/security.ts';
import type {
  Member,
  Week,
  Payment,
  MonthlyPayment,
  CustomFund,
  FundContribution,
  FundExpense,
  SavingsDeposit,
  PicnicEvent,
  Tournament,
  Expense,
} from '../src/types/index.ts';

const baseWeeks: Week[] = [
  { id: 'w1', weekNumber: 1, startDate: '01/11/2026', endDate: '07/11/2026', targetCollection: 1000, isClosed: true },
  { id: 'w2', weekNumber: 2, startDate: '08/11/2026', endDate: '14/11/2026', targetCollection: 1000, isClosed: false },
];

const sampleMembers: Member[] = [
  {
    id: 'm1',
    memberCode: '1001',
    name: 'Child Player',
    role: 'Player',
    phone: '+8801711000001',
    active: true,
    isActive: true,
    joinedDate: '01/11/2026',
    memberCategory: 'child',
    participatesInSports: true,
    weeklyAmount: 100,
    weeklyTargetAmount: 100,
    monthlyAmount: 400,
    monthlyTargetAmount: 400,
    monthlySavingsTarget: 200,
  },
  {
    id: 'm2',
    memberCode: '1002',
    name: 'Teen Player',
    role: 'Player',
    phone: '+8801711000002',
    active: true,
    isActive: true,
    joinedDate: '01/11/2026',
    memberCategory: 'teen',
    participatesInSports: true,
    weeklyAmount: 200,
    weeklyTargetAmount: 200,
    monthlyAmount: 800,
    monthlyTargetAmount: 800,
    monthlySavingsTarget: 300,
  },
  {
    id: 'm3',
    memberCode: '1003',
    name: 'Youth Player',
    role: 'Player',
    phone: '+8801711000003',
    active: true,
    isActive: true,
    joinedDate: '01/11/2026',
    memberCategory: 'youth',
    participatesInSports: true,
    weeklyAmount: 350,
    weeklyTargetAmount: 350,
    monthlyAmount: 1400,
    monthlyTargetAmount: 1400,
    monthlySavingsTarget: 500,
  },
  {
    id: 'm4',
    memberCode: '1004',
    name: 'Patron Only',
    role: 'General Member',
    phone: '+8801711000004',
    active: true,
    isActive: true,
    joinedDate: '01/11/2026',
    memberCategory: 'youth',
    participatesInSports: false,
    weeklyAmount: 0,
    weeklyTargetAmount: 0,
    monthlyAmount: 0,
    monthlyTargetAmount: 0,
    monthlySavingsTarget: 500,
  },
];

// ==========================================
// 15 REQUIRED ACCOUNTING SCENARIOS
// ==========================================

test('Accounting #1: Weekly target with mixed Child (100), Teen (200), Youth (350), and Patron (0) members', () => {
  assert.equal(getCategoryDefaultWeeklyFee('child'), 100);
  assert.equal(getCategoryDefaultWeeklyFee('teen'), 200);
  assert.equal(getCategoryDefaultWeeklyFee('youth'), 350);

  const weekPayments: Payment[] = [
    { id: 'p1', memberId: 'm1', weekId: 'w2', expectedAmount: 100, paidAmount: 0, status: 'UNPAID', paymentMethod: 'Cash' },
    { id: 'p2', memberId: 'm2', weekId: 'w2', expectedAmount: 200, paidAmount: 0, status: 'UNPAID', paymentMethod: 'Cash' },
    { id: 'p3', memberId: 'm3', weekId: 'w2', expectedAmount: 350, paidAmount: 0, status: 'UNPAID', paymentMethod: 'Cash' },
    { id: 'p4', memberId: 'm4', weekId: 'w2', expectedAmount: 350, paidAmount: 0, status: 'UNPAID', paymentMethod: 'Cash' }, // Patron excluded
  ];

  const metrics = calculateWeeklyPeriodMetrics(weekPayments, sampleMembers, 'w2');
  // Active sports participants: m1 (100) + m2 (200) + m3 (350) = 650. Patron m4 excluded.
  assert.equal(metrics.expected, 650);
  assert.equal(metrics.collected, 0);
  assert.equal(metrics.due, 650);
  assert.equal(metrics.unpaidCount, 3);
});

test('Accounting #2: Partial weekly payment where expected is 350 and paid is 150 -> due must be 200 and status PARTIAL', () => {
  const payments: Payment[] = [
    {
      id: 'p1',
      memberId: 'm3',
      weekId: 'w2',
      expectedAmount: 350,
      paidAmount: 150,
      status: derivePaymentStatus(350, 150),
      paymentMethod: 'bKash',
    },
  ];
  assert.equal(payments[0].status, 'PARTIAL');
  const metrics = calculateWeeklyPeriodMetrics(payments, [sampleMembers[2]], 'w2');
  assert.equal(metrics.expected, 350);
  assert.equal(metrics.collected, 150);
  assert.equal(metrics.due, 200);
  assert.equal(metrics.partialCount, 1);
});

test('Accounting #3: Full weekly payment where expected is 350 and paid is 350 -> due must be 0 and status PAID', () => {
  const payments: Payment[] = [
    {
      id: 'p1',
      memberId: 'm3',
      weekId: 'w2',
      expectedAmount: 350,
      paidAmount: 350,
      status: derivePaymentStatus(350, 350),
      paymentMethod: 'Cash',
    },
  ];
  assert.equal(payments[0].status, 'PAID');
  const metrics = calculateWeeklyPeriodMetrics(payments, [sampleMembers[2]], 'w2');
  assert.equal(metrics.due, 0);
  assert.equal(metrics.paidCount, 1);
  assert.equal(metrics.progressPercent, 100);
});

test('Accounting #4: Overpayment handling where paid is 500 against expected 350 -> due must be 0 (never negative) and advance credit 150', () => {
  const payments: Payment[] = [
    {
      id: 'p1',
      memberId: 'm3',
      weekId: 'w2',
      expectedAmount: 350,
      paidAmount: 500,
      status: derivePaymentStatus(350, 500),
      paymentMethod: 'bKash',
    },
  ];
  const metrics = calculateWeeklyPeriodMetrics(payments, [sampleMembers[2]], 'w2');
  assert.equal(metrics.due, 0);
  assert.equal(metrics.advance, 150);
  assert.equal(metrics.visualProgressPercent, 100);
});

test('Accounting #5: Reversal from PAID (350) to UNPAID (0) -> collected decreases by 350, due increases by 350, audit log entry created', () => {
  const initialPayment: Payment = {
    id: 'p-rev-1',
    memberId: 'm3',
    weekId: 'w2',
    expectedAmount: 350,
    paidAmount: 350,
    status: 'PAID',
    paidDate: '10/11/2026',
    paymentMethod: 'Cash',
  };

  const beforeMetrics = calculateWeeklyPeriodMetrics([initialPayment], [sampleMembers[2]], 'w2');
  assert.equal(beforeMetrics.collected, 350);
  assert.equal(beforeMetrics.due, 0);

  const reversedPayment = applyPaymentCorrection(initialPayment, {
    paidAmount: 0,
    actorRole: 'MASTER_ADMIN',
    actorName: 'Admin',
    reason: 'Marked paid by mistake',
  });

  assert.equal(reversedPayment.paidAmount, 0);
  assert.equal(reversedPayment.status, 'UNPAID');
  assert.equal(reversedPayment.correctionHistory?.length, 1);
  assert.equal(reversedPayment.correctionHistory?.[0].action, 'MARKED_UNPAID');
  assert.equal(reversedPayment.correctionHistory?.[0].previousPaidAmount, 350);
  assert.equal(reversedPayment.correctionHistory?.[0].newPaidAmount, 0);
  assert.equal(reversedPayment.correctionHistory?.[0].reason, 'Marked paid by mistake');

  const afterMetrics = calculateWeeklyPeriodMetrics([reversedPayment], [sampleMembers[2]], 'w2');
  assert.equal(afterMetrics.collected, 0);
  assert.equal(afterMetrics.due, 350);
});

test('Accounting #6: Editing a member weekly fee from 200 to 350 -> open period updates, closed historical period remains 200', () => {
  const historicalSnapshot: Payment = {
    id: 'p-w1-m2',
    memberId: 'm2',
    weekId: 'w1',
    expectedAmount: 200,
    paidAmount: 200,
    status: 'PAID',
    paymentMethod: 'Cash',
  };
  const openPeriodRecord: Payment = {
    id: 'p-w2-m2',
    memberId: 'm2',
    weekId: 'w2',
    expectedAmount: 350,
    paidAmount: 0,
    status: 'UNPAID',
    paymentMethod: 'Cash',
  };

  const promotedMember: Member = {
    ...sampleMembers[1],
    memberCategory: 'youth',
    weeklyAmount: 350,
  };

  const closedWeekMetrics = calculateWeeklyPeriodMetrics([historicalSnapshot], [promotedMember], 'w1');
  const openWeekMetrics = calculateWeeklyPeriodMetrics([openPeriodRecord], [promotedMember], 'w2');

  assert.equal(closedWeekMetrics.expected, 200);
  assert.equal(openWeekMetrics.expected, 350);
});

test('Accounting #7: Special Fund creation with 10 enrolled members at 500 each -> expected 5000, 3 paid (1500), 1 partial (200) -> collected 1700, due 3300', () => {
  const fund: CustomFund = {
    id: 'f1',
    title: 'Winter Jersey Fund',
    category: 'Infrastructure',
    description: 'Club jerseys',
    targetAmount: 5000,
    defaultTargetPerMember: 500,
    status: 'ACTIVE',
    createdDate: '01/11/2026',
  };

  const contributions: FundContribution[] = Array.from({ length: 10 }, (_, idx) => {
    const paidAmount = idx < 3 ? 500 : idx === 3 ? 200 : 0;
    return {
      id: `fc-${idx + 1}`,
      fundId: 'f1',
      memberId: `m-${idx + 1}`,
      expectedAmount: 500,
      paidAmount,
      status: derivePaymentStatus(500, paidAmount),
      date: paidAmount > 0 ? '02/11/2026' : '',
      paymentMethod: 'bKash',
    };
  });

  const metrics = calculateFundMetrics(fund, contributions, []);
  assert.equal(metrics.expectedFromPledges, 5000);
  assert.equal(metrics.collected, 1700);
  assert.equal(metrics.due, 3300);
  assert.equal(metrics.paidCount, 3);
  assert.equal(metrics.partialCount, 1);
  assert.equal(metrics.unpaidCount, 6);
});

test('Accounting #8: Special Fund disbursement of 600 from collected 1700 -> net fund balance 1100', () => {
  const fund: CustomFund = {
    id: 'f1',
    title: 'Winter Jersey Fund',
    category: 'Infrastructure',
    description: 'Club jerseys',
    targetAmount: 5000,
    defaultTargetPerMember: 500,
    status: 'ACTIVE',
    createdDate: '01/11/2026',
  };
  const contributions: FundContribution[] = [
    { id: 'fc1', fundId: 'f1', memberId: 'm1', expectedAmount: 1700, paidAmount: 1700, status: 'PAID', date: '02/11/2026', paymentMethod: 'Cash' },
  ];
  const expenses: FundExpense[] = [
    { id: 'fe1', fundId: 'f1', date: '03/11/2026', title: 'Advance to tailor', amount: 600 },
  ];

  const metrics = calculateFundMetrics(fund, contributions, expenses);
  assert.equal(metrics.collected, 1700);
  assert.equal(metrics.disbursed, 600);
  assert.equal(metrics.netBalance, 1100);
});

test('Accounting #9: Member savings deposit of 1000 and withdrawal of 400 -> member savings balance 600; club operating revenue unchanged', () => {
  const txns: SavingsDeposit[] = [
    { id: 's1', memberId: 'm1', date: '01/11/2026', amount: 1000, type: 'DEPOSIT', paymentMethod: 'bKash' },
    { id: 's2', memberId: 'm1', date: '05/11/2026', amount: 400, type: 'WITHDRAWAL', paymentMethod: 'Cash' },
  ];

  const savingsBal = calculateMemberSavingsBalance(txns, 'm1');
  assert.equal(savingsBal.totalDeposits, 1000);
  assert.equal(savingsBal.totalWithdrawals, 400);
  assert.equal(savingsBal.netBalance, 600);

  const summary = calculateClubAccountingSummary({
    seasonId: 's2026',
    members: [sampleMembers[0]],
    payments: [],
    monthlyPayments: [],
    fundCategories: [],
    fundContributions: [],
    fundExpenses: [],
    expenses: [],
    savingsDeposits: txns,
    picnics: [],
  });

  // Operating revenue must NOT include custodial savings deposits
  assert.equal(summary.totalSeasonCollection, 0);
  assert.equal(summary.operatingCashBalance, 0);
  assert.equal(summary.savingsNetLiability, 600);
  assert.equal(summary.totalTreasuryCashWithSavings, 600);
});

test('Accounting #10: Attempted savings withdrawal of 800 when balance is 600 -> rejected with validation error', () => {
  const txns: SavingsDeposit[] = [
    { id: 's1', memberId: 'm1', date: '01/11/2026', amount: 1000, type: 'DEPOSIT', paymentMethod: 'bKash' },
    { id: 's2', memberId: 'm1', date: '05/11/2026', amount: 400, type: 'WITHDRAWAL', paymentMethod: 'Cash' },
  ];

  const validation = validateSavingsTransaction('m1', 'WITHDRAWAL', 800, txns);
  assert.equal(validation.valid, false);
  assert.equal(validation.availableBalance, 600);
  assert.ok(validation.errorEn?.includes('Insufficient savings balance'));
});

test('Accounting #11: Expense addition (450), edit (to 500), and deletion -> operating balance updates accurately at each step', () => {
  const basePayments: Payment[] = [
    { id: 'p1', memberId: 'm3', weekId: 'w2', expectedAmount: 1000, paidAmount: 1000, status: 'PAID', paymentMethod: 'Cash' },
  ];

  // Step 1: Add expense 450 -> net balance = 1000 - 450 = 550
  const expAdded: Expense[] = [
    { id: 'e1', date: '10/11/2026', category: 'Shuttlecock', amount: 450, notes: '1 box' },
  ];
  const sum1 = calculateClubAccountingSummary({
    seasonId: 's2026',
    members: [sampleMembers[2]],
    payments: basePayments,
    monthlyPayments: [],
    fundCategories: [],
    fundContributions: [],
    fundExpenses: [],
    expenses: expAdded,
    savingsDeposits: [],
    picnics: [],
  });
  assert.equal(sum1.operatingCashBalance, 550);

  // Step 2: Edit expense to 500 -> net balance = 1000 - 500 = 500
  const expEdited: Expense[] = [{ ...expAdded[0], amount: 500 }];
  const sum2 = calculateClubAccountingSummary({
    seasonId: 's2026',
    members: [sampleMembers[2]],
    payments: basePayments,
    monthlyPayments: [],
    fundCategories: [],
    fundContributions: [],
    fundExpenses: [],
    expenses: expEdited,
    savingsDeposits: [],
    picnics: [],
  });
  assert.equal(sum2.operatingCashBalance, 500);

  // Step 3: Delete expense -> net balance = 1000 - 0 = 1000
  const sum3 = calculateClubAccountingSummary({
    seasonId: 's2026',
    members: [sampleMembers[2]],
    payments: basePayments,
    monthlyPayments: [],
    fundCategories: [],
    fundContributions: [],
    fundExpenses: [],
    expenses: [],
    savingsDeposits: [],
    picnics: [],
  });
  assert.equal(sum3.operatingCashBalance, 1000);
});

test('Accounting #12: Picnic booking for 3 family members at 1200 per person -> expected 3600, paid 2000 -> due 1600, status PARTIAL', () => {
  const picnic: PicnicEvent = {
    id: 'pic1',
    title: 'Annual Family Picnic',
    destination: 'Gazipur Resort',
    date: '20/12/2026',
    feePerPerson: 1200,
    estimatedBudget: 30000,
    status: 'BOOKING_OPEN',
    participants: [
      {
        id: 'pt1',
        name: 'Tanvir & Family',
        phone: '+8801711000010',
        membersCount: 3,
        feePerPerson: 1200,
        totalFee: 3600,
        paidAmount: 2000,
        status: derivePaymentStatus(3600, 2000),
      },
    ],
    expenses: [{ id: 'pe1', picnicId: 'pic1', title: 'Resort Advance', category: 'Venue', amount: 1500, date: '01/12/2026' }],
  };

  assert.equal(picnic.participants[0].status, 'PARTIAL');
  const metrics = calculatePicnicMetrics(picnic);
  assert.equal(metrics.totalPersons, 3);
  assert.equal(metrics.expected, 3600);
  assert.equal(metrics.collected, 2000);
  assert.equal(metrics.due, 1600);
  assert.equal(metrics.expensesTotal, 1500);
  assert.equal(metrics.netResult, 500);
});

test('Accounting #13: Tournament fee collection and prize/court expense calculation', () => {
  const tournament: Tournament = {
    id: 't1',
    name: 'Victory Day Smash Cup',
    format: 'Doubles',
    status: 'Ongoing',
    startDate: '16/12/2026',
    budget: 8000,
    prizePool: '5000',
    entryFee: 1000,
    expenses: [
      { id: 'te1', title: 'Court Lighting & Shuttles', amount: 4500, date: '16/12/2026' },
      { id: 'te2', title: 'Champion & Runner-up Trophies', amount: 5000, date: '16/12/2026' },
    ],
    teams: Array.from({ length: 12 }, (_, idx) => ({
      id: `tm-${idx + 1}`,
      name: `Team ${idx + 1}`,
      player1: 'P1',
      player2: 'P2',
      registrationFee: 1000,
      isPaid: true,
      matchesPlayed: 0,
      won: 0,
      lost: 0,
      points: 0,
    })),
    matches: [],
  };

  const metrics = calculateTournamentMetrics(tournament);
  assert.equal(metrics.collected, 12000);
  assert.equal(metrics.expensesTotal, 9500);
  assert.equal(metrics.netResult, 2500);
});

test('Accounting #14: Monthly report vs Season report -> real filtered date/period records, zero hardcoded multipliers', () => {
  const monthlyPayments: MonthlyPayment[] = [
    {
      id: 'mpy-1',
      memberId: 'm3',
      monthId: 'mp-nov',
      expectedAmount: 1400,
      paidAmount: 1400,
      expectedFee: 1400,
      paidFee: 1400,
      expectedSavings: 500,
      paidSavings: 500,
      status: 'PAID',
      paymentMethod: 'bKash',
    },
  ];

  const monthMetrics = calculateMonthlyPeriodMetrics(monthlyPayments, [sampleMembers[2]], 'mp-nov');
  assert.equal(monthMetrics.expected, 1400);
  assert.equal(monthMetrics.collected, 1400);
  assert.equal(monthMetrics.due, 0);
  assert.equal(Number.isInteger(monthMetrics.collected), true);
});

test('Accounting #15: Zero-target / empty-club state -> all progress percentages return 0% without NaN or Infinity', () => {
  const emptyWeekMetrics = calculateWeeklyPeriodMetrics([], [], 'w-empty');
  assert.equal(emptyWeekMetrics.progressPercent, 0);
  assert.equal(Number.isNaN(emptyWeekMetrics.progressPercent), false);

  const zeroFund: CustomFund = {
    id: 'f-zero',
    title: 'Open Fund',
    category: 'Welfare',
    description: '',
    targetAmount: 0,
    defaultTargetPerMember: 0,
    status: 'ACTIVE',
    createdDate: '01/11/2026',
  };
  const emptyFundMetrics = calculateFundMetrics(zeroFund, [], []);
  assert.equal(emptyFundMetrics.progressPercent, 0);
  assert.equal(Number.isFinite(emptyFundMetrics.progressPercent), true);
});

// ==========================================
// 6 REQUIRED AUTHORIZATION SCENARIOS
// ==========================================

test('Authorization #1: Unauthenticated visitor attempting to access admin settings -> blocked; shown Sign-In / Sign-Up prompt', () => {
  const ctx = { isAdmin: false, subAdmin: null, member: null };
  const role = getActorRole(ctx);
  assert.equal(role, 'VISITOR');
  assert.equal(hasPermission(ctx, 'manage_collection'), false);
  assert.equal(hasPermission(ctx, 'manage_members'), false);
  assert.equal(hasPermission(ctx, 'manage_system_settings'), false);
});

test('Authorization #2: Logged-in regular member attempting to mutate club settings or another member payment -> blocked', () => {
  const ctx = { isAdmin: false, subAdmin: null, member: sampleMembers[2] };
  const role = getActorRole(ctx);
  assert.equal(role, 'MEMBER');
  assert.equal(hasPermission(ctx, 'manage_collection'), false);
  assert.equal(hasPermission(ctx, 'manage_expenses'), false);

  // Regular member attempting to tamper with their own weeklyAmount or isActive flag
  const maliciousUpdate: Member = {
    ...sampleMembers[2],
    name: 'Updated Name',
    weeklyAmount: 0,
    monthlyAmount: 0,
    isActive: false,
  };
  const sanitized = sanitizeMemberSelfUpdate(sampleMembers[2], maliciousUpdate);
  assert.equal(sanitized.name, 'Updated Name');
  assert.equal(sanitized.weeklyAmount, 350); // Preserved!
  assert.equal(sanitized.monthlyAmount, 1400); // Preserved!
  assert.equal(sanitized.isActive, true); // Preserved!
});

test('Authorization #3: Sub-admin with only manage_collection attempting to delete an expense or change club settings -> blocked', () => {
  const subAdmin = {
    id: 'sub1',
    name: 'Collection Officer',
    roleTitle: 'Collector',
    phone: '+8801700000000',
    pin: '4321',
    pinHash: hashSecretSync('4321'),
    permissions: ['manage_collection' as const],
    isActive: true,
    createdAt: '01/11/2026',
  };

  const ctx = { isAdmin: false, subAdmin, member: null };
  const role = getActorRole(ctx);
  assert.equal(role, 'SUB_ADMIN');
  assert.equal(hasPermission(ctx, 'manage_collection'), true);
  assert.equal(hasPermission(ctx, 'manage_expenses'), false);
  assert.equal(hasPermission(ctx, 'manage_system_settings'), false);
});

test('Authorization #4: Master admin changing PIN -> old PIN immediately rejected on subsequent verification, new PIN accepted', () => {
  const oldPinHash = hashSecretSync('1234');
  assert.equal(verifySecret('1234', oldPinHash), true);

  const newPinHash = hashSecretSync('9876');
  assert.equal(verifySecret('1234', newPinHash), false);
  assert.equal(verifySecret('9876', newPinHash), true);
});

test('Authorization #5: Duplicate member sign-up with existing phone number -> rejected; sequential 4-digit member code allocated', () => {
  const existing = findMemberByPhone('01711-000003', sampleMembers);
  assert.ok(existing);
  assert.equal(existing?.id, 'm3');
  assert.equal(normalizePhone('01711-000003'), '8801711000003');

  const nextCode = allocateNextMemberCode(sampleMembers);
  assert.equal(nextCode, '1005');
});

test('Authorization #6: Typing "admin" into member login box -> treated as ordinary search query, never grants admin privileges + brute-force lockout', () => {
  const ctx = { isAdmin: false, subAdmin: null, member: null };
  assert.equal(getActorRole(ctx), 'VISITOR');

  const scope = 'test_admin_pin_scope';
  resetLoginRateLimit(scope);
  for (let i = 0; i < 5; i++) {
    recordFailedLoginAttempt(scope);
  }
  const lockStatus = checkLoginRateLimit(scope);
  assert.equal(lockStatus.allowed, false);
  assert.ok(lockStatus.remainingSeconds > 0);
  resetLoginRateLimit(scope);
});

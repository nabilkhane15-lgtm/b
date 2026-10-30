import type {
  AuditLogEntry,
  ClubSettings,
  CustomFund,
  Expense,
  FundContribution,
  FundExpense,
  Member,
  MemberCategory,
  MonthlyPayment,
  MonthRecord,
  Payment,
  PaymentMethod,
  PaymentStatus,
  PicnicEvent,
  SavingsDeposit,
  Tournament,
  Week,
} from '../types/index';

/**
 * Checks whether a week is an "Upcoming" (আসন্ন) week where unpaid fees should NOT yet be counted as overdue/due (বকেয়া).
 */
export function isWeekUpcoming(
  week?: Pick<Week, 'isUpcoming' | 'endDate' | 'startDate' | 'title' | 'titleBangla' | 'isClosed'> | null
): boolean {
  if (!week) return false;
  if (week.isClosed) return false;
  if (week.isUpcoming === true) return true;
  if (week.isUpcoming === false) return false;

  const endStr = (week.endDate || '').trim().toLowerCase();
  if (endStr === 'upcoming' || endStr === 'আসন্ন') return true;

  const titleStr = `${week.title || ''} ${week.titleBangla || ''}`.toLowerCase();
  if (titleStr.includes('upcoming') || titleStr.includes('আসন্ন')) return true;

  return false;
}

/**
 * Checks whether a month is an "Upcoming" (আসন্ন) month where unpaid fees should NOT yet be counted as due (বকেয়া).
 */
export function isMonthUpcoming(
  month?: Pick<MonthRecord, 'id' | 'isUpcoming' | 'title' | 'titleBangla' | 'isClosed'> | null
): boolean {
  if (!month) return false;
  if (month.isClosed) return false;
  if (month.isUpcoming === true) return true;
  if (month.isUpcoming === false) return false;

  const titleStr = `${month.title || ''} ${month.titleBangla || ''}`.toLowerCase();
  if (titleStr.includes('upcoming') || titleStr.includes('আসন্ন')) return true;

  return false;
}

/**
 * Default weekly fee by member age category (integer BDT).
 * Child (বাচ্চা): ৳100, Teen (কিশোর): ৳200, Youth/Adult (যুবক): ৳350
 */
export function getCategoryDefaultWeeklyFee(
  category: MemberCategory | undefined,
  settings?: Partial<ClubSettings>
): number {
  const cat = category || 'youth';
  if (cat === 'child') {
    return toSafeBdtInt(settings?.childWeeklyFee ?? 100);
  }
  if (cat === 'teen') {
    return toSafeBdtInt(settings?.teenWeeklyFee ?? 200);
  }
  return toSafeBdtInt(settings?.youthWeeklyFee ?? settings?.defaultWeeklyFee ?? 350);
}

/**
 * Normalizes any numeric value to a non-negative integer BDT amount.
 */
export function toSafeBdtInt(value: unknown): number {
  const num = Number(value);
  if (!Number.isFinite(num) || isNaN(num)) return 0;
  return Math.max(0, Math.round(num));
}

/**
 * Determines payment status from expectedAmount and paidAmount.
 */
export function derivePaymentStatus(expectedAmount: number, paidAmount: number): PaymentStatus {
  const exp = toSafeBdtInt(expectedAmount);
  const paid = toSafeBdtInt(paidAmount);
  if (exp === 0) {
    return paid > 0 ? 'PAID' : 'UNPAID';
  }
  if (paid >= exp) return 'PAID';
  if (paid > 0) return 'PARTIAL';
  return 'UNPAID';
}

/**
 * Effective weekly expected amount for a payment record.
 * - Preserves historical expectedAmount snapshot when a payment is already PAID or PARTIAL.
 * - Excludes funding-only patrons (`participatesInSports === false`) from weekly dues when unpaid.
 */
export function getEffectiveWeeklyExpected(
  payment: Pick<Payment, 'expectedAmount' | 'paidAmount' | 'status'>,
  member?: Pick<Member, 'participatesInSports' | 'isActive' | 'contributionType'>
): number {
  const snapshotExpected = toSafeBdtInt(payment.expectedAmount);
  const paid = toSafeBdtInt(payment.paidAmount);
  if (member && (member.participatesInSports === false || member.contributionType === 'monthly')) {
    return paid > 0 ? Math.max(snapshotExpected, paid) : 0;
  }
  return snapshotExpected;
}

export interface PeriodAccountingMetrics {
  expected: number;
  collected: number;
  due: number;
  advance: number;
  paidCount: number;
  partialCount: number;
  unpaidCount: number;
  upcomingCount?: number;
  activeObligationCount: number;
  progressPercent: number;
  visualProgressPercent: number;
  isUpcomingPeriod?: boolean;
}

/**
 * Calculates weekly period metrics (Weekly Expected, Weekly Collected, Weekly Due).
 * Excludes non-playing patrons (`participatesInSports === false`) unless they have a paid record.
 * Excludes unpaid payments in "Upcoming" (আসন্ন) weeks from `due` and `unpaidCount`.
 */
export function calculateWeeklyPeriodMetrics(
  payments: Payment[],
  members: Member[],
  weekId?: string,
  targetAmountOverride?: number,
  weeks?: Week[]
): PeriodAccountingMetrics {
  const memberMap = new Map<string, Member>();
  members.forEach((m) => memberMap.set(m.id, m));

  const weekMap = new Map<string, Week>();
  if (weeks) {
    weeks.forEach((w) => weekMap.set(w.id, w));
  }

  const scoped = weekId ? payments.filter((p) => p.weekId === weekId) : payments;
  const targetWeek = weekId ? weekMap.get(weekId) : undefined;
  const isSingleWeekUpcoming = targetWeek ? isWeekUpcoming(targetWeek) : false;

  let expected = 0;
  let collected = 0;
  let due = 0;
  let advance = 0;
  let paidCount = 0;
  let partialCount = 0;
  let unpaidCount = 0;
  let upcomingCount = 0;
  let activeObligationCount = 0;

  for (const p of scoped) {
    const member = memberMap.get(p.memberId);
    const effExpected = getEffectiveWeeklyExpected(p, member);
    const paid = toSafeBdtInt(p.paidAmount);

    if (effExpected === 0 && paid === 0) {
      continue;
    }

    const pWeek = weekMap.get(p.weekId);
    const upcoming = pWeek ? isWeekUpcoming(pWeek) : isSingleWeekUpcoming;

    activeObligationCount += 1;
    expected += effExpected;
    collected += paid;

    if (upcoming && paid === 0) {
      upcomingCount += 1;
      continue;
    }

    const itemDue = Math.max(0, effExpected - paid);
    const itemAdvance = Math.max(0, paid - effExpected);
    due += itemDue;
    advance += itemAdvance;

    const status = derivePaymentStatus(effExpected, paid);
    if (status === 'PAID') paidCount += 1;
    else if (status === 'PARTIAL') partialCount += 1;
    else unpaidCount += 1;
  }

  const denominator =
    targetAmountOverride !== undefined && targetAmountOverride > 0
      ? toSafeBdtInt(targetAmountOverride)
      : expected;

  const progressPercent =
    denominator > 0 ? Math.round((collected / denominator) * 100) : 0;
  const visualProgressPercent = Math.min(100, Math.max(0, progressPercent));

  return {
    expected,
    collected,
    due,
    advance,
    paidCount,
    partialCount,
    unpaidCount,
    upcomingCount,
    activeObligationCount,
    progressPercent,
    visualProgressPercent,
    isUpcomingPeriod: isSingleWeekUpcoming,
  };
}

/**
 * Calculates monthly period metrics (Monthly Expected, Monthly Collected, Monthly Due).
 * Excludes unpaid payments in "Upcoming" (আসন্ন) months from `due` and `unpaidCount`.
 */
export function calculateMonthlyPeriodMetrics(
  monthlyPayments: MonthlyPayment[],
  members: Member[],
  monthId?: string,
  targetAmountOverride?: number,
  months?: MonthRecord[]
): PeriodAccountingMetrics {
  const memberMap = new Map<string, Member>();
  members.forEach((m) => memberMap.set(m.id, m));

  const monthMap = new Map<string, MonthRecord>();
  if (months) {
    months.forEach((m) => monthMap.set(m.id, m));
  }

  const scoped = monthId
    ? monthlyPayments.filter((mp) => mp.monthId === monthId)
    : monthlyPayments;
  const targetMonth = monthId ? monthMap.get(monthId) : undefined;
  const isSingleMonthUpcoming = targetMonth ? isMonthUpcoming(targetMonth) : false;

  let expected = 0;
  let collected = 0;
  let due = 0;
  let advance = 0;
  let paidCount = 0;
  let partialCount = 0;
  let unpaidCount = 0;
  let upcomingCount = 0;
  let activeObligationCount = 0;

  for (const mp of scoped) {
    const member = memberMap.get(mp.memberId);
    const paid = toSafeBdtInt(mp.paidAmount);
    if (
      member &&
      (member.participatesInSports === false || member.contributionType === 'weekly') &&
      paid === 0
    ) {
      continue;
    }
    const effExpected = toSafeBdtInt(mp.expectedAmount);
    if (effExpected === 0 && paid === 0) continue;

    const mRec = monthMap.get(mp.monthId);
    const upcoming = mRec ? isMonthUpcoming(mRec) : isSingleMonthUpcoming;

    activeObligationCount += 1;
    expected += effExpected;
    collected += paid;

    if (upcoming && paid === 0) {
      upcomingCount += 1;
      continue;
    }

    due += Math.max(0, effExpected - paid);
    advance += Math.max(0, paid - effExpected);

    const status = derivePaymentStatus(effExpected, paid);
    if (status === 'PAID') paidCount += 1;
    else if (status === 'PARTIAL') partialCount += 1;
    else unpaidCount += 1;
  }

  const denominator =
    targetAmountOverride !== undefined && targetAmountOverride > 0
      ? toSafeBdtInt(targetAmountOverride)
      : expected;
  const progressPercent =
    denominator > 0 ? Math.round((collected / denominator) * 100) : 0;
  const visualProgressPercent = Math.min(100, Math.max(0, progressPercent));

  return {
    expected,
    collected,
    due,
    advance,
    paidCount,
    partialCount,
    unpaidCount,
    upcomingCount,
    activeObligationCount,
    progressPercent,
    visualProgressPercent,
    isUpcomingPeriod: isSingleMonthUpcoming,
  };
}

export interface FundAccountingMetrics {
  fundId: string;
  targetAmount: number;
  expectedFromPledges: number;
  effectiveTarget: number;
  collected: number;
  due: number;
  disbursed: number;
  netBalance: number;
  progressPercent: number;
  visualProgressPercent: number;
  paidCount: number;
  partialCount: number;
  unpaidCount: number;
  donorCount: number;
}

/**
 * Calculates Special Fund Accounting:
 * - Fund Collected = Sum(valid paid amounts in fund)
 * - Fund Due = Sum(max(0, expectedAmount - paidAmount)) for assigned members/pledges
 *   or max(0, targetAmount - collected) when no member pledges exist
 * - Fund Net Balance = Fund Collected - Fund Linked Expenses
 * - Fund Progress (%) = Target > 0 ? (Collected / Target) * 100 : 0
 */
export function calculateFundMetrics(
  fund: Pick<CustomFund, 'id' | 'targetAmount'>,
  contributions: FundContribution[],
  fundExpenses: FundExpense[] = []
): FundAccountingMetrics {
  const scopedContribs = contributions.filter((c) => c.fundId === fund.id);
  const scopedExpenses = fundExpenses.filter((e) => e.fundId === fund.id);

  let expectedFromPledges = 0;
  let collected = 0;
  let pledgeDue = 0;
  let paidCount = 0;
  let partialCount = 0;
  let unpaidCount = 0;
  let donorCount = 0;

  for (const c of scopedContribs) {
    const exp = toSafeBdtInt(c.expectedAmount);
    const paid = toSafeBdtInt(c.paidAmount);
    expectedFromPledges += exp;
    collected += paid;
    pledgeDue += Math.max(0, exp - paid);

    if (paid > 0) donorCount += 1;
    const status = derivePaymentStatus(exp, paid);
    if (status === 'PAID') paidCount += 1;
    else if (status === 'PARTIAL') partialCount += 1;
    else unpaidCount += 1;
  }

  const targetAmount = toSafeBdtInt(fund.targetAmount);
  const effectiveTarget = targetAmount > 0 ? targetAmount : expectedFromPledges;
  const due =
    scopedContribs.length > 0
      ? pledgeDue
      : Math.max(0, effectiveTarget - collected);

  const disbursed = scopedExpenses.reduce(
    (sum, e) => sum + toSafeBdtInt(e.amount),
    0
  );
  const netBalance = collected - disbursed;

  const progressPercent =
    effectiveTarget > 0 ? Math.round((collected / effectiveTarget) * 100) : 0;
  const visualProgressPercent = Math.min(100, Math.max(0, progressPercent));

  return {
    fundId: fund.id,
    targetAmount,
    expectedFromPledges,
    effectiveTarget,
    collected,
    due,
    disbursed,
    netBalance,
    progressPercent,
    visualProgressPercent,
    paidCount,
    partialCount,
    unpaidCount,
    donorCount,
  };
}

export interface MemberSavingsSummary {
  totalDeposits: number;
  totalWithdrawals: number;
  netBalance: number;
}

/**
 * Calculates Member Savings Balance:
 * Member Savings Balance = Sum(Approved Deposits) - Sum(Approved Withdrawals)
 */
export function calculateMemberSavingsBalance(
  savingsDeposits: SavingsDeposit[],
  memberId?: string,
  seasonId?: string
): MemberSavingsSummary {
  let totalDeposits = 0;
  let totalWithdrawals = 0;

  for (const s of savingsDeposits) {
    if (memberId && s.memberId !== memberId) continue;
    if (seasonId && s.seasonId && s.seasonId !== seasonId) continue;
    const amt = toSafeBdtInt(s.amount);
    if (s.type === 'DEPOSIT') {
      totalDeposits += amt;
    } else if (s.type === 'WITHDRAWAL') {
      totalWithdrawals += amt;
    }
  }

  return {
    totalDeposits,
    totalWithdrawals,
    netBalance: Math.max(0, totalDeposits - totalWithdrawals),
  };
}

/**
 * Validates a savings deposit or withdrawal so a withdrawal never exceeds the member's available balance.
 */
export function validateSavingsTransaction(
  memberId: string,
  type: 'DEPOSIT' | 'WITHDRAWAL',
  amount: number,
  savingsDeposits: SavingsDeposit[],
  seasonId?: string
): { valid: boolean; availableBalance: number; errorEn?: string; errorBn?: string } {
  const cleanAmount = toSafeBdtInt(amount);
  const { netBalance } = calculateMemberSavingsBalance(savingsDeposits, memberId, seasonId);

  if (cleanAmount <= 0) {
    return {
      valid: false,
      availableBalance: netBalance,
      errorEn: 'Amount must be greater than 0 BDT.',
      errorBn: 'টাকার পরিমাণ অবশ্যই ০ টাকার বেশি হতে হবে।',
    };
  }

  if (type === 'WITHDRAWAL' && cleanAmount > netBalance) {
    return {
      valid: false,
      availableBalance: netBalance,
      errorEn: `Insufficient savings balance. Available: ৳${netBalance}, Requested: ৳${cleanAmount}.`,
      errorBn: `পর্যাপ্ত সঞ্চয় ব্যালেন্স নেই! বর্তমান জমা: ৳${netBalance}, উত্তোলনের চেষ্টা: ৳${cleanAmount}।`,
    };
  }

  return { valid: true, availableBalance: netBalance };
}

export interface PicnicAccountingMetrics {
  expected: number;
  collected: number;
  due: number;
  expensesTotal: number;
  netResult: number;
  participantCount: number;
  guestCount: number;
  totalPersons: number;
}

/**
 * Calculates Picnic Accounting:
 * Picnic Net Result = Valid Picnic Collections - Valid Picnic Expenses
 * Outstanding picnic contributions are tracked separately in `due` and never counted as cash collected.
 */
export function calculatePicnicMetrics(picnic: PicnicEvent): PicnicAccountingMetrics {
  let expected = 0;
  let collected = 0;
  let due = 0;
  let totalPersons = 0;

  for (const p of picnic.participants || []) {
    const exp = toSafeBdtInt(p.totalFee ?? p.expectedAmount ?? 0);
    const paid = toSafeBdtInt(p.paidAmount);
    expected += exp;
    collected += paid;
    due += Math.max(0, exp - paid);
    const persons = toSafeBdtInt(p.membersCount ?? (1 + (p.guestsCount || 0)));
    totalPersons += Math.max(1, persons);
  }

  const expensesTotal = (picnic.expenses || []).reduce(
    (sum, e) => sum + toSafeBdtInt(e.amount),
    0
  );
  const netResult = collected - expensesTotal;
  const participantCount = (picnic.participants || []).length;
  const guestCount = Math.max(0, totalPersons - participantCount);

  return {
    expected,
    collected,
    due,
    expensesTotal,
    netResult,
    participantCount,
    guestCount,
    totalPersons,
  };
}

export interface TournamentAccountingMetrics {
  expected: number;
  collected: number;
  due: number;
  expensesTotal: number;
  netResult: number;
  teamCount: number;
  paidTeamCount: number;
}

/**
 * Calculates Tournament Accounting:
 * Entry fees collected from teams with `isPaid === true` (or `feePaid === true`),
 * unpaid team fees in `due`, and tournament-specific expenses in `expensesTotal`.
 */
export function calculateTournamentMetrics(
  tournament: Tournament
): TournamentAccountingMetrics {
  const defaultEntryFee = toSafeBdtInt(tournament.entryFee);
  const teams = tournament.teams || [];
  let expected = 0;
  let collected = 0;
  let paidTeamCount = 0;

  for (const team of teams) {
    const teamFee = toSafeBdtInt(team.registrationFee ?? defaultEntryFee);
    const isPaid = Boolean(team.isPaid ?? team.feePaid);
    expected += teamFee;
    if (isPaid) {
      collected += teamFee;
      paidTeamCount += 1;
    }
  }

  const due = Math.max(0, expected - collected);
  const expensesTotal = (tournament.expenses || []).reduce(
    (sum, e) => sum + toSafeBdtInt(e.amount),
    0
  );

  return {
    expected,
    collected,
    due,
    expensesTotal,
    netResult: collected - expensesTotal,
    teamCount: teams.length,
    paidTeamCount,
  };
}

export interface MemberDueBreakdown {
  memberId: string;
  weeklyDue: number;
  monthlyDue: number;
  fundDue: number;
  picnicDue: number;
  totalDue: number;
  weeklyPaid: number;
  monthlyPaid: number;
  fundPaid: number;
  picnicPaid: number;
  totalPaid: number;
  savingsBalance: number;
}

export interface ClubAccountingSummary {
  openingCashBalance: number;
  weeklyExpected: number;
  weeklyCollected: number;
  weeklyDue: number;
  monthlyExpected: number;
  monthlyCollected: number;
  monthlyDue: number;
  fundsExpected: number;
  fundsCollected: number;
  fundsDue: number;
  picnicExpected: number;
  picnicCollected: number;
  picnicDue: number;
  tournamentExpected: number;
  tournamentCollected: number;
  tournamentDue: number;
  totalSeasonCollection: number;
  generalExpenses: number;
  fundExpensesTotal: number;
  picnicExpensesTotal: number;
  tournamentExpensesTotal: number;
  totalSeasonExpenses: number;
  operatingCashBalance: number;
  savingsTotalDeposits: number;
  savingsTotalWithdrawals: number;
  savingsNetLiability: number;
  totalTreasuryCashWithSavings: number;
  totalClubDue: number;
  memberBreakdown: Record<string, MemberDueBreakdown>;
}

/**
 * Authoritative Single-Source-of-Truth Accounting Engine for Dashboard, Reports, and Exports.
 */
export function calculateClubAccountingSummary(params: {
  seasonId: string;
  members: Member[];
  payments: Payment[];
  monthlyPayments: MonthlyPayment[];
  fundCategories: CustomFund[];
  fundContributions: FundContribution[];
  fundExpenses: FundExpense[];
  expenses: Expense[];
  savingsDeposits: SavingsDeposit[];
  picnics: PicnicEvent[];
  tournaments?: Tournament[];
  openingCashBalance?: number;
  weeks?: Week[];
  months?: MonthRecord[];
}): ClubAccountingSummary {
  const {
    seasonId,
    members,
    payments,
    monthlyPayments,
    fundCategories,
    fundContributions,
    fundExpenses,
    expenses,
    savingsDeposits,
    picnics,
    tournaments = [],
    openingCashBalance = 0,
    weeks = [],
    months = [],
  } = params;

  const weekMap = new Map<string, Week>();
  weeks.forEach((w) => weekMap.set(w.id, w));
  const monthMap = new Map<string, MonthRecord>();
  months.forEach((m) => monthMap.set(m.id, m));

  const seasonPayments = payments.filter((p) => !p.seasonId || p.seasonId === seasonId);
  const seasonMonthly = monthlyPayments.filter((mp) => !mp.seasonId || mp.seasonId === seasonId);
  const seasonFunds = fundCategories.filter((f) => !f.seasonId || f.seasonId === seasonId);
  const seasonFundIds = new Set(seasonFunds.map((f) => f.id));
  const seasonFundContribs = fundContributions.filter(
    (fc) => (!fc.seasonId || fc.seasonId === seasonId) && (seasonFundIds.size === 0 || seasonFundIds.has(fc.fundId))
  );
  const seasonFundExpenses = fundExpenses.filter(
    (fe) => (!fe.seasonId || fe.seasonId === seasonId) && (seasonFundIds.size === 0 || seasonFundIds.has(fe.fundId))
  );
  const seasonExpenses = expenses.filter((e) => !e.seasonId || e.seasonId === seasonId);
  const seasonSavings = savingsDeposits.filter((s) => !s.seasonId || s.seasonId === seasonId);
  const seasonPicnics = picnics.filter((p) => !p.seasonId || p.seasonId === seasonId);
  const seasonTournaments = tournaments.filter((t) => !t.seasonId || t.seasonId === seasonId);

  const memberMap = new Map<string, Member>();
  const memberBreakdown: Record<string, MemberDueBreakdown> = {};

  for (const m of members) {
    memberMap.set(m.id, m);
    memberBreakdown[m.id] = {
      memberId: m.id,
      weeklyDue: 0,
      monthlyDue: 0,
      fundDue: 0,
      picnicDue: 0,
      totalDue: 0,
      weeklyPaid: 0,
      monthlyPaid: 0,
      fundPaid: 0,
      picnicPaid: 0,
      totalPaid: 0,
      savingsBalance: 0,
    };
  }

  // 1. Weekly
  const weeklyMetrics = calculateWeeklyPeriodMetrics(seasonPayments, members, undefined, undefined, weeks);
  for (const p of seasonPayments) {
    const member = memberMap.get(p.memberId);
    const effExp = getEffectiveWeeklyExpected(p, member);
    const paid = toSafeBdtInt(p.paidAmount);
    const pWeek = weekMap.get(p.weekId);
    const upcoming = pWeek ? isWeekUpcoming(pWeek) : false;
    const itemDue = upcoming && paid === 0 ? 0 : Math.max(0, effExp - paid);
    if (memberBreakdown[p.memberId]) {
      memberBreakdown[p.memberId].weeklyDue += itemDue;
      memberBreakdown[p.memberId].weeklyPaid += paid;
    }
  }

  // 2. Monthly
  const monthlyMetrics = calculateMonthlyPeriodMetrics(seasonMonthly, members, undefined, undefined, months);
  for (const mp of seasonMonthly) {
    const member = memberMap.get(mp.memberId);
    if (member && member.participatesInSports === false && toSafeBdtInt(mp.paidAmount) === 0) {
      continue;
    }
    const exp = toSafeBdtInt(mp.expectedAmount);
    const paid = toSafeBdtInt(mp.paidAmount);
    const mRec = monthMap.get(mp.monthId);
    const upcoming = mRec ? isMonthUpcoming(mRec) : false;
    const itemDue = upcoming && paid === 0 ? 0 : Math.max(0, exp - paid);
    if (memberBreakdown[mp.memberId]) {
      memberBreakdown[mp.memberId].monthlyDue += itemDue;
      memberBreakdown[mp.memberId].monthlyPaid += paid;
    }
  }

  // 3. Special Funds
  let fundsExpected = 0;
  let fundsCollected = 0;
  let fundsDue = 0;
  for (const f of seasonFunds) {
    const fMetrics = calculateFundMetrics(f, seasonFundContribs, seasonFundExpenses);
    fundsExpected += fMetrics.effectiveTarget;
    fundsCollected += fMetrics.collected;
    fundsDue += fMetrics.due;
  }
  for (const fc of seasonFundContribs) {
    const exp = toSafeBdtInt(fc.expectedAmount);
    const paid = toSafeBdtInt(fc.paidAmount);
    const itemDue = Math.max(0, exp - paid);
    if (fc.memberId && memberBreakdown[fc.memberId]) {
      memberBreakdown[fc.memberId].fundDue += itemDue;
      memberBreakdown[fc.memberId].fundPaid += paid;
    }
  }

  // 4. Picnics
  let picnicExpected = 0;
  let picnicCollected = 0;
  let picnicDue = 0;
  let picnicExpensesTotal = 0;
  for (const pic of seasonPicnics) {
    const pMetrics = calculatePicnicMetrics(pic);
    picnicExpected += pMetrics.expected;
    picnicCollected += pMetrics.collected;
    picnicDue += pMetrics.due;
    picnicExpensesTotal += pMetrics.expensesTotal;

    for (const part of pic.participants || []) {
      const exp = toSafeBdtInt(part.totalFee ?? part.expectedAmount ?? 0);
      const paid = toSafeBdtInt(part.paidAmount);
      const itemDue = Math.max(0, exp - paid);
      if (part.memberId && memberBreakdown[part.memberId]) {
        memberBreakdown[part.memberId].picnicDue += itemDue;
        memberBreakdown[part.memberId].picnicPaid += paid;
      }
    }
  }

  // 5. Tournaments
  let tournamentExpected = 0;
  let tournamentCollected = 0;
  let tournamentDue = 0;
  let tournamentExpensesTotal = 0;
  for (const trn of seasonTournaments) {
    const tMetrics = calculateTournamentMetrics(trn);
    tournamentExpected += tMetrics.expected;
    tournamentCollected += tMetrics.collected;
    tournamentDue += tMetrics.due;
    tournamentExpensesTotal += tMetrics.expensesTotal;
  }

  // 6. Expenses
  const generalExpenses = seasonExpenses.reduce(
    (sum, e) => sum + toSafeBdtInt(e.amount),
    0
  );
  const fundExpensesTotal = seasonFundExpenses.reduce(
    (sum, fe) => sum + toSafeBdtInt(fe.amount),
    0
  );

  // 7. Savings (Custodial Liability)
  const savingsSummary = calculateMemberSavingsBalance(seasonSavings);
  for (const m of members) {
    const mSav = calculateMemberSavingsBalance(seasonSavings, m.id);
    if (memberBreakdown[m.id]) {
      memberBreakdown[m.id].savingsBalance = mSav.netBalance;
    }
  }

  for (const mId of Object.keys(memberBreakdown)) {
    const b = memberBreakdown[mId];
    b.totalDue = b.weeklyDue + b.monthlyDue + b.fundDue + b.picnicDue;
    b.totalPaid = b.weeklyPaid + b.monthlyPaid + b.fundPaid + b.picnicPaid;
  }

  const cleanOpening = toSafeBdtInt(openingCashBalance);
  const totalSeasonCollection =
    weeklyMetrics.collected +
    monthlyMetrics.collected +
    fundsCollected +
    picnicCollected +
    tournamentCollected;

  const totalSeasonExpenses =
    generalExpenses +
    fundExpensesTotal +
    picnicExpensesTotal +
    tournamentExpensesTotal;

  const operatingCashBalance =
    cleanOpening + totalSeasonCollection - totalSeasonExpenses;

  const totalTreasuryCashWithSavings =
    operatingCashBalance + savingsSummary.netBalance;

  const totalClubDue =
    weeklyMetrics.due +
    monthlyMetrics.due +
    fundsDue +
    picnicDue +
    tournamentDue;

  return {
    openingCashBalance: cleanOpening,
    weeklyExpected: weeklyMetrics.expected,
    weeklyCollected: weeklyMetrics.collected,
    weeklyDue: weeklyMetrics.due,
    monthlyExpected: monthlyMetrics.expected,
    monthlyCollected: monthlyMetrics.collected,
    monthlyDue: monthlyMetrics.due,
    fundsExpected,
    fundsCollected,
    fundsDue,
    picnicExpected,
    picnicCollected,
    picnicDue,
    tournamentExpected,
    tournamentCollected,
    tournamentDue,
    totalSeasonCollection,
    generalExpenses,
    fundExpensesTotal,
    picnicExpensesTotal,
    tournamentExpensesTotal,
    totalSeasonExpenses,
    operatingCashBalance,
    savingsTotalDeposits: savingsSummary.totalDeposits,
    savingsTotalWithdrawals: savingsSummary.totalWithdrawals,
    savingsNetLiability: savingsSummary.netBalance,
    totalTreasuryCashWithSavings,
    totalClubDue,
    memberBreakdown,
  };
}

/**
 * Applies a payment update or correction (`PAID ↔ UNPAID` / `PARTIAL`) and appends an immutable
 * AuditLogEntry to `correctionHistory`.
 */
export function applyPaymentCorrection<
  T extends {
    id: string;
    expectedAmount: number;
    paidAmount: number;
    status: PaymentStatus;
    paymentMethod?: PaymentMethod;
    method?: PaymentMethod;
    paymentDate?: string;
    paidDate?: string;
    date?: string;
    notes?: string;
    transactionRef?: string;
    recordedBy?: string;
    updatedAt?: string;
    correctionHistory?: AuditLogEntry[];
  }
>(
  record: T,
  update: {
    paidAmount: number;
    expectedAmount?: number;
    method?: PaymentMethod;
    paidDate?: string;
    notes?: string;
    transactionRef?: string;
    actorName?: string;
    actorRole?: 'MASTER_ADMIN' | 'SUB_ADMIN' | 'MEMBER' | 'SYSTEM';
    reason?: string;
  }
): T {
  const prevExpected = toSafeBdtInt(record.expectedAmount);
  const newExpected =
    update.expectedAmount !== undefined
      ? toSafeBdtInt(update.expectedAmount)
      : prevExpected;
  const newPaid = toSafeBdtInt(update.paidAmount);
  const newStatus = derivePaymentStatus(newExpected, newPaid);
  const prevPaid = toSafeBdtInt(record.paidAmount);
  const prevStatus = record.status;

  const nowIso = new Date().toISOString();
  const todayFormatted = new Date().toLocaleDateString('en-GB');

  let action: AuditLogEntry['action'] = 'PAYMENT_RECORDED';
  if (prevPaid > 0 && newPaid === 0) {
    action = 'MARKED_UNPAID';
  } else if (prevPaid === 0 && newStatus === 'PAID') {
    action = 'MARKED_PAID';
  } else if (prevExpected !== newExpected && prevPaid === newPaid) {
    action = 'FEE_CHANGED';
  } else if (prevPaid !== newPaid || prevStatus !== newStatus || prevExpected !== newExpected) {
    action = 'PAYMENT_CORRECTED';
  }

  const logEntry: AuditLogEntry = {
    id: `audit_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    timestamp: nowIso,
    action,
    actorName: update.actorName || 'Admin',
    actorRole: update.actorRole || 'MASTER_ADMIN',
    targetId: record.id,
    previousPaidAmount: prevPaid,
    newPaidAmount: newPaid,
    previousStatus: prevStatus,
    newStatus,
    reason: update.reason,
    transactionRef: update.transactionRef,
  };

  const existingHistory = Array.isArray(record.correctionHistory)
    ? record.correctionHistory
    : [];

  const resolvedMethod =
    newPaid > 0
      ? update.method || record.paymentMethod || record.method || 'Cash'
      : record.paymentMethod || 'Cash';
  const resolvedDate =
    newPaid > 0
      ? update.paidDate || record.paymentDate || record.paidDate || record.date || todayFormatted
      : '';

  return {
    ...record,
    expectedAmount: newExpected,
    paidAmount: newPaid,
    status: newStatus,
    paymentMethod: resolvedMethod,
    method: resolvedMethod,
    paymentDate: resolvedDate,
    paidDate: resolvedDate || undefined,
    ...(record.date !== undefined ? { date: resolvedDate } : {}),
    notes: update.notes !== undefined ? update.notes : record.notes,
    transactionRef:
      update.transactionRef !== undefined
        ? update.transactionRef
        : record.transactionRef,
    recordedBy: update.actorName || record.recordedBy || 'Admin',
    updatedAt: nowIso,
    correctionHistory: [...existingHistory, logEntry],
  };
}

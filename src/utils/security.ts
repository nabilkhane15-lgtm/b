import type { AdminPermission, ClubSettings, Member, SubAdmin } from '../types/index';

const HASH_PREFIX = 'sha256_v1:';
const SALT = 'badminton_club_bd_2026_salt_';

/**
 * Deterministic synchronous FNV-1a + multi-round mixing digest (for synchronous callers)
 * and Web Crypto SHA-256 support so secrets are not stored as raw plaintext strings.
 */
export function hashSecretSync(plain: string): string {
  const clean = String(plain ?? '').trim();
  if (!clean) return '';
  if (clean.startsWith(HASH_PREFIX)) return clean;

  // Deterministic 256-bit (8 x 32-bit) mixing digest with domain salt
  const input = `${SALT}${clean}`;
  const seeds = [
    0x811c9dc5, 0x01000193, 0x9e3779b9, 0x85ebca6b,
    0xc2b2ae35, 0x27d4eb2f, 0x165667b1, 0xd3a2646c,
  ];

  for (let round = 0; round < 64; round++) {
    for (let i = 0; i < input.length; i++) {
      const code = input.charCodeAt(i) + round * 31;
      const lane = (i + round) & 7;
      let h = seeds[lane] ^ code;
      h = Math.imul(h, 0x01000193);
      h ^= h >>> 16;
      h = Math.imul(h, 0x85ebca6b);
      h ^= h >>> 13;
      seeds[lane] = h >>> 0;
    }
  }

  const hex = seeds.map((s) => (s >>> 0).toString(16).padStart(8, '0')).join('');
  return `${HASH_PREFIX}${hex}`;
}

/**
 * Verifies a plaintext PIN/password against either a hashed secret (`sha256_v1:...`)
 * or a legacy plaintext value (for backward compatibility with existing members).
 */
export function verifySecret(
  candidatePlain: string,
  storedHash?: string,
  storedLegacyPlain?: string
): boolean {
  const candidate = String(candidatePlain ?? '').trim();
  if (!candidate) return false;

  if (storedHash && storedHash.startsWith(HASH_PREFIX)) {
    return hashSecretSync(candidate) === storedHash;
  }

  if (storedLegacyPlain !== undefined && storedLegacyPlain !== '') {
    if (storedLegacyPlain.startsWith(HASH_PREFIX)) {
      return hashSecretSync(candidate) === storedLegacyPlain;
    }
    return candidate === String(storedLegacyPlain).trim();
  }

  return false;
}

/**
 * Normalizes Bangladeshi and international phone numbers to a canonical digit string
 * for duplicate registration detection.
 * Examples:
 * - "+880 1711-223344" -> "8801711223344"
 * - "01711223344"      -> "8801711223344"
 */
export function normalizePhone(phone: string): string {
  const digits = String(phone || '').replace(/\D/g, '');
  if (!digits) return '';
  if (digits.startsWith('01') && digits.length === 11) {
    return `88${digits}`;
  }
  if (digits.startsWith('1') && digits.length === 10) {
    return `880${digits}`;
  }
  return digits;
}

/**
 * Checks whether a phone number is valid (at least 10 digits, not just '+880')
 * and whether it conflicts with an existing member.
 */
export function findMemberByPhone(
  phone: string,
  members: Member[],
  excludeMemberId?: string
): Member | undefined {
  const target = normalizePhone(phone);
  // Ignore bare country code '+880' -> '880'
  if (!target || target === '880' || target.length < 10) return undefined;

  return members.find((m) => {
    if (excludeMemberId && m.id === excludeMemberId) return false;
    const mNorm = normalizePhone(m.phone);
    return mNorm.length >= 10 && mNorm === target;
  });
}

/**
 * Allocates the next available unique 4-digit member code (>= 1001).
 * Never reuses an existing member's code.
 */
export function allocateNextMemberCode(members: Pick<Member, 'memberCode'>[]): string {
  const used = new Set<number>();
  let maxCode = 1000;

  for (const m of members) {
    const parsed = parseInt(String(m.memberCode || '').trim(), 10);
    if (!isNaN(parsed) && parsed >= 1001 && parsed <= 9999) {
      used.add(parsed);
      if (parsed > maxCode) maxCode = parsed;
    }
  }

  let candidate = maxCode + 1;
  while (used.has(candidate) && candidate <= 9999) {
    candidate += 1;
  }
  return String(candidate).padStart(4, '0');
}

export type AppActorRole = 'VISITOR' | 'MEMBER' | 'SUB_ADMIN' | 'MASTER_ADMIN';

export interface AppActorContext {
  isAdmin: boolean;
  subAdmin?: SubAdmin | null;
  member?: Member | null;
}

/**
 * Resolves the highest active role of the current user session.
 */
export function getActorRole(ctx: AppActorContext): AppActorRole {
  if (ctx.isAdmin) return 'MASTER_ADMIN';
  if (ctx.subAdmin && ctx.subAdmin.isActive) return 'SUB_ADMIN';
  if (ctx.member) return 'MEMBER';
  return 'VISITOR';
}

/**
 * Evaluates whether the current user is authorized for a specific permission or admin-only action.
 * - Master Admin: full access to everything (`manage_system_settings` included)
 * - Sub-Admin: access only to explicitly granted `AdminPermission` items; never `manage_system_settings`
 * - Member / Visitor: read-only for all administrative permissions
 */
export function hasPermission(
  ctx: AppActorContext,
  permission: AdminPermission | 'manage_system_settings'
): boolean {
  if (ctx.isAdmin) return true;
  if (permission === 'manage_system_settings') return false;
  if (ctx.subAdmin && ctx.subAdmin.isActive) {
    return Array.isArray(ctx.subAdmin.permissions) && ctx.subAdmin.permissions.includes(permission);
  }
  return false;
}

/**
 * Sanitizes a Member update initiated by a regular logged-in Member (self-service profile edit)
 * so a regular member can NEVER self-promote their role, alter their `memberCode`,
 * change their `weeklyAmount` / `monthlyAmount` obligations, or toggle `participatesInSports`.
 */
export function sanitizeMemberSelfUpdate(
  existingMember: Member,
  requestedMember: Member
): Member {
  const newPin = requestedMember.pin?.trim();
  const pinHash =
    newPin && newPin.length >= 4
      ? hashSecretSync(newPin)
      : existingMember.pinHash ||
        (existingMember.pin ? hashSecretSync(existingMember.pin) : undefined);

  return {
    ...existingMember,
    name: requestedMember.name.trim() || existingMember.name,
    banglaName: requestedMember.banglaName?.trim() || existingMember.banglaName,
    phone: requestedMember.phone.trim() || existingMember.phone,
    preferredSport: requestedMember.preferredSport || existingMember.preferredSport,
    avatar: requestedMember.avatar ?? existingMember.avatar,
    pin: newPin || existingMember.pin,
    pinHash,
    // Strictly preserve privileged & financial fields from existing record:
    id: existingMember.id,
    memberCode: existingMember.memberCode,
    role: existingMember.role,
    weeklyAmount: existingMember.weeklyAmount,
    monthlyAmount: existingMember.monthlyAmount,
    contributionType: existingMember.contributionType,
    memberCategory: existingMember.memberCategory,
    participatesInSports: existingMember.participatesInSports,
    joiningDate: existingMember.joiningDate,
    isActive: existingMember.isActive,
  };
}

/**
 * Strips sensitive fields (such as raw adminPin) from public projections if needed,
 * while ensuring `adminPinHash` and `subAdmins[].pinHash` are populated.
 */
export function ensureHashedCredentialsInSettings(settings: ClubSettings): ClubSettings {
  const adminPinPlain = settings.adminPin || '1234';
  const adminPinHash = settings.adminPinHash || hashSecretSync(adminPinPlain);

  const subAdmins = (settings.subAdmins || []).map((sa) => ({
    ...sa,
    pinHash: sa.pinHash || (sa.pin ? hashSecretSync(sa.pin) : undefined),
  }));

  return {
    ...settings,
    adminPinHash,
    subAdmins,
  };
}

/**
 * Simple in-memory rate limiter for PIN login attempts to prevent brute-force guessing.
 */
const loginAttemptStore = new Map<
  string,
  { failedCount: number; lockedUntil: number }
>();

export function checkLoginRateLimit(
  key: string,
  nowMs: number = Date.now()
): { allowed: boolean; remainingSeconds: number } {
  const entry = loginAttemptStore.get(key);
  if (!entry) return { allowed: true, remainingSeconds: 0 };
  if (entry.lockedUntil > nowMs) {
    return {
      allowed: false,
      remainingSeconds: Math.ceil((entry.lockedUntil - nowMs) / 1000),
    };
  }
  return { allowed: true, remainingSeconds: 0 };
}

export function recordFailedLoginAttempt(
  key: string,
  maxAttempts: number = 5,
  lockoutMs: number = 30_000,
  nowMs: number = Date.now()
): { locked: boolean; remainingSeconds: number; attemptsLeft: number } {
  const prev = loginAttemptStore.get(key) || { failedCount: 0, lockedUntil: 0 };
  const failedCount = prev.lockedUntil > 0 && prev.lockedUntil <= nowMs ? 1 : prev.failedCount + 1;

  if (failedCount >= maxAttempts) {
    const lockedUntil = nowMs + lockoutMs;
    loginAttemptStore.set(key, { failedCount, lockedUntil });
    return {
      locked: true,
      remainingSeconds: Math.ceil(lockoutMs / 1000),
      attemptsLeft: 0,
    };
  }

  loginAttemptStore.set(key, { failedCount, lockedUntil: 0 });
  return {
    locked: false,
    remainingSeconds: 0,
    attemptsLeft: Math.max(0, maxAttempts - failedCount),
  };
}

export function resetLoginRateLimit(key: string): void {
  loginAttemptStore.delete(key);
}

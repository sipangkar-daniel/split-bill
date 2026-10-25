import type { AppState, Bill, Person, PersonBalance, Settlement } from './types';
import JSONCrush from 'jsoncrush';

// ─── URL State Encoding (JSONCrush + Base64URL) ───────────────────────────
//
// 1. JSONCrush compresses repeated substrings in the JSON (keys, IDs, etc.).
// 2. Base64URL converts the crushed string strictly into [A-Za-z0-9_-].
//    This guarantees NO characters like ' ( ) ! ~ * that trigger Markdown
//    or URL truncation in messaging apps (WhatsApp, Telegram, Instagram).
//

/**
 * Convert string (UTF-8) to Base64URL string [A-Za-z0-9_-].
 */
export function toBase64Url(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  const chunkSize = 8192;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize);
    binary += String.fromCharCode.apply(null, chunk as unknown as number[]);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/**
 * Convert Base64URL string back to decoded string.
 */
export function fromBase64Url(base64url: string): string {
  const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64 + '=='.slice(0, (4 - (base64.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
}

/**
 * Encode AppState to a compressed, strictly Base64URL-safe string.
 */
export function encodeState(state: AppState): string {
  const json = JSON.stringify(state);
  const crushed = JSONCrush.crush(json);
  return toBase64Url(crushed);
}

/**
 * Decode an encoded string back to AppState.
 * Supports:
 * - Tier 1: Current format (Base64URL -> JSONCrush uncrush -> JSON.parse)
 * - Tier 2: Legacy raw Base64URL (Base64URL -> JSON.parse)
 * - Tier 3: Raw JSONCrush with URI encoding (JSONCrush uncrush -> JSON.parse)
 */
export function decodeState(encoded: string): AppState | null {
  // Tier 1 & 2: Base64URL decodable
  try {
    const text = fromBase64Url(encoded);
    // Try uncrush first
    try {
      const uncrushed = JSONCrush.uncrush(text);
      const parsed = JSON.parse(uncrushed) as AppState;
      if (validateState(parsed)) return parsed;
    } catch {
      // not crushed
    }
    // Try raw JSON parse
    try {
      const parsed = JSON.parse(text) as AppState;
      if (validateState(parsed)) return parsed;
    } catch {
      // not raw JSON
    }
  } catch {
    // not base64url
  }

  // Tier 3: Raw JSONCrush (supports URI-encoded or unencoded)
  try {
    const uncrushed = JSONCrush.uncrush(decodeURIComponent(encoded));
    const parsed = JSON.parse(uncrushed) as AppState;
    if (validateState(parsed)) return parsed;
  } catch {
    // ignore
  }

  try {
    const uncrushed = JSONCrush.uncrush(encoded);
    const parsed = JSON.parse(uncrushed) as AppState;
    if (validateState(parsed)) return parsed;
  } catch {
    // ignore
  }

  return null;
}

/**
 * Basic schema validation for decoded state.
 */
function validateState(state: unknown): state is AppState {
  const s = state as AppState;
  return (
    s != null &&
    Array.isArray(s.people) &&
    Array.isArray(s.bills) &&
    s.people.every((p) => typeof p.id === 'string' && typeof p.name === 'string')
  );
}

/**
 * Build a shareable URL from the current state.
 * Uses path param: /s/{base64url}
 */
export function buildShareUrl(state: AppState): string {
  const encoded = encodeState(state);
  const url = new URL(window.location.href);
  url.search = '';
  url.hash = '';
  url.pathname = '/s/' + encoded;
  return url.toString();
}

// Format currency in Indonesian Rupiah format
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount);
}

// Calculate how much each participant owes per bill (integer division with remainder distributed)
export function calculateBillShares(bill: Bill): Map<string, number> {
  const shares = new Map<string, number>();
  const count = bill.participants.length;
  if (count === 0) return shares;

  const baseShare = Math.floor(bill.amount / count);
  const remainder = bill.amount - baseShare * count;

  bill.participants.forEach((personId, index) => {
    // Distribute remainder to first N participants (1 extra rupiah each)
    shares.set(personId, index < remainder ? baseShare + 1 : baseShare);
  });

  return shares;
}

// Calculate balances for all people across all bills
export function calculateBalances(people: Person[], bills: Bill[]): PersonBalance[] {
  // Initialize totals
  const shareMap = new Map<string, number>();
  const paidMap = new Map<string, number>();

  people.forEach((p) => {
    shareMap.set(p.id, 0);
    paidMap.set(p.id, 0);
  });

  bills.forEach((bill) => {
    // Add payment to payer
    if (paidMap.has(bill.paidBy)) {
      paidMap.set(bill.paidBy, (paidMap.get(bill.paidBy) ?? 0) + bill.amount);
    }

    // Distribute shares among participants
    const billShares = calculateBillShares(bill);
    billShares.forEach((share, personId) => {
      if (shareMap.has(personId)) {
        shareMap.set(personId, (shareMap.get(personId) ?? 0) + share);
      }
    });
  });

  return people.map((person) => {
    const share = shareMap.get(person.id) ?? 0;
    const paid = paidMap.get(person.id) ?? 0;
    const balance = paid - share;
    return { person, share, paid, balance };
  });
}

// Calculate optimal settlement using greedy matching
// Minimizes number of transactions
export function calculateSettlement(balances: PersonBalance[]): Settlement[] {
  const settlements: Settlement[] = [];

  // Create mutable arrays of creditors (positive) and debtors (negative)
  const creditors = balances
    .filter((b) => b.balance > 0)
    .map((b) => ({ person: b.person, amount: b.balance }))
    .sort((a, b) => b.amount - a.amount);

  const debtors = balances
    .filter((b) => b.balance < 0)
    .map((b) => ({ person: b.person, amount: -b.balance }))
    .sort((a, b) => b.amount - a.amount);

  let ci = 0;
  let di = 0;

  while (ci < creditors.length && di < debtors.length) {
    const creditor = creditors[ci];
    const debtor = debtors[di];

    if (creditor.amount === 0) { ci++; continue; }
    if (debtor.amount === 0) { di++; continue; }

    const transferAmount = Math.min(creditor.amount, debtor.amount);

    if (transferAmount > 0) {
      settlements.push({
        from: debtor.person,
        to: creditor.person,
        amount: transferAmount,
      });
    }

    creditor.amount -= transferAmount;
    debtor.amount -= transferAmount;

    if (creditor.amount === 0) ci++;
    if (debtor.amount === 0) di++;
  }

  return settlements;
}

// Generate a unique id
export function generateId(): string {
  return Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
}

// Format settlement as plain text
export function settlementToText(settlements: Settlement[]): string {
  if (settlements.length === 0) return 'Everyone is settled! 🎉';
  const lines = settlements.map(
    (s) => `${s.from.name} → ${s.to.name}: ${formatCurrency(s.amount)}`
  );
  return `Split Bill Settlement\n\n${lines.join('\n')}`;
}

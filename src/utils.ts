import type { AppState, Bill, Person, PersonBalance, Settlement } from './types';
import JSONCrush from 'jsoncrush';

// ─── URL State Encoding (JSONCrush) ────────────────────────────────────────
//
// JSONCrush compresses JSON strings by replacing repeated substrings with
// single-character substitutions, then URI-encodes the result.
// This produces URLs ~60-70% shorter than raw base64 for typical split-bill
// data with repetitive IDs and field names.
//

/**
 * Encode AppState to a JSONCrush-compressed, URI-safe string.
 */
export function encodeState(state: AppState): string {
  const json = JSON.stringify(state);
  return JSONCrush.crush(json);
}

/**
 * Decode a JSONCrush string back to AppState.
 * Also supports legacy base64url format for backward compatibility.
 */
export function decodeState(encoded: string): AppState | null {
  try {
    // Try JSONCrush first (current format)
    const json = JSONCrush.uncrush(encoded);
    const parsed = JSON.parse(json) as AppState;
    if (validateState(parsed)) return parsed;
    return null;
  } catch {
    // Fall back to legacy base64url decoding
    return decodeStateLegacy(encoded);
  }
}

/**
 * Legacy base64url decoder — keeps old shared links working.
 */
function decodeStateLegacy(encoded: string): AppState | null {
  try {
    const base64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64 + '=='.slice(0, (4 - (base64.length % 4)) % 4);
    const binary = atob(padded);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    const json = new TextDecoder().decode(bytes);
    const parsed = JSON.parse(json) as AppState;
    if (validateState(parsed)) return parsed;
    return null;
  } catch {
    return null;
  }
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
 * Uses path param: /s/{crushed}
 */
export function buildShareUrl(state: AppState): string {
  const crushed = encodeState(state);
  const url = new URL(window.location.href);
  url.search = '';
  url.hash = '';
  url.pathname = '/s/' + encodeURIComponent(crushed);
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

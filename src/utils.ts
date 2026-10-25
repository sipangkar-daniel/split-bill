import type { AppState, Bill, Person, PersonBalance, Settlement } from './types';

// ─── URL State Encoding ────────────────────────────────────────────────────

/**
 * Encode AppState to a URL-safe base64 string.
 * Uses JSON → UTF-8 bytes → base64url to handle Unicode names safely.
 */
export function encodeState(state: AppState): string {
  const json = JSON.stringify(state);
  // UTF-8 encode to handle non-ASCII characters (e.g. Indonesian names)
  const bytes = new TextEncoder().encode(json);
  let binary = '';
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/**
 * Decode a base64url string back to AppState.
 * Returns null if the string is invalid or malformed.
 */
export function decodeState(encoded: string): AppState | null {
  try {
    // Restore standard base64 padding and characters
    const base64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64 + '=='.slice(0, (4 - (base64.length % 4)) % 4);
    const binary = atob(padded);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    const json = new TextDecoder().decode(bytes);
    const parsed = JSON.parse(json) as AppState;
    // Basic schema validation
    if (
      Array.isArray(parsed.people) &&
      Array.isArray(parsed.bills) &&
      parsed.people.every((p) => typeof p.id === 'string' && typeof p.name === 'string')
    ) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Build a shareable URL from the current state.
 */
export function buildShareUrl(state: AppState): string {
  const encoded = encodeState(state);
  const url = new URL(window.location.href);
  url.search = '';
  url.hash = '';
  url.searchParams.set('data', encoded);
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

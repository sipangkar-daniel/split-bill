import { useState, useEffect, useCallback } from 'react';
import type { AppState, Bill, Person } from '../types';
import { INITIAL_DATA } from '../initialData';
import { generateId } from '../utils';

const STORAGE_KEY = 'splitbill_state_v1';

function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as AppState;
      // Basic validation
      if (parsed.people && parsed.bills) return parsed;
    }
  } catch {
    // ignore
  }
  return INITIAL_DATA;
}

function saveState(state: AppState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

export function useAppState() {
  const [state, setState] = useState<AppState>(loadState);
  const [newestBillId, setNewestBillId] = useState<string | null>(null);

  // Persist to localStorage on every change
  useEffect(() => {
    saveState(state);
  }, [state]);

  // Add a new person
  const addPerson = useCallback((name: string) => {
    const person: Person = { id: generateId(), name };
    setState((prev) => ({ ...prev, people: [...prev.people, person] }));
  }, []);

  // Remove a person and clean up bills
  const removePerson = useCallback((id: string) => {
    setState((prev) => {
      const people = prev.people.filter((p) => p.id !== id);
      // Remove person from all bills' participants; remove bills where no participants remain
      const bills = prev.bills
        .map((bill) => {
          const participants = bill.participants.filter((pid) => pid !== id);
          // If payer is removed, assign to first remaining participant or first person
          const paidBy =
            bill.paidBy === id
              ? participants[0] ?? people[0]?.id ?? bill.paidBy
              : bill.paidBy;
          return { ...bill, participants, paidBy };
        })
        .filter((bill) => bill.participants.length > 0);
      return { people, bills };
    });
  }, []);

  // Add a new empty bill
  const addBill = useCallback(() => {
    setState((prev) => {
      if (prev.people.length === 0) return prev;
      const id = generateId();
      const newBill: Bill = {
        id,
        name: 'New Bill',
        amount: 0,
        paidBy: prev.people[0].id,
        participants: prev.people.map((p) => p.id),
      };
      setNewestBillId(id);
      return { ...prev, bills: [...prev.bills, newBill] };
    });
  }, []);

  // Update an existing bill
  const updateBill = useCallback((updated: Bill) => {
    setState((prev) => ({
      ...prev,
      bills: prev.bills.map((b) => (b.id === updated.id ? updated : b)),
    }));
  }, []);

  // Delete a bill
  const deleteBill = useCallback((id: string) => {
    setState((prev) => ({ ...prev, bills: prev.bills.filter((b) => b.id !== id) }));
    setNewestBillId((prev) => (prev === id ? null : prev));
  }, []);

  // Reset to initial data
  const resetToInitial = useCallback(() => {
    const fresh = INITIAL_DATA;
    setState(fresh);
    setNewestBillId(null);
    saveState(fresh);
  }, []);

  return {
    state,
    newestBillId,
    addPerson,
    removePerson,
    addBill,
    updateBill,
    deleteBill,
    resetToInitial,
  };
}

import { useState } from 'react';
import { ChevronDown, ChevronUp, List } from 'lucide-react';
import type { Bill, Person } from '../types';
import { formatCurrency, calculateBillShares } from '../utils';

interface BillBreakdownProps {
  bills: Bill[];
  people: Person[];
}

function BillBreakdownItem({ bill, people }: { bill: Bill; people: Person[] }) {
  const [open, setOpen] = useState(false);
  const paidByPerson = people.find((p) => p.id === bill.paidBy);
  const shares = calculateBillShares(bill);

  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-gray-50 transition-colors text-left"
      >
        <div>
          <p className="text-sm font-semibold text-gray-900">{bill.name}</p>
          <p className="text-xs text-gray-400 mt-0.5">
            {formatCurrency(bill.amount)}
            {paidByPerson && <span className="ml-1">· Paid by {paidByPerson.name}</span>}
          </p>
        </div>
        <div className="text-gray-400 shrink-0">
          {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {open && (
        <div className="border-t border-gray-100 px-4 py-3 space-y-1.5 animate-fadeIn bg-gray-50">
          {bill.participants.map((personId) => {
            const person = people.find((p) => p.id === personId);
            const share = shares.get(personId) ?? 0;
            if (!person) return null;
            return (
              <div key={personId} className="flex items-center justify-between text-sm">
                <span className="text-gray-700">{person.name}</span>
                <span className="font-medium text-gray-900">{formatCurrency(share)}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function BillBreakdown({ bills, people }: BillBreakdownProps) {
  if (bills.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <div className="flex items-center gap-2 mb-5">
        <List className="w-5 h-5 text-indigo-600" />
        <h2 className="text-lg font-semibold text-gray-900">Bill Breakdown</h2>
      </div>
      <div className="space-y-3">
        {bills.map((bill) => (
          <BillBreakdownItem key={bill.id} bill={bill} people={people} />
        ))}
      </div>
    </div>
  );
}

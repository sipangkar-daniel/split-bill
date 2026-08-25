import { BarChart3 } from 'lucide-react';
import type { PersonBalance } from '../types';
import { formatCurrency } from '../utils';
import { PersonBalanceCard } from './PersonBalanceCard';

interface SummaryProps {
  balances: PersonBalance[];
  totalBill: number;
}

export function Summary({ balances, totalBill }: SummaryProps) {
  return (
    <div id="tour-summary" className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      {/* Header */}
      <div className="flex items-center gap-2 mb-5">
        <BarChart3 className="w-5 h-5 text-indigo-600" />
        <h2 className="text-lg font-semibold text-gray-900">Summary</h2>
      </div>

      {/* Total Bill */}
      <div className="bg-indigo-50 rounded-xl px-4 py-4 mb-5">
        <p className="text-xs text-indigo-500 font-medium uppercase tracking-wider">Total Bill</p>
        <p className="text-2xl font-bold text-indigo-700 mt-1">{formatCurrency(totalBill)}</p>
        {balances.length > 0 && (
          <p className="text-xs text-indigo-400 mt-1">
            across {balances.length} {balances.length === 1 ? 'person' : 'people'}
          </p>
        )}
      </div>

      {/* Balance Table Header */}
      {balances.length > 0 && (
        <>
          <div className="hidden sm:grid grid-cols-4 gap-2 px-0 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
            <span className="col-span-1">Person</span>
            <span className="text-right">Share</span>
            <span className="text-right">Paid</span>
            <span className="text-right">Balance</span>
          </div>
          <div className="divide-y divide-gray-50">
            {balances.map((b) => (
              <PersonBalanceCard key={b.person.id} balance={b} />
            ))}
          </div>
        </>
      )}

      {balances.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          <p className="text-sm">Add people and bills to see the summary.</p>
        </div>
      )}
    </div>
  );
}

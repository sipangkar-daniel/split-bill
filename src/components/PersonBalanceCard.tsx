import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { PersonBalance } from '../types';
import { formatCurrency } from '../utils';

interface PersonBalanceCardProps {
  balance: PersonBalance;
}

export function PersonBalanceCard({ balance }: PersonBalanceCardProps) {
  const { person, share, paid, balance: net } = balance;
  const isPositive = net > 0;
  const isNeutral = net === 0;

  return (
    <div className="flex items-center gap-4 py-3.5 border-b border-gray-50 last:border-0 group animate-fadeIn">
      {/* Avatar */}
      <div className="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm shrink-0">
        {person.name.charAt(0).toUpperCase()}
      </div>

      {/* Name + Status */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900">{person.name}</p>
        <p className="text-xs text-gray-400 mt-0.5">
          Share {formatCurrency(share)} · Paid {formatCurrency(paid)}
        </p>
      </div>

      {/* Balance */}
      <div className="flex items-center gap-1.5 shrink-0">
        {isNeutral ? (
          <Minus className="w-4 h-4 text-gray-400" />
        ) : isPositive ? (
          <TrendingUp className="w-4 h-4 text-emerald-500" />
        ) : (
          <TrendingDown className="w-4 h-4 text-red-500" />
        )}
        <div className="text-right">
          <p
            className={`text-sm font-bold ${
              isNeutral ? 'text-gray-500' : isPositive ? 'text-emerald-600' : 'text-red-500'
            }`}
          >
            {isPositive ? '+' : ''}
            {formatCurrency(net)}
          </p>
          <p className="text-xs text-gray-400">
            {isNeutral ? 'Settled' : isPositive ? 'To receive' : 'To pay'}
          </p>
        </div>
      </div>
    </div>
  );
}

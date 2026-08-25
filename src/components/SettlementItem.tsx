import { useState } from 'react';
import { Copy, Check, ArrowRight } from 'lucide-react';
import type { Settlement } from '../types';
import { formatCurrency } from '../utils';

interface SettlementItemProps {
  settlement: Settlement;
}

export function SettlementItem({ settlement }: SettlementItemProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    const text = `${settlement.from.name} → ${settlement.to.name}: ${formatCurrency(settlement.amount)}`;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex items-center justify-between gap-4 py-4 border-b border-gray-50 last:border-0 animate-fadeIn">
      {/* From → To */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {/* From */}
        <div className="text-center min-w-0 shrink-0">
          <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-red-600 font-bold text-sm mb-1">
            {settlement.from.name.charAt(0).toUpperCase()}
          </div>
          <p className="text-xs font-semibold text-gray-700 truncate max-w-[60px]">{settlement.from.name}</p>
          <p className="text-xs text-red-500">pays</p>
        </div>

        {/* Arrow + Amount */}
        <div className="flex-1 flex flex-col items-center gap-1">
          <p className="text-sm font-bold text-gray-900">{formatCurrency(settlement.amount)}</p>
          <ArrowRight className="w-5 h-5 text-gray-300" />
        </div>

        {/* To */}
        <div className="text-center min-w-0 shrink-0">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 font-bold text-sm mb-1">
            {settlement.to.name.charAt(0).toUpperCase()}
          </div>
          <p className="text-xs font-semibold text-gray-700 truncate max-w-[60px]">{settlement.to.name}</p>
          <p className="text-xs text-emerald-500">receives</p>
        </div>
      </div>

      {/* Copy Button */}
      <button
        onClick={handleCopy}
        className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-gray-500 hover:text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg transition-all shrink-0"
        title="Copy to clipboard"
      >
        {copied ? (
          <>
            <Check className="w-3.5 h-3.5 text-emerald-500" />
            <span className="text-emerald-500">Copied</span>
          </>
        ) : (
          <>
            <Copy className="w-3.5 h-3.5" />
            <span>Copy</span>
          </>
        )}
      </button>
    </div>
  );
}

import { useState } from 'react';
import { ArrowLeftRight, Copy, Check, PartyPopper } from 'lucide-react';
import type { Settlement as SettlementType } from '../types';
import { settlementToText } from '../utils';
import { SettlementItem } from './SettlementItem';

interface SettlementProps {
  settlements: SettlementType[];
  onShareImage: () => void;
  shareStatus: 'idle' | 'capturing' | 'sharing' | 'done' | 'error' | 'downloaded';
  errorMsg?: string;
}

const WhatsAppIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.713-1.458L0 24zm6.59-2.735c1.606.953 3.005 1.458 4.757 1.459 5.839 0 10.593-4.759 10.596-10.597.002-2.827-1.1-5.485-3.098-7.488-1.998-1.999-4.653-3.097-7.48-3.097-5.84 0-10.596 4.759-10.599 10.597-.001 1.93.505 3.81 1.465 5.482l-.993 3.626 3.754-.984zm10.702-4.737c-.292-.146-1.728-.853-1.995-.951-.267-.099-.463-.146-.659.146-.195.292-.757.951-.928 1.147-.171.195-.341.219-.633.073-.292-.146-1.234-.454-2.35-1.452-.87-.775-1.457-1.733-1.628-2.025-.171-.292-.018-.45.128-.595.132-.131.292-.341.439-.512.146-.171.195-.292.292-.487.099-.195.05-.366-.025-.512-.075-.146-.659-1.586-.902-2.172-.236-.57-.477-.492-.659-.501-.17-.008-.366-.01-.561-.01-.195 0-.512.073-.78.366-.269.292-1.025 1.001-1.025 2.441 0 1.439 1.049 2.83 1.195 3.025.147.195 2.064 3.15 5.002 4.417.699.301 1.244.482 1.67.618.702.223 1.341.191 1.847.116.563-.083 1.728-.707 1.972-1.39.244-.683.244-1.268.171-1.39-.072-.121-.268-.195-.56-.341z" />
  </svg>
);

export function Settlement({ settlements, onShareImage, shareStatus, errorMsg }: SettlementProps) {
  const [copiedAll, setCopiedAll] = useState(false);

  async function handleCopyAll() {
    const text = settlementToText(settlements);
    await navigator.clipboard.writeText(text);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2500);
  }

  const isSettled = settlements.length === 0;

  const getShareButtonText = () => {
    switch (shareStatus) {
      case 'capturing':
        return 'Mengambil gambar...';
      case 'sharing':
        return 'Membuka WhatsApp...';
      case 'done':
        return 'Tershare!';
      case 'downloaded':
        return 'Gambar Terdownload!';
      case 'error':
        return 'Gagal Share';
      default:
        return 'Share';
    }
  };

  return (
    <div id="tour-settlement" className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-2">
          <ArrowLeftRight className="w-5 h-5 text-indigo-600" />
          <h2 className="text-lg font-semibold text-gray-900">Who Pays Who?</h2>
        </div>
        {!isSettled && (
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleCopyAll}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-gray-50 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
            >
              {copiedAll ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  Copy All
                </>
              )}
            </button>
            <button
              onClick={onShareImage}
              disabled={shareStatus !== 'idle'}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-300 text-white rounded-lg transition-colors shadow-sm"
            >
              <WhatsAppIcon className="w-3.5 h-3.5" />
              <span>{getShareButtonText()}</span>
            </button>
          </div>
        )}
      </div>

      {errorMsg && (
        <p className="text-red-500 text-xs mb-3 font-medium bg-red-50 px-3 py-2 rounded-lg">
          {errorMsg}
        </p>
      )}

      {shareStatus === 'downloaded' && (
        <div className="text-xs text-emerald-600 mb-3 font-medium bg-emerald-50 px-3 py-2 rounded-lg animate-fadeIn">
          Gambar rincian telah terdownload. Silakan kirim gambar tersebut ke WhatsApp yang baru saja dibuka.
        </div>
      )}

      {/* Content */}
      {isSettled ? (
        <div className="text-center py-10 animate-fadeIn">
          <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <PartyPopper className="w-7 h-7 text-emerald-500" />
          </div>
          <p className="text-lg font-semibold text-gray-900">Everyone is settled 🎉</p>
          <p className="text-sm text-gray-400 mt-1">No payments needed right now.</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-50">
          {settlements.map((s, i) => (
            <SettlementItem key={`${s.from.id}-${s.to.id}-${i}`} settlement={s} />
          ))}
        </div>
      )}
    </div>
  );
}

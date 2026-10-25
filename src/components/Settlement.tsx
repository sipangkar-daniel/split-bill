import { useState } from 'react';
import { ArrowLeftRight, Share2, PartyPopper } from 'lucide-react';
import type { Settlement as SettlementType } from '../types';
import type { AppState } from '../types';
import { buildShareUrl } from '../utils';
import { SettlementItem } from './SettlementItem';
import { ShareLinkModal } from './ShareLinkModal';

interface SettlementProps {
  settlements: SettlementType[];
  state: AppState;
  onShareImage: () => void;
  shareStatus: 'idle' | 'capturing' | 'sharing' | 'done' | 'error' | 'downloaded';
  errorMsg?: string;
}

export function Settlement({ settlements, state, onShareImage, shareStatus, errorMsg }: SettlementProps) {
  const [shareUrl, setShareUrl] = useState<string | null>(null);

  function handleOpenShare() {
    setShareUrl(buildShareUrl(state));
  }

  const isSettled = settlements.length === 0;

  return (
    <>
      <div id="tour-settlement" className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <ArrowLeftRight className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-semibold text-gray-900">Who Pays Who?</h2>
          </div>

          {/* Single Share button */}
          <button
            onClick={handleOpenShare}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors shadow-sm"
          >
            <Share2 className="w-3.5 h-3.5" />
            Share
          </button>
        </div>

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

      {/* Unified Share Modal */}
      {shareUrl && (
        <ShareLinkModal
          url={shareUrl}
          settlements={settlements}
          onShareImage={onShareImage}
          shareStatus={shareStatus}
          errorMsg={errorMsg}
          onClose={() => setShareUrl(null)}
        />
      )}
    </>
  );
}

import { useState, useEffect, useRef } from 'react';
import { X, Copy, Check, Share2 } from 'lucide-react';
import type { Settlement as SettlementType } from '../types';
import { settlementToText } from '../utils';

const WhatsAppIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.713-1.458L0 24zm6.59-2.735c1.606.953 3.005 1.458 4.757 1.459 5.839 0 10.593-4.759 10.596-10.597.002-2.827-1.1-5.485-3.098-7.488-1.998-1.999-4.653-3.097-7.48-3.097-5.84 0-10.596 4.759-10.599 10.597-.001 1.93.505 3.81 1.465 5.482l-.993 3.626 3.754-.984zm10.702-4.737c-.292-.146-1.728-.853-1.995-.951-.267-.099-.463-.146-.659.146-.195.292-.757.951-.928 1.147-.171.195-.341.219-.633.073-.292-.146-1.234-.454-2.35-1.452-.87-.775-1.457-1.733-1.628-2.025-.171-.292-.018-.45.128-.595.132-.131.292-.341.439-.512.146-.171.195-.292.292-.487.099-.195.05-.366-.025-.512-.075-.146-.659-1.586-.902-2.172-.236-.57-.477-.492-.659-.501-.17-.008-.366-.01-.561-.01-.195 0-.512.073-.78.366-.269.292-1.025 1.001-1.025 2.441 0 1.439 1.049 2.83 1.195 3.025.147.195 2.064 3.15 5.002 4.417.699.301 1.244.482 1.67.618.702.223 1.341.191 1.847.116.563-.083 1.728-.707 1.972-1.39.244-.683.244-1.268.171-1.39-.072-.121-.268-.195-.56-.341z" />
  </svg>
);

interface ShareModalProps {
  url: string;
  settlements: SettlementType[];
  onShareImage: () => void;
  shareStatus: 'idle' | 'capturing' | 'sharing' | 'done' | 'error' | 'downloaded';
  errorMsg?: string;
  onClose: () => void;
}

export function ShareLinkModal({
  url,
  settlements,
  onShareImage,
  shareStatus,
  errorMsg,
  onClose,
}: ShareModalProps) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedAll, setCopiedAll] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-select input on open
  useEffect(() => {
    inputRef.current?.select();
  }, []);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  async function handleCopyLink() {
    await navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  }

  async function handleCopyAll() {
    const text = settlementToText(settlements);
    await navigator.clipboard.writeText(text);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2500);
  }

  const waButtonLabel = () => {
    switch (shareStatus) {
      case 'capturing': return 'Mengambil gambar...';
      case 'sharing':   return 'Membuka WhatsApp...';
      case 'done':      return 'Tershare!';
      case 'downloaded':return 'Gambar Terdownload!';
      case 'error':     return 'Gagal Share';
      default:          return 'Share ke WhatsApp';
    }
  };

  const isSettled = settlements.length === 0;

  function copyButtonHandle(copiedLink: boolean) {
    return <>
      {copiedLink ? (
          <><Check className="w-3.5 h-3.5"/>Tersalin!</>
      ) : (
          <><Copy className="w-3.5 h-3.5"/>Salin Link</>
      )}
    </>;
  }

  return (
    <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md animate-fadeIn overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center">
              <Share2 className="w-4 h-4 text-indigo-600"/>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Share Split Bill</h3>
            </div>
          </div>
          <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1.5 rounded-lg hover:bg-gray-100"
          >
            <X className="w-4 h-4"/>
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">

          {/* ── Section 1: Share Link ─────────────────────────────── */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Share Link
            </p>
            {/*<p className="text-xs text-gray-500 mb-3 leading-relaxed">*/}
            {/*  Kirim link ini ke teman. Data tersimpan langsung di dalam link — tidak perlu backend.*/}
            {/*</p>*/}
            <div className="flex gap-2">
              <input
                  ref={inputRef}
                  readOnly
                  value={url}
                  className="flex-1 text-xs bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-gray-600 font-mono truncate outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300"
                  onClick={() => inputRef.current?.select()}
              />
              <button
                  onClick={handleCopyLink}
                  className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl transition-all whitespace-nowrap ${
                      copiedLink
                          ? 'bg-emerald-500 text-white'
                          : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                  }`}
              >
                {copyButtonHandle(copiedLink)}

              </button>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-100"/>

          {/* ── Section 2: Copy Text ──────────────────────────────── */}
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
            Salin Split Bill Dalam Bentuk Text
          </p>
          <div>
            <button
                onClick={handleCopyAll}
                disabled={isSettled}
                className={`w-full flex items-center justify-center gap-2 py-2.5 text-xs font-semibold rounded-xl border transition-all ${
                    copiedAll
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-600'
                        : isSettled
                            ? 'bg-gray-50 border-gray-100 text-gray-300 cursor-not-allowed'
                            : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                }`}
            >
              {copyButtonHandle(copiedAll)}
            </button>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-100"/>

          {/* ── Section 3: WhatsApp Image ─────────────────────────── */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Share Via WhatsApp
            </p>
            <p className="text-xs text-gray-500 mb-3">
              Bagikan rincian split bill ke teman melalui gambar lewat WhatsApp.
            </p>

            {errorMsg && (
                <p className="text-red-500 text-xs mb-2 font-medium bg-red-50 px-3 py-2 rounded-lg">
                  {errorMsg}
                </p>
            )}
            {shareStatus === 'downloaded' && (
                <p className="text-emerald-600 text-xs mb-2 font-medium bg-emerald-50 px-3 py-2 rounded-lg">
                  Gambar terdownload. Kirim ke WhatsApp yang baru saja dibuka.
                </p>
            )}

            <button
                onClick={onShareImage}
                disabled={shareStatus !== 'idle'}
                className="w-full flex items-center justify-center gap-2 py-2.5 text-xs font-semibold bg-[#25D366] hover:bg-[#1ebe5d] disabled:bg-emerald-200 text-white rounded-xl transition-colors shadow-sm"
            >
              <WhatsAppIcon className="w-3.5 h-3.5"/>
              {waButtonLabel()}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

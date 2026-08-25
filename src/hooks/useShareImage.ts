import { useRef, useState, useCallback } from 'react';
import html2canvas from 'html2canvas';

export type ShareStatus = 'idle' | 'capturing' | 'sharing' | 'done' | 'error' | 'downloaded';

export function useShareImage() {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [status, setStatus] = useState<ShareStatus>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const captureToBlob = useCallback(async (): Promise<Blob | null> => {
    const el = cardRef.current;
    if (!el) return null;

    // Temporarily make it visible for html2canvas (still off-screen)
    const prevPos = el.style.position;
    const prevTop = el.style.top;
    const prevLeft = el.style.left;
    el.style.position = 'absolute';
    el.style.top = '-9999px';
    el.style.left = '-9999px';

    const canvas = await html2canvas(el, {
      backgroundColor: null,
      scale: 2,          // @2x for crisp rendering on mobile
      useCORS: true,
      logging: false,
    });

    el.style.position = prevPos;
    el.style.top = prevTop;
    el.style.left = prevLeft;

    return new Promise<Blob | null>((resolve) => {
      canvas.toBlob((blob) => resolve(blob), 'image/png');
    });
  }, []);

  const share = useCallback(async () => {
    setStatus('capturing');
    setErrorMsg('');

    try {
      const blob = await captureToBlob();
      if (!blob) throw new Error('Gagal membuat gambar.');

      const file = new File([blob], 'splitbill-rincian.png', { type: 'image/png' });

      // Try Web Share API with file support (works on mobile / Chrome Android / Safari iOS)
      const canShareFile =
        typeof navigator.share === 'function' &&
        typeof navigator.canShare === 'function' &&
        navigator.canShare({ files: [file] });

      setStatus('sharing');

      if (canShareFile) {
        await navigator.share({
          files: [file],
          title: 'Rincian Split Bill',
          text: 'Ini rincian pembagian tagihan kita 🧾',
        });
        setStatus('done');
      } else {
        // Fallback: download the image, then open WhatsApp
        downloadBlob(blob, 'splitbill-rincian.png');
        setStatus('downloaded');
        // Open WhatsApp web after a short delay
        setTimeout(() => {
          window.open('https://wa.me/', '_blank');
        }, 800);
      }
    } catch (err: unknown) {
      // User cancelled share → treat as idle, not an error
      if (err instanceof Error && err.name === 'AbortError') {
        setStatus('idle');
        return;
      }
      setErrorMsg(err instanceof Error ? err.message : 'Gagal share gambar.');
      setStatus('error');
    }

    // Reset to idle after 3 s
    setTimeout(() => setStatus('idle'), 3000);
  }, [captureToBlob]);

  return { cardRef, status, errorMsg, share };
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

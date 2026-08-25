import { useState, useEffect, useRef } from 'react';
import { X, ChevronRight, HelpCircle } from 'lucide-react';

interface OnboardingStep {
  targetId: string;
  title: string;
  description: string;
  placement: 'bottom' | 'top' | 'left' | 'right';
}

const STEPS: OnboardingStep[] = [
  {
    targetId: 'tour-people',
    title: 'Daftar Orang (People) 👥',
    description: 'Tambahkan nama semua teman yang ikut nongkrong di sini. Anda juga bisa menghapus orang dengan aman.',
    placement: 'bottom',
  },
  {
    targetId: 'tour-bills',
    title: 'Daftar Tagihan (Bills) 🧾',
    description: 'Masukkan semua pengeluaran. Tentukan siapa yang membayar dan centang siapa saja yang ikut menikmati tagihannya.',
    placement: 'bottom',
  },
  {
    targetId: 'tour-summary',
    title: 'Ringkasan Saldo (Summary) 📊',
    description: 'Lihat total pengeluaran dan status saldo bersih masing-masing orang secara real-time.',
    placement: 'top',
  },
  {
    targetId: 'tour-settlement',
    title: 'Cara Pembayaran (Who Pays Who?) 💸',
    description: 'Solusi pembayaran tercepat dengan jumlah transfer sesedikit mungkin. Anda bisa mengkopi teks atau membagikan gambar rincian langsung ke WhatsApp!',
    placement: 'top',
  },
];

interface OnboardingProps {
  forceStart?: boolean;
  onCloseForceStart?: () => void;
}

export function Onboarding({ forceStart, onCloseForceStart }: OnboardingProps) {
  const [currentStep, setCurrentStep] = useState<number>(-1);
  const [coords, setCoords] = useState<{ top: number; left: number; width: number; height: number } | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);

  // Check if user has seen the tour before
  useEffect(() => {
    const hasSeenTour = localStorage.getItem('splitbill_seen_tour');
    if (!hasSeenTour) {
      setCurrentStep(0);
    }
  }, []);

  // Handle force restart trigger
  useEffect(() => {
    if (forceStart) {
      setCurrentStep(0);
    }
  }, [forceStart]);

  // Track coordinates of the current targeted element
  useEffect(() => {
    if (currentStep < 0 || currentStep >= STEPS.length) {
      setCoords(null);
      return;
    }

    const stepInfo = STEPS[currentStep];
    const el = document.getElementById(stepInfo.targetId);

    if (!el) {
      // Element not found yet (maybe not rendered), try again in a bit
      const timer = setTimeout(() => {
        const retryEl = document.getElementById(stepInfo.targetId);
        if (retryEl) updateCoordinates(retryEl);
      }, 100);
      return () => clearTimeout(timer);
    }

    updateCoordinates(el);

    // Update on resize or scroll
    const handleUpdate = () => updateCoordinates(el);
    window.addEventListener('resize', handleUpdate);
    window.addEventListener('scroll', handleUpdate);

    return () => {
      window.removeEventListener('resize', handleUpdate);
      window.removeEventListener('scroll', handleUpdate);
    };
  }, [currentStep]);

  const updateCoordinates = (el: HTMLElement) => {
    const rect = el.getBoundingClientRect();
    setCoords({
      top: rect.top + window.scrollY,
      left: rect.left + window.scrollX,
      width: rect.width,
      height: rect.height,
    });
    // Scroll element into view smoothly if it's offscreen
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleClose();
    }
  };

  const handleClose = () => {
    setCurrentStep(-1);
    localStorage.setItem('splitbill_seen_tour', 'true');
    if (onCloseForceStart) {
      onCloseForceStart();
    }
  };

  if (currentStep < 0 || !coords) return null;

  const stepInfo = STEPS[currentStep];

  // Calculate tooltip placement styles
  const getTooltipStyle = () => {
    const gap = 12;
    if (stepInfo.placement === 'bottom') {
      return {
        top: `${coords.top + coords.height + gap}px`,
        left: `${coords.left + coords.width / 2}px`,
        transform: 'translateX(-50%)',
      };
    }
    // Default top
    return {
      top: `${coords.top - gap}px`,
      left: `${coords.left + coords.width / 2}px`,
      transform: 'translateX(-50%) translateY(-100%)',
    };
  };

  return (
    <>
      {/* Dimmed backdrop overlay highlighting the target */}
      <div
        className="fixed inset-0 z-40 bg-black/40 pointer-events-none transition-opacity duration-300"
        style={{
          clipPath: `polygon(
            0% 0%, 
            0% 100%, 
            ${coords.left}px 100%, 
            ${coords.left}px ${coords.top}px, 
            ${coords.left + coords.width}px ${coords.top}px, 
            ${coords.left + coords.width}px ${coords.top + coords.height}px, 
            ${coords.left}px ${coords.top + coords.height}px, 
            ${coords.left}px 100%, 
            100% 100%, 
            100% 0%
          )`,
        }}
      />

      {/* Interactive blocker for the highlight area (allows clicking inside the tooltip/onboarding, but blocks app interactions during onboarding) */}
      <div className="fixed inset-0 z-40 bg-transparent pointer-events-auto" onClick={handleClose} />

      {/* Tooltip Card */}
      <div
        ref={tooltipRef}
        style={getTooltipStyle()}
        className="absolute z-50 bg-white rounded-2xl shadow-2xl p-5 border border-indigo-100 max-w-[340px] w-[90vw] animate-fadeIn pointer-events-auto"
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Step Indicator */}
        <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md">
          Langkah {currentStep + 1} dari {STEPS.length}
        </span>

        {/* Content */}
        <h4 className="text-base font-bold text-gray-900 mt-3">{stepInfo.title}</h4>
        <p className="text-sm text-gray-500 mt-1.5 leading-relaxed">{stepInfo.description}</p>

        {/* Action Buttons */}
        <div className="flex items-center justify-between mt-5 pt-3 border-t border-gray-100">
          <button
            onClick={handleClose}
            className="text-xs font-semibold text-gray-400 hover:text-gray-600 transition-colors"
          >
            Lewati
          </button>
          <button
            onClick={handleNext}
            className="flex items-center gap-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition-all shadow-sm"
          >
            <span>{currentStep === STEPS.length - 1 ? 'Selesai' : 'Lanjut'}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </>
  );
}

// Help Tour Button Component
interface TourButtonProps {
  onClick: () => void;
}

export function TourButton({ onClick }: TourButtonProps) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-all"
      title="Mulai Panduan Aplikasi"
    >
      <HelpCircle className="w-4 h-4" />
      <span className="hidden sm:inline">Panduan</span>
    </button>
  );
}

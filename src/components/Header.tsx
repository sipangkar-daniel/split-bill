import { RotateCcw, Receipt, HelpCircle } from 'lucide-react';

interface HeaderProps {
  onReset: () => void;
  onStartTour: () => void;
}

export function Header({ onReset, onStartTour }: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center shadow-sm">
            <Receipt className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 leading-tight">SplitBill</h1>
            <p className="text-xs text-gray-500 hidden sm:block">
              Bagi tagihan dengan mudah dan tahu siapa harus bayar siapa.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onStartTour}
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-all duration-150 active:scale-95 cursor-pointer"
            title="Mulai Panduan Aplikasi"
          >
            <HelpCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Panduan</span>
          </button>

          <button
            onClick={onReset}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl transition-all duration-150 active:scale-95 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset</span>
          </button>
        </div>
      </div>
    </header>
  );
}

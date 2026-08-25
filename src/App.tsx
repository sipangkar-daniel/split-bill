import { useMemo, useState } from 'react';
import { Header } from './components/Header';
import { PeopleSection } from './components/PeopleSection';
import { BillsSection } from './components/BillsSection';
import { Summary } from './components/Summary';
import { Settlement } from './components/Settlement';
import { BillBreakdown } from './components/BillBreakdown';
import { ShareCard } from './components/ShareCard';
import { Onboarding } from './components/Onboarding';
import { useAppState } from './hooks/useAppState';
import { useShareImage } from './hooks/useShareImage';
import { calculateBalances, calculateSettlement } from './utils';

export default function App() {
  const {
    state,
    newestBillId,
    addPerson,
    removePerson,
    addBill,
    updateBill,
    deleteBill,
    resetToInitial,
  } = useAppState();

  const { people, bills } = state;
  const [startTour, setStartTour] = useState(false);
  const { cardRef, status: shareStatus, errorMsg: shareErrorMsg, share: handleShareImage } = useShareImage();

  // Calculate derived data
  const balances = useMemo(() => calculateBalances(people, bills), [people, bills]);
  const settlements = useMemo(() => calculateSettlement(balances), [balances]);
  const totalBill = useMemo(() => bills.reduce((sum, b) => sum + b.amount, 0), [bills]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        onReset={resetToInitial}
        onStartTour={() => setStartTour(true)}
      />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Mobile subtitle */}
        <p className="text-sm text-gray-400 mb-6 sm:hidden text-center">
          Bagi tagihan dengan mudah dan tahu siapa harus bayar siapa.
        </p>

        {/* Two-column layout on desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* Left Column */}
          <div className="space-y-6">
            <PeopleSection
              people={people}
              onAddPerson={addPerson}
              onRemovePerson={removePerson}
            />
            <BillsSection
              bills={bills}
              people={people}
              onAddBill={addBill}
              onUpdateBill={updateBill}
              onDeleteBill={deleteBill}
              newestBillId={newestBillId}
            />
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <Summary balances={balances} totalBill={totalBill} />
            <Settlement
              settlements={settlements}
              onShareImage={handleShareImage}
              shareStatus={shareStatus}
              errorMsg={shareErrorMsg}
            />
            <BillBreakdown bills={bills} people={people} />
          </div>
        </div>
      </main>

      {/* Offscreen ShareCard for html2canvas capture */}
      <ShareCard
        cardRef={cardRef}
        totalBill={totalBill}
        balances={balances}
        settlements={settlements}
      />

      {/* Onboarding Flow */}
      <Onboarding
        forceStart={startTour}
        onCloseForceStart={() => setStartTour(false)}
      />
    </div>
  );
}

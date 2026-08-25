import { Receipt, PlusCircle } from 'lucide-react';
import type { Bill, Person } from '../types';
import { BillCard } from './BillCard';

interface BillsSectionProps {
  bills: Bill[];
  people: Person[];
  onAddBill: () => void;
  onUpdateBill: (updated: Bill) => void;
  onDeleteBill: (id: string) => void;
  newestBillId: string | null;
}

export function BillsSection({
  bills,
  people,
  onAddBill,
  onUpdateBill,
  onDeleteBill,
  newestBillId,
}: BillsSectionProps) {
  return (
    <div id="tour-bills" className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      {/* Card Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Receipt className="w-5 h-5 text-indigo-600" />
          <h2 className="text-lg font-semibold text-gray-900">Bills</h2>
        </div>
        <span className="text-sm font-medium text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
          {bills.length} {bills.length === 1 ? 'bill' : 'bills'}
        </span>
      </div>

      {/* Bills List */}
      {bills.length === 0 ? (
        <div className="text-center py-10 text-gray-400 mb-4">
          <Receipt className="w-10 h-10 mx-auto mb-2 opacity-30" />
          <p className="font-medium text-gray-500">No bills yet</p>
          <p className="text-sm mt-1">Add your first bill to start splitting.</p>
        </div>
      ) : (
        <div className="space-y-3 mb-4">
          {bills.map((bill) => (
            <BillCard
              key={bill.id}
              bill={bill}
              people={people}
              onUpdate={onUpdateBill}
              onDelete={onDeleteBill}
              defaultOpen={bill.id === newestBillId}
            />
          ))}
        </div>
      )}

      {/* Add Bill Button */}
      {people.length > 0 ? (
        <button
          onClick={onAddBill}
          className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-indigo-200 text-indigo-600 hover:border-indigo-400 hover:bg-indigo-50 rounded-xl text-sm font-medium transition-all duration-150 active:scale-98"
        >
          <PlusCircle className="w-4 h-4" />
          Add Bill
        </button>
      ) : (
        <p className="text-center text-sm text-gray-400 py-2">Add people first to create bills.</p>
      )}
    </div>
  );
}

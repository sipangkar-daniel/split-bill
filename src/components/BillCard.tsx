import { useState } from 'react';
import { ChevronDown, ChevronUp, Trash2, AlertCircle } from 'lucide-react';
import type { Bill, Person } from '../types';
import { formatCurrency } from '../utils';
import { CustomSelect } from './CustomSelect';

interface BillCardProps {
  bill: Bill;
  people: Person[];
  onUpdate: (updated: Bill) => void;
  onDelete: (id: string) => void;
  defaultOpen?: boolean;
}

export function BillCard({ bill, people, onUpdate, onDelete, defaultOpen = false }: BillCardProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const paidByPerson = people.find((p) => p.id === bill.paidBy);

  function validate(field: string, value: string | number | string[]): boolean {
    const newErrors = { ...errors };

    if (field === 'amount') {
      const n = typeof value === 'number' ? value : Number(value);
      if (!n || n <= 0) {
        newErrors.amount = 'Please enter a valid bill amount.';
      } else {
        delete newErrors.amount;
      }
    }

    if (field === 'participants') {
      const arr = value as string[];
      if (arr.length === 0) {
        newErrors.participants = 'Select at least one participant.';
      } else {
        delete newErrors.participants;
      }
    }

    if (field === 'name') {
      const s = value as string;
      if (!s.trim()) {
        newErrors.name = 'Bill name cannot be empty.';
      } else {
        delete newErrors.name;
      }
    }

    setErrors(newErrors);
    return !newErrors[field];
  }

  function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    validate('name', e.target.value);
    onUpdate({ ...bill, name: e.target.value });
  }

  function handleAmountChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value.replace(/\D/g, '');
    const num = val ? parseInt(val, 10) : 0;
    validate('amount', num);
    onUpdate({ ...bill, amount: num });
  }

  function handlePaidByChange(personId: string) {
    onUpdate({ ...bill, paidBy: personId });
  }

  function handleParticipantToggle(personId: string) {
    let newParticipants: string[];
    if (bill.participants.includes(personId)) {
      newParticipants = bill.participants.filter((id) => id !== personId);
    } else {
      newParticipants = [...bill.participants, personId];
    }
    validate('participants', newParticipants);
    onUpdate({ ...bill, participants: newParticipants });
  }

  const sharePerPerson =
    bill.participants.length > 0 ? Math.floor(bill.amount / bill.participants.length) : 0;

  return (
    <div className="border border-gray-100 rounded-2xl overflow-hidden bg-white shadow-sm transition-all duration-200">
      {/* Bill Summary Row */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors text-left"
      >
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 truncate">{bill.name || 'Untitled Bill'}</p>
          <p className="text-sm text-gray-500 mt-0.5">
            {formatCurrency(bill.amount)}
            {paidByPerson && (
              <span className="ml-2 text-gray-400">· Paid by {paidByPerson.name}</span>
            )}
            <span className="ml-2 text-gray-400">· {bill.participants.length} participants</span>
          </p>
        </div>
        <div className="ml-3 text-gray-400 shrink-0">
          {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </div>
      </button>

      {/* Expanded Form */}
      {isOpen && (
        <div className="border-t border-gray-100 px-5 py-5 space-y-5 animate-fadeIn">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Bill Information</p>

          {/* Bill Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Bill Name</label>
            <input
              type="text"
              value={bill.name}
              onChange={handleNameChange}
              placeholder="e.g. Indomaret I"
              className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gray-50"
            />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {errors.name}
              </p>
            )}
          </div>

          {/* Total Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Total Amount</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-medium">Rp</span>
              <input
                type="text"
                inputMode="numeric"
                value={bill.amount || ''}
                onChange={handleAmountChange}
                placeholder="0"
                className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gray-50"
              />
            </div>
            {errors.amount && (
              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {errors.amount}
              </p>
            )}
          </div>

          {/* Paid By */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Paid By</label>
            <CustomSelect
              options={people}
              value={bill.paidBy}
              onChange={handlePaidByChange}
            />
          </div>

          {/* Participants */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Participants
              {bill.participants.length > 0 && (
                <span className="ml-2 text-xs font-normal text-gray-400">
                  {bill.participants.length} selected · {formatCurrency(sharePerPerson)}/person
                </span>
              )}
            </label>
            <div className="space-y-2">
              {people.map((person) => {
                const checked = bill.participants.includes(person.id);
                return (
                  <label
                    key={person.id}
                    className="flex items-center gap-3 px-4 py-2.5 rounded-xl border border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => handleParticipantToggle(person.id)}
                      className="w-4 h-4 rounded accent-indigo-600"
                    />
                    <span className="text-sm text-gray-700 font-medium flex-1">{person.name}</span>
                    {checked && (
                      <span className="text-xs text-gray-400">{formatCurrency(sharePerPerson)}</span>
                    )}
                  </label>
                );
              })}
            </div>
            {errors.participants && (
              <p className="text-red-500 text-xs mt-2 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {errors.participants}
              </p>
            )}
          </div>

          {/* Delete */}
          <div className="pt-2 border-t border-gray-100">
            <button
              onClick={() => onDelete(bill.id)}
              className="flex items-center gap-2 text-sm font-medium text-red-500 hover:text-red-600 hover:bg-red-50 px-4 py-2 rounded-xl transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Delete Bill
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

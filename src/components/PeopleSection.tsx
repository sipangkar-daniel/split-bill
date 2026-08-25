import { useState } from 'react';
import { UserPlus, X, Users } from 'lucide-react';
import type { Person } from '../types';

interface PeopleSectionProps {
  people: Person[];
  onAddPerson: (name: string) => void;
  onRemovePerson: (id: string) => void;
}

export function PeopleSection({ people, onAddPerson, onRemovePerson }: PeopleSectionProps) {
  const [inputName, setInputName] = useState('');
  const [error, setError] = useState('');
  const [pendingRemoveId, setPendingRemoveId] = useState<string | null>(null);

  function handleAdd() {
    const trimmed = inputName.trim();
    if (!trimmed) {
      setError('Please enter a name.');
      return;
    }
    if (people.some((p) => p.name.toLowerCase() === trimmed.toLowerCase())) {
      setError('This person already exists.');
      return;
    }
    onAddPerson(trimmed);
    setInputName('');
    setError('');
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') handleAdd();
  }

  function handleRemoveClick(id: string) {
    setPendingRemoveId(id);
  }

  function confirmRemove() {
    if (pendingRemoveId) {
      onRemovePerson(pendingRemoveId);
      setPendingRemoveId(null);
    }
  }

  const pendingPerson = people.find((p) => p.id === pendingRemoveId);

  return (
    <div id="tour-people" className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      {/* Card Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-indigo-600" />
          <h2 className="text-lg font-semibold text-gray-900">People</h2>
        </div>
        <span className="text-sm font-medium text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
          {people.length} {people.length === 1 ? 'person' : 'people'}
        </span>
      </div>

      {/* People List */}
      {people.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <Users className="w-10 h-10 mx-auto mb-2 opacity-30" />
          <p className="font-medium text-gray-500">No people yet</p>
          <p className="text-sm mt-1">Add everyone who joined the bill.</p>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2 mb-5">
          {people.map((person) => (
            <div
              key={person.id}
              className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 text-gray-700 text-sm font-medium px-3 py-1.5 rounded-xl animate-fadeIn"
            >
              <span>{person.name}</span>
              <button
                onClick={() => handleRemoveClick(person.id)}
                className="w-4 h-4 rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors ml-1"
                aria-label={`Remove ${person.name}`}
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add Person Form */}
      <div className="flex gap-2">
        <div className="flex-1">
          <input
            type="text"
            value={inputName}
            onChange={(e) => {
              setInputName(e.target.value);
              setError('');
            }}
            onKeyDown={handleKeyDown}
            placeholder="Nama orang"
            className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gray-50 placeholder:text-gray-400"
          />
          {error && <p className="text-red-500 text-xs mt-1.5 ml-1">{error}</p>}
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl transition-all duration-150 active:scale-95 whitespace-nowrap shadow-sm"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add Person</span>
        </button>
      </div>

      {/* Confirmation Modal */}
      {pendingRemoveId && pendingPerson && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full animate-fadeIn">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Remove {pendingPerson.name}?</h3>
            <p className="text-sm text-gray-500 mb-5">
              This person will be removed from all bills. Bills they participated in will be recalculated.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setPendingRemoveId(null)}
                className="flex-1 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmRemove}
                className="flex-1 py-2.5 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-xl transition-colors"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

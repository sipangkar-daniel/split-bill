import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import type { Person } from '../types';

interface CustomSelectProps {
  options: Person[];
  value: string;
  onChange: (value: string) => void;
}

export function CustomSelect({ options, value, onChange }: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const selectedOption = options.find((opt) => opt.id === value);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelect = (id: string) => {
    onChange(id);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={containerRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer text-left"
      >
        <div className="flex items-center gap-2">
          {selectedOption && (
            <div className="w-5 h-5 rounded-md bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs">
              {selectedOption.name.charAt(0).toUpperCase()}
            </div>
          )}
          <span className="text-gray-900 font-medium">
            {selectedOption ? selectedOption.name : 'Select person'}
          </span>
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Floating Menu */}
      {isOpen && (
        <div className="absolute left-0 right-0 mt-1.5 bg-white border border-gray-150 rounded-xl shadow-lg z-50 py-1.5 animate-fadeIn max-h-60 overflow-y-auto">
          {options.map((option) => {
            const isSelected = option.id === value;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => handleSelect(option.id)}
                className={`w-full flex items-center justify-between px-4 py-2 text-sm hover:bg-indigo-50 transition-colors text-left ${
                  isSelected ? 'bg-indigo-50/50 text-indigo-600 font-semibold' : 'text-gray-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className={`w-5 h-5 rounded-md flex items-center justify-center font-bold text-xs ${
                    isSelected ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {option.name.charAt(0).toUpperCase()}
                  </div>
                  <span>{option.name}</span>
                </div>
                {isSelected && <Check className="w-4 h-4 text-indigo-600" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

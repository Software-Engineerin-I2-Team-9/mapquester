import React from 'react';
import { capitalize } from '@/app/utils/fns';

interface FilterMenuProps {
  tags: string[];
  selectedTags: string[];
  onTagChange: (tag: string) => void;
  onReset: () => void;
  isOpen: boolean;
  onClose: () => void;
}

const FilterMenu: React.FC<FilterMenuProps> = ({
  tags,
  selectedTags,
  onTagChange,
  onReset,
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="absolute top-12 left-0 bg-white rounded-lg shadow-lg p-3 z-50 min-w-[240px] animate-fadeIn">
      <div className="max-h-48 overflow-y-auto mb-3 space-y-2">
        {tags.map((tag) => (
          <label
            key={tag}
            className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded-lg cursor-pointer"
          >
            <input
              type="checkbox"
              checked={selectedTags.includes(tag)}
              onChange={() => onTagChange(tag)}
              className="rounded border-gray-300 text-[#C91C1C] focus:ring-[#C91C1C]"
            />
            <span className="text-sm text-gray-700">{capitalize(tag)}</span>
          </label>
        ))}
      </div>
      <div className="space-y-2 pt-2 border-t border-gray-100">
        <button
          onClick={onReset}
          className="w-full bg-[#C91C1C] text-white rounded-lg py-2 text-sm font-medium hover:opacity-90 transition-opacity"
        >
          Reset Filters
        </button>
        <button
          onClick={onClose}
          className="w-full border border-gray-300 text-gray-700 rounded-lg py-2 text-sm font-medium hover:bg-gray-50 transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default FilterMenu;

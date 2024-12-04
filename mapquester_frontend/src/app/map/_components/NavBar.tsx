import React from 'react';
import ToggleSwitch from './ToggleSwitch';
import FilterMenu from './FilterMenu';

interface NavbarProps {
  isMapView: boolean;
  isFilterMenuOpen: boolean;
  onToggleView: () => void;
  onToggleFilterMenu: () => void;
  onResetFilters: () => void;
  selectedTags: string[];
  onTagChange: (tag: string) => void;
  tags: string[];
}

const Navbar: React.FC<NavbarProps> = ({
  isMapView,
  isFilterMenuOpen,
  onToggleView,
  onToggleFilterMenu,
  onResetFilters,
  selectedTags,
  onTagChange,
  tags,
}) => {
  return (
    <div
      className={`${
        isMapView ? 'absolute z-10 w-full' : 'sticky z-10 bg-white shadow-sm'
      } px-4 pt-6 pb-3 flex justify-between items-center`}
    >
      <div className="relative">
        <button
          onClick={onToggleFilterMenu}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
            isFilterMenuOpen ? 'bg-blue-50 text-blue-600' : 'bg-white'
          } border border-gray-300 hover:bg-gray-50 transition-colors duration-200`}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
            />
          </svg>
          <span className="text-sm font-medium">Filter</span>
        </button>
        {/* Filter Menu */}
        <FilterMenu
          tags={tags}
          selectedTags={selectedTags}
          onTagChange={onTagChange}
          onReset={onResetFilters}
          isOpen={isFilterMenuOpen}
          onClose={onToggleFilterMenu}
        />
      </div>
      <div>
        <ToggleSwitch isOn={!isMapView} onToggle={onToggleView} />
      </div>
    </div>
  );
};

export default Navbar;

import React from 'react';

const ToggleSwitch: React.FC<{ isOn: boolean; onToggle: () => void }> = ({ isOn, onToggle }) => {
    return (
      <div
        className={`w-24 h-10 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 bg-[#C91C1C] relative`}
        onClick={onToggle}
      >
        {/* White circle with smooth transition */}
        <div
          className={`bg-white w-8 h-8 rounded-full shadow-md transform transition-all duration-300 ease-in-out absolute ${
            isOn ? 'translate-x-14' : 'translate-x-0'
          }`}
        />
        {/* Text labels with fade transition */}
        <span 
          className={`text-white text-sm font-medium absolute transition-all duration-300 ${
            isOn ? 'left-3 opacity-100' : 'left-3 opacity-0'
          }`}
        >
          List
        </span>
        <span 
          className={`text-white text-sm font-medium absolute transition-all duration-300 ${
            !isOn ? 'right-3 opacity-100' : 'right-3 opacity-0'
          }`}
        >
          Map
        </span>
      </div>
    );
  };

export default ToggleSwitch;

'use client'

import { useState, useEffect } from 'react';
import { Info } from 'lucide-react';

interface GuidePopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const GuidePopup: React.FC<GuidePopupProps> = ({ isOpen, onClose }) => {
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    const hasSeenGuide = localStorage.getItem('hasSeenGuide');
    if (!hasSeenGuide) {
      localStorage.setItem('hasSeenGuide', 'true');
    }
  }, []);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 500);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Popup */}
      <div className={`fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm bg-black/30
        ${isClosing ? 'animate-[fadeOut_0.5s_ease-in-out]' : 'animate-[fadeIn_0.5s_ease-in-out]'}`}>
        <div className={`relative bg-white rounded-lg p-6 mx-4 shadow-xl max-w-[90%] w-[400px] 
          ${isClosing ? 'animate-[slideOut_0.5s_ease-in-out]' : 'animate-[slideIn_0.5s_ease-in-out]'}`}>
          <h2 className="text-2xl font-bold mb-4 text-black pr-8">
            About This Map
            <button 
              onClick={handleClose}
              className="absolute top-6 right-6 text-2xl text-black hover:text-gray-600 transition-colors"
            >
              ✕
            </button>
          </h2>
          <div className="space-y-4">
            <p className="text-black">
              This interactive map showcases key Points of Interest (POIs) in New York City.
              Click on any marker to view more details about the location.
              Click anywhere on the map to add a new point.
            </p>

            <ul className="space-y-2 text-black">
              <li>🔴 Markers indicate POI locations</li>
              <li>👆 Click on a marker to view details</li>
              <li>➕ Click on the map to add a new point</li>
              <li>🏙️ Explore the city's diverse attractions</li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
};

export default GuidePopup;
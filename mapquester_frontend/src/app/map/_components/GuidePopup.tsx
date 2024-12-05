'use client'

import React, { useEffect, useState } from 'react';

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

  if (!isOpen && !isClosing) return null;

  return (
    <div className={`fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm bg-black/30`}>
      <div className={`relative bg-white rounded-lg p-6 mx-4 shadow-xl max-w-[90%] w-[400px] 
        ${isClosing ? 'fade-out-scale' : 'fade-in-scale'}`}>
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
            Let&apos;s explore points of interest (&apos;POIs&apos;) on the map.
          </p>

          <ul className="space-y-2 text-black">
            <li>🔴 Markers indicate POI locations</li>
            <li>👆 Click on a marker to view details</li>
            <li>➕ Click on the map to add a new point</li>
            <li>🏙️ Explore the city&apos;s diverse attractions</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default GuidePopup;
// src/app/map/_components/GuidePopup.tsx
'use client'

import { useState, useEffect } from 'react';
import { Info } from 'lucide-react';

const GuidePopup = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has seen the guide before
    const hasSeenGuide = localStorage.getItem('hasSeenGuide');
    if (!hasSeenGuide) {
      setIsVisible(true);
    }
  }, []);

  const handleClose = () => {
    setIsVisible(false);
  };

  const handleInfoClick = () => {
    setIsVisible(true);
  };

//   if (!isVisible) return null;

  return (
    <>
      
      {/* Popup */}
      {isVisible && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 mx-4 shadow-xl max-w-[90%] w-[400px]">
                <button 
                    onClick={handleClose}
                    className="absolute right-4 top-4 text-2xl"
                >
                    ✕
                </button>
      
                <h2 className="text-2xl font-bold mb-4">About This Map</h2>          
            <div className="space-y-4">
              <p>
                This interactive map showcases key Points of Interest (POIs) in New York City. 
                Click on any marker to view more details about the location. 
                Click anywhere on the map to add a new point.
              </p>
              
              <ul className="space-y-2">
                <li>🔴 Markers indicate POI locations</li>
                <li>👆 Click on a marker to view details</li>
                <li>➕ Click on the map to add a new point</li>
                <li>🏙️ Explore the city's diverse attractions</li>
              </ul>
            </div>
          </div>
        </div>
      )}
      {/* Update info button position */}
      <button
        onClick={handleInfoClick}
        className="absolute bottom-4 right-4 p-2 bg-white rounded-full shadow-lg z-40"
        aria-label="Show map information"
      >
        <Info size={24} />
      </button>
    </>
  );
};

export default GuidePopup;
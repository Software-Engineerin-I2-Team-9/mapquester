import { useState, useCallback, useRef } from 'react';
import Map, { Marker, ViewState, MapRef, MapMouseEvent } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Point } from '@/app/utils/types';
import { capitalize } from '@/app/utils/fns';
import { tagToColorMapping } from '@/app/utils/data';
import GuidePopup from './GuidePopup';
import ConfirmationDialog from '@/components/ConfirmationDialog';
import LogoutButton from '@/app/login/_components/LogoutButton';

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

const initialPoints: Point[] = [
  { name: 'Tandon School of Engineering', longitude: -73.9862, latitude: 40.6942, description: 'NYU\'s engineering and applied sciences campus in Brooklyn.', tag: 'school' },
  { name: 'Brooklyn Bridge', longitude: -73.9969, latitude: 40.7061, description: 'An iconic suspension bridge connecting Manhattan and Brooklyn.', tag: 'photo' },
  { name: 'DUMBO', longitude: -73.9877, latitude: 40.7033, description: 'A trendy neighborhood known for its cobblestone streets and artistic atmosphere.', tag: 'photo' },
  { name: 'Prospect Park', longitude: -73.9701, latitude: 40.6602, description: 'A 526-acre urban oasis featuring diverse landscapes and recreational activities.', tag: 'photo' },
  { name: 'NYU Manhattan Campus', longitude: -73.9965, latitude: 40.7295, description: 'The main campus of New York University, located in Greenwich Village.', tag: 'school' },
];

const MapComponent: React.FC = () => {
  const [points, setPoints] = useState<Point[]>(initialPoints);
  const [selectedPoint, setSelectedPoint] = useState<Point | null>(null);
  const [newPoint, setNewPoint] = useState<Partial<Point> | null>(null);
  const [newlyCreatedPoint, setNewlyCreatedPoint] = useState<Point | null>(null);
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [tempMarker, setTempMarker] = useState<{ longitude: number; latitude: number } | null>(null);
  const [isMapView, setIsMapView] = useState(true);
  const mapRef = useRef<MapRef>(null);
  const ALL_TAGS = ['all', ...Object.keys(tagToColorMapping)];

  const [showConfirmation, setShowConfirmation] = useState(false);
  const [pendingLocation, setPendingLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [showGuide, setShowGuide] = useState(() => {
    const hasSeenGuide = localStorage.getItem('hasSeenGuide');
    if (!hasSeenGuide) {
      localStorage.setItem('hasSeenGuide', 'true');
      return true;
    }
    return false;
  });

  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const filteredPoints = selectedTag === 'all' 
    ? points 
    : points.filter(point => point.tag === selectedTag);

  const uniqueTags = ALL_TAGS;
  
  const [isViewTransitioning, setIsViewTransitioning] = useState(false);

  const [_currViewState, setCurrViewState] = useState<ViewState>({
    longitude: -73.9862,
    latitude: 40.6942,
    zoom: 11,
    pitch: 0,
    bearing: 0,
    padding: {
      top: 0,
      bottom: 0,
      left: 0,
      right: 0
    }
  });

  const [_isUpdating, setIsUpdating] = useState(false);

  const toggleView = () => {
    setIsViewTransitioning(true);
    setTimeout(() => {
      setIsMapView(!isMapView);
      setIsViewTransitioning(false);
    }, 300); // Match this with animation duration
  };
  
  const handleMapClick = useCallback((event: MapMouseEvent) => {
    const { lngLat } = event;
    setPendingLocation({
      latitude: lngLat.lat,
      longitude: lngLat.lng,
    });
    setShowConfirmation(true);
  }, []);

  const handleConfirmNewPoint = () => {
    if (pendingLocation) {
      setNewPoint(pendingLocation);
      setTempMarker(pendingLocation);
      setSelectedPoint(null);
    }
    setShowConfirmation(false);
  };

  const handleCancelNewPoint = () => {
    setPendingLocation(null);
    setShowConfirmation(false);
  };

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (newPoint && newPoint.name && newPoint.description) {
      const createdPoint: Point = {
        name: newPoint.name,
        latitude: newPoint.latitude!,
        longitude: newPoint.longitude!,
        description: newPoint.description,
        tag: newPoint.tag!,
      };
      setPoints([...points, createdPoint]);
      setNewPoint(null);
      setTempMarker(null);
      setSelectedPoint(createdPoint);
      setNewlyCreatedPoint(createdPoint);
      setSelectedTag('all');

      mapRef.current?.flyTo({
        center: [createdPoint.longitude, createdPoint.latitude],
        zoom: 14,
        duration: 2000
      });

      setTimeout(() => setNewlyCreatedPoint(null), 3000);
    }
  };

  const cancelPointCreation = () => {
    setNewPoint(null);
    setTempMarker(null);
  };

  const deletePoint = useCallback((pointToDelete: Point) => {
    setPoints(prevPoints => prevPoints.filter(point => point !== pointToDelete));
    if (selectedPoint === pointToDelete) {
      setSelectedPoint(null);
      setSelectedTag('all');
    }
  }, [selectedPoint]);

  const handleFormChange = (field: keyof Point, value: string) => {
    setNewPoint(prev => ({ ...prev, [field]: value }));
  };

  const _handleUpdateSubmit = (updatedPoint: Point) => {
    setPoints(points.map(p => 
      p === selectedPoint ? updatedPoint : p
    ));
    setSelectedPoint(null);
    setIsUpdating(false);
  };

  const _handleUpdateChange = (field: keyof Point, value: string) => {
    if (selectedPoint) {
      setSelectedPoint({ ...selectedPoint, [field]: value });
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col">
      {/* Controls overlay - only show in map view */}
      {isMapView && (
        <div className="absolute top-4 z-10 w-full px-4 flex justify-between items-center">
          <div className="relative">
            {/* Filter button and menu */}
            <button 
              onClick={() => setIsFilterMenuOpen(prev => !prev)}
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
            {/* Filter menu dropdown */}
            {isFilterMenuOpen && (
              <div className="absolute top-12 left-0 bg-white rounded-lg shadow-lg p-3 z-50 min-w-[240px] animate-fadeIn">
                <div className="max-h-48 overflow-y-auto mb-3 space-y-2">
                  {uniqueTags.filter(tag => tag !== 'all').map(tag => (
                    <label key={tag} className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedTags.includes(tag)}
                        onChange={() => {
                          setSelectedTags(prev => 
                            prev.includes(tag) 
                              ? prev.filter(t => t !== tag)
                              : [...prev, tag]
                          );
                        }}
                        className="rounded border-gray-300 text-[#C91C1C] focus:ring-[#C91C1C]"
                      />
                      <span className="text-sm text-gray-700">{capitalize(tag)}</span>
                    </label>
                  ))}
                </div>
                
                <div className="space-y-2 pt-2 border-t border-gray-100">
                  <button
                    onClick={() => {
                      const filteredPoints = selectedTags.length === 0 
                        ? initialPoints 
                        : initialPoints.filter(point => selectedTags.includes(point.tag));
                      setPoints(filteredPoints);
                      setIsFilterMenuOpen(false);
                    }}
                    className="w-full bg-[#C91C1C] text-white rounded-lg py-2 text-sm font-medium hover:opacity-90 transition-opacity"
                  >
                    Apply Filters
                  </button>
                  <button
                    onClick={() => {
                      setSelectedTags([]);
                      setPoints(initialPoints);
                      setIsFilterMenuOpen(false);
                    }}
                    className="w-full border border-gray-300 text-gray-700 rounded-lg py-2 text-sm font-medium hover:bg-gray-50 transition-colors"
                  >
                    Reset Filters
                  </button>
                </div>
              </div>
            )}
          </div>
          <div>
            <ToggleSwitch isOn={!isMapView} onToggle={toggleView} />
          </div>
          <LogoutButton />
        </div>
      )}

      {/* View container with transitions */}
      <div className="flex-1 relative">
        {isMapView ? (
          <div className={`absolute inset-0 ${isViewTransitioning ? 'view-transition-exit' : 'view-transition-enter'}`}>
            {/* Map View Content */}
            <Map
              ref={mapRef}
              mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}
              initialViewState={{
                longitude: -73.9862,
                latitude: 40.6942,
                zoom: 11
              }}
              onMove={e => setCurrViewState(e.viewState)}
              onClick={handleMapClick}
              style={{width: '100%', height: '100%'}}
              mapStyle="mapbox://styles/mapbox/light-v10"
            >
              {filteredPoints.map((point, index) => (   
                <Marker
                  key={index}
                  longitude={point.longitude}
                  latitude={point.latitude}
                  anchor="bottom"
                >
                  <div 
                    className="cursor-pointer"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setSelectedPoint(point);
                      setNewPoint(null);
                    }}
                  >
                    <div className="flex flex-col items-center">
                      <div className="text-xs font-bold text-eggshell bg-black bg-opacity-50 px-1 rounded mb-1">
                        {point.name}
                      </div>
                      <div 
                        style={{backgroundColor: `${newlyCreatedPoint === point ? null : tagToColorMapping[point.tag]}`}} 
                        className={`w-3 h-3 rounded-full ${newlyCreatedPoint === point ? 'bg-green-500 animate-pulse' : ''}`}
                      />
                    </div>
                  </div>
                </Marker>       
              ))}
              {tempMarker && (
                <Marker
                  longitude={tempMarker.longitude}
                  latitude={tempMarker.latitude}
                  anchor="bottom"
                >
                  <div className="w-3 h-3 rounded-full bg-gray-900 opacity-50" />
                </Marker>
              )}
            </Map>

            {/* Info Button - only shown in map view */}
            <button
              onClick={() => setShowGuide(true)}
              className="absolute bottom-[6px] right-[10px] z-[99] bg-[#C91C1C] text-white w-[32px] h-[32px] rounded-full flex items-center justify-center hover:opacity-90 transition-opacity"
              style={{
                fontFamily: 'Arial, sans-serif',
                fontSize: '15px',
                fontWeight: 'bold'
              }}
            >
              i
            </button>
          </div>
        ) : (
          <div className={`absolute inset-0 ${isViewTransitioning ? 'view-transition-exit' : 'view-transition-enter'}`}>
            {/* List View Content */}
            <div className="h-full bg-gray-50">
              {/* List view header */}
              <div className="sticky top-0 w-full px-4 py-3 flex justify-between items-center bg-white shadow-sm z-10">
                <div className="relative">
                  {/* Same filter button and menu code as above */}
                  <button 
                    onClick={() => setIsFilterMenuOpen(prev => !prev)}
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
                  {isFilterMenuOpen && (
                    <div className="absolute top-12 left-0 bg-white rounded-lg shadow-lg p-3 z-50 min-w-[240px] animate-fadeIn">
                      <div className="max-h-48 overflow-y-auto mb-3 space-y-2">
                        {uniqueTags.filter(tag => tag !== 'all').map(tag => (
                          <label key={tag} className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                            <input
                              type="checkbox"
                              checked={selectedTags.includes(tag)}
                              onChange={() => {
                                setSelectedTags(prev => 
                                  prev.includes(tag) 
                                    ? prev.filter(t => t !== tag)
                                    : [...prev, tag]
                                );
                              }}
                              className="rounded border-gray-300 text-[#C91C1C] focus:ring-[#C91C1C]"
                            />
                            <span className="text-sm text-gray-700">{capitalize(tag)}</span>
                          </label>
                        ))}
                      </div>
                      
                      <div className="space-y-2 pt-2 border-t border-gray-100">
                        <button
                          onClick={() => {
                            const filteredPoints = selectedTags.length === 0 
                              ? initialPoints 
                              : initialPoints.filter(point => selectedTags.includes(point.tag));
                            setPoints(filteredPoints);
                            setIsFilterMenuOpen(false);
                          }}
                          className="w-full bg-[#C91C1C] text-white rounded-lg py-2 text-sm font-medium hover:opacity-90 transition-opacity"
                        >
                          Apply Filters
                        </button>
                        <button
                          onClick={() => {
                            setSelectedTags([]);
                            setPoints(initialPoints);
                            setIsFilterMenuOpen(false);
                          }}
                          className="w-full border border-gray-300 text-gray-700 rounded-lg py-2 text-sm font-medium hover:bg-gray-50 transition-colors"
                        >
                          Reset Filters
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                <ToggleSwitch isOn={!isMapView} onToggle={toggleView} />
                <LogoutButton />
              </div>
              {/* List content */}
              <div className="flex-1 overflow-y-auto">
                <div className="space-y-2 p-4">
                  {filteredPoints.map((point, index) => (
                    <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                      <div className="p-3 flex justify-between items-center">
                        <div className="flex items-center space-x-2">
                          <h3 className="text-base font-medium text-gray-800">
                            {point.name}
                          </h3>
                          <span 
                            className="inline-block w-2 h-2 rounded-full"
                            style={{ backgroundColor: tagToColorMapping[point.tag] }}
                          />
                        </div>
                        <button
                          onClick={() => setSelectedPoint(point)}
                          className="bg-[#C91C1C] hover:opacity-90 transition-opacity text-white text-sm font-medium px-4 py-1.5 rounded"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Navigation */}
      <div className="h-[60px] bg-white border-t border-gray-200 flex justify-around items-center px-4 w-full mt-auto">
        <button className="flex flex-col items-center text-[#C91C1C]">
          <span className="text-sm">Explore</span>
        </button>
        <button className="flex flex-col items-center text-gray-400">
          <span className="text-sm">Saved POI</span>
        </button>
        <button className="flex flex-col items-center text-gray-400">
          <span className="text-sm">Button 3</span>
        </button>
      </div>

      {/* Modals and popups */}
      <GuidePopup isOpen={showGuide} onClose={() => setShowGuide(false)} />
      <ConfirmationDialog 
        isOpen={showConfirmation}
        onConfirm={handleConfirmNewPoint}
        onCancel={handleCancelNewPoint}
      />

      {(newPoint || selectedPoint) && (
        <div className="absolute inset-x-0 bottom-[60px] z-50">
          <div 
            className="w-full bg-white/95 backdrop-blur-sm p-4 rounded-t-lg shadow-lg relative animate-slideUp"
            style={{
              animation: 'slideUp 0.3s ease-out forwards',
            }}
          >
            {newPoint ? (
              <form onSubmit={handleFormSubmit}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <input
                      type="text"
                      placeholder="Enter name"
                      value={newPoint.name || ''}
                      onChange={(e) => handleFormChange('name', e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#C91C1C] focus:border-[#C91C1C] sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Tag</label>
                    <select
                      value={newPoint.tag || ''}
                      onChange={(e) => handleFormChange('tag', e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#C91C1C] focus:border-[#C91C1C] sm:text-sm"
                    >
                      <option value="" disabled>Select your option</option>
                      {uniqueTags.map(tag => (
                        <option key={tag} value={tag}>
                          {capitalize(tag)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea
                      placeholder="Enter description"
                      value={newPoint.description || ''}
                      onChange={(e) => handleFormChange('description', e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#C91C1C] focus:border-[#C91C1C] sm:text-sm"
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Attach Image</label>
                    <input
                      type="file"
                      className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#C91C1C] file:text-white hover:file:bg-red-600"
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <button
                      type="submit"
                      className="bg-[#C91C1C] hover:bg-red-600 text-white font-bold py-2 px-4 rounded-full"
                    >
                      Create Point
                    </button>
                    <button
                      type="button"
                      onClick={cancelPointCreation}
                      className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-full"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </form>
            ) : selectedPoint ? (
              <>
                <button
                  onClick={() => setSelectedPoint(null)}
                  className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                >
                  &times;
                </button>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">{selectedPoint.name}</h3>
                <p className="text-gray-800 mb-4">{selectedPoint.description}</p>
                <p className="text-gray-800 mb-4">Tag: {capitalize(selectedPoint.tag)}</p>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => setIsUpdating(true)}
                    className="bg-[#C91C1C] hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
                  >
                    Update
                  </button>
                  <button 
                    onClick={() => deletePoint(selectedPoint)}
                    className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
                  >
                    Delete
                  </button>
                </div>
              </>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};

export default MapComponent;
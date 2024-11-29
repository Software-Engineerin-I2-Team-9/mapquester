import { useState, useCallback, useRef } from 'react';
import Map, { Marker, ViewState, MapRef, MapMouseEvent } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import POIForm from './POIForm';
import UpdatePOIForm from './UpdatePOIForm';
import { Point } from '@/app/utils/types'
import { capitalize } from '@/app/utils/fns';
import { tagToColorMapping } from '@/app/utils/data';
import GuidePopup from './GuidePopup';
import ConfirmationDialog from '@/components/ConfirmationDialog';

const ToggleSwitch: React.FC<{ isOn: boolean; onToggle: () => void }> = ({ isOn, onToggle }) => {
  return (
    <div className="flex items-center">
      <span className="mr-2 text-gray-800">List View</span>
      <div
        className={`w-14 h-7 flex items-center rounded-full p-1 cursor-pointer ${
          isOn ? 'bg-blue-500' : 'bg-gray-700'
        }`}
        onClick={onToggle}
      >
        <div
          className={`bg-white w-5 h-5 rounded-full shadow-md transform duration-300 ease-in-out ${
            isOn ? 'translate-x-7' : ''
          }`}
        />
      </div>
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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [currViewState, setCurrViewState] = useState<ViewState | null>(null); 
  const [newlyCreatedPoint, setNewlyCreatedPoint] = useState<Point | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [tempMarker, setTempMarker] = useState<{ longitude: number; latitude: number } | null>(null);
  const [isMapView, setIsMapView] = useState(true);
  const mapRef = useRef<MapRef>(null);
  const ALL_TAGS = ['all', ...Object.keys(tagToColorMapping)];

  const [showConfirmation, setShowConfirmation] = useState(false);
  const [pendingLocation, setPendingLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  const filteredPoints = selectedTag === 'all' 
    ? points 
    : points.filter(point => point.tag === selectedTag);

    const uniqueTags = ALL_TAGS;
  
  const toggleView = () => {
    setIsMapView(!isMapView);
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

      // Center the map on the new point
      mapRef.current?.flyTo({
        center: [createdPoint.longitude, createdPoint.latitude],
        zoom: 14,
        duration: 2000
      });

      // Clear the newly created point highlight after 3 seconds
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

  const handleUpdateSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (selectedPoint) {
      const updatedPoints = points.map(point => 
        point.longitude === selectedPoint.longitude && point.latitude === selectedPoint.latitude
          ? { ...selectedPoint }
          : point
      );
      setPoints(updatedPoints);
      setIsUpdating(false);
      setSelectedTag('all');
    }
  };

  const handleUpdateChange = (field: keyof Point, value: string) => {
    if (selectedPoint) {
      const updatedPoint = { ...selectedPoint, [field]: value };
      setSelectedPoint(updatedPoint);
    }
  };

  const handleFormChange = (field: keyof Point, value: string) => {
    setNewPoint(prev => ({ ...prev, [field]: value }));
  };

  const renderListView = () => (
    <div className="w-full h-[400px] overflow-y-auto rounded-lg shadow-lg">
      {filteredPoints.map((point, index) => (
        <div key={index} className="p-4 mb-4 bg-eggshell rounded-lg">
          <h3 className="text-xl font-semibold text-gray-800 mb-2 flex items-center">
          {point.name}
          <span 
            className="ml-2 inline-block w-3 h-3 rounded-full"
            style={{ backgroundColor: tagToColorMapping[point.tag] }}
          ></span>
        </h3>
          <p className="text-gray-800 mb-2">{point.description}</p>
          <p className="text-gray-800">Tag: {capitalize(point.tag)}</p>
          <button
            onClick={() => setSelectedPoint(point)}
            className="mt-2 bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-2 rounded"
          >
            View Details
          </button>
        </div>
      ))}
    </div>
  );

  return (
    <div className="flex flex-col h-full">
    {/* Title and Filter Section */}
    <div className="px-4 py-2">
      <h2 className="text-2xl font-bold text-gray-800">Explore POIs</h2>
      <p className="text-gray-600 mb-4">Discover Points of Interest around New York City</p>
      <div className="flex justify-between items-center mb-2">
        <div>
          <label htmlFor="tag-filter" className="text-gray-800 mr-2">Filter by Tag:</label>
          <select
            id="tag-filter"
            value={selectedTag}
            onChange={(e) => setSelectedTag(e.target.value)}
            className="bg-eggshell text-gray-800 rounded px-2 py-1"
          >
            {uniqueTags.map((tag) => (
              <option key={tag} value={tag}>
                {tag.charAt(0).toUpperCase() + tag.slice(1)}
              </option>
            ))}
          </select>
        </div>
        <ToggleSwitch isOn={!isMapView} onToggle={toggleView} />
      </div>
    </div>

    {/* Map View */}
    <div className="flex-1 relative">
      {isMapView ? (
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
          mapStyle="mapbox://styles/sentient-ramen/cm2lfmqpq00au01p707n1dyky"
        >
            {filteredPoints.map((point, index) => {
              return (   
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
                    <div style={{backgroundColor:`${newlyCreatedPoint === point ? null :tagToColorMapping[point.tag]}`}} className={`w-3 h-3 rounded-full ${newlyCreatedPoint === point ? 'bg-green-500 animate-pulse' : null}`}></div>
                  </div>
                </div>
              
              </Marker>       
            )})}
            {tempMarker && (
              <Marker
                longitude={tempMarker.longitude}
                latitude={tempMarker.latitude}
                anchor="bottom"
              >
                <div className="w-3 h-3 rounded-full bg-gray-900 opacity-50"></div>
              </Marker>
            )}
          </Map>
          ) : ( renderListView())}
          <GuidePopup />
          <ConfirmationDialog 
          isOpen={showConfirmation}
          onConfirm={handleConfirmNewPoint}
          onCancel={handleCancelNewPoint}
        />

        {(newPoint || selectedPoint) && (
          <div className="absolute inset-x-0 bottom-0 z-50">
            <div className="w-full bg-white/95 backdrop-blur-sm p-4 rounded-t-lg shadow-lg">
              {/* Add Close Button */}
              <button 
                onClick={() => {
                  setNewPoint(null);
                  setSelectedPoint(null);
                  setTempMarker(null);
                }}
                className="absolute top-3 left-3 p-2 text-gray-600 hover:text-gray-800"
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="24" 
                  height="24" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>

              {/* Form/Details Content */}
              {newPoint ? (
                <POIForm
                  newPoint={newPoint}
                  onSubmit={handleFormSubmit}
                  onChange={handleFormChange}
                  onCancel={cancelPointCreation}
                />
              ) : selectedPoint ? (
                isUpdating ? (
                  <UpdatePOIForm
                    point={selectedPoint}
                    onSubmit={handleUpdateSubmit}
                    onChange={handleUpdateChange}
                    onCancel={() => setIsUpdating(false)}
                  />
                ) : (
                  <>
                    <h3 className="text-xl font-semibold text-gray-800 mb-3 pl-8">{selectedPoint.name}</h3>
                    <p className="text-gray-800 mb-4">{selectedPoint.description}</p>
                    <p className="text-gray-800 mb-4">Tag: {capitalize(selectedPoint.tag)}</p>
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => setIsUpdating(true)}
                        className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
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
                )
              ) : null}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MapComponent;
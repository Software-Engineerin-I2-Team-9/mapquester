import { useState, useCallback, useRef } from 'react';
import Map, { Marker, ViewState, MapRef, MapMouseEvent } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import POIForm from './POIForm';
import UpdatePOIForm from './UpdatePOIForm';
import { Point } from '@/app/utils/types'
import { capitalize } from '@/app/utils/fns';
import { tagToColorMapping } from '@/app/utils/data';

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
  const [currViewState, setCurrViewState] = useState<ViewState | null>(null);
  const [newlyCreatedPoint, setNewlyCreatedPoint] = useState<Point | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [tempMarker, setTempMarker] = useState<{ longitude: number; latitude: number } | null>(null);
  const mapRef = useRef<MapRef>(null);

  const filteredPoints = selectedTag === 'all' 
    ? points 
    : points.filter(point => point.tag === selectedTag);

  const uniqueTags = ['all', ...Array.from(new Set(points.map(point => point.tag)))];

  const handleMapClick = useCallback((event: MapMouseEvent) => {
    const { lngLat } = event;
    setNewPoint({
      latitude: lngLat.lat,
      longitude: lngLat.lng,
    });
    setTempMarker({
      latitude: lngLat.lat,
      longitude: lngLat.lng,
    });
    setSelectedPoint(null);
  }, []);

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

  return (
    <div className="w-full max-w-6xl bg-gray-900 p-6 rounded-lg">
      <h2 className="text-2xl font-bold text-gray-100 mb-4">Explore POIs</h2>
      <p className="text-gray-300 mb-6">Discover Points of Interest around New York City</p>
      <div className="mb-4">
        <label htmlFor="tag-filter" className="text-gray-300 mr-2">Filter by Tag:</label>
        <select
          id="tag-filter"
          value={selectedTag}
          onChange={(e) => setSelectedTag(e.target.value)}
          className="bg-gray-700 text-white rounded px-2 py-1"
        >
          {uniqueTags.map((tag) => (
            <option key={tag} value={tag}>
              {tag.charAt(0).toUpperCase() + tag.slice(1)}
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-1/2 h-[400px] rounded-lg overflow-hidden shadow-lg">
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
            mapStyle="mapbox://styles/mapbox/dark-v10"
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
                    <div className="text-xs font-bold text-white bg-black bg-opacity-50 px-1 rounded mb-1">
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
                <div className="w-3 h-3 rounded-full bg-white opacity-50"></div>
              </Marker>
            )}
          </Map>
        </div>
        <div className="w-full md:w-1/2 bg-gray-800 p-4 rounded-lg shadow-lg">
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
                <h3 className="text-xl font-semibold text-gray-100 mb-3">{selectedPoint.name}</h3>
                <p className="text-gray-300 mb-4">{selectedPoint.description}</p>
                <p className="text-gray-300 mb-4">Tag: {capitalize(selectedPoint.tag)}</p>
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
          ) : (
            <>
              <h3 className="text-xl font-semibold text-gray-100 mb-3">About This Map</h3>
              <p className="text-gray-300">
                This interactive map showcases key Points of Interest (POIs) in New York City. Click on any marker to view more details about the location. Click anywhere on the map to add a new point.
              </p>
              <ul className="mt-4 text-gray-300">
                <li>🔴 Markers indicate POI locations</li>
                <li>🖱️ Click on a marker to view details</li>
                <li>➕ Click on the map to add a new point</li>
                <li>🏙️ Explore the city's diverse attractions</li>
              </ul>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MapComponent;

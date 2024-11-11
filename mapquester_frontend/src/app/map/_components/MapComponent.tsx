import { useState, useCallback, useRef } from 'react';
import Map, { Marker, ViewState, MapRef, MapMouseEvent } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import POIForm from './POIForm';

interface Point {
  name: string;
  longitude: number;
  latitude: number;
  description: string;
}

const initialPoints: Point[] = [
  { 
    name: "Tandon School of Engineering",
    longitude: -73.9862,
    latitude: 40.6942,
    description: "NYU&apos;s engineering and applied sciences campus in Brooklyn."
  },
  {
    name: "Brooklyn Bridge",
    longitude: -73.9969,
    latitude: 40.7061,
    description: "An iconic suspension bridge connecting Manhattan and Brooklyn."
  },
  {
    name: "DUMBO",
    longitude: -73.9877,
    latitude: 40.7033,
    description: "A trendy neighborhood known for its cobblestone streets and artistic atmosphere."
  },
  {
    name: "Prospect Park",
    longitude: -73.9701,
    latitude: 40.6602,
    description: "A 526-acre urban oasis featuring diverse landscapes and recreational activities."
  },
  {
    name: "NYU Manhattan Campus",
    longitude: -73.9965,
    latitude: 40.7295,
    description: "The main campus of New York University, located in Greenwich Village."
  }
];

const MapComponent: React.FC = () => {
  const [points, setPoints] = useState<Point[]>(initialPoints);
  const [selectedPoint, setSelectedPoint] = useState<Point | null>(null);
  const [newPoint, setNewPoint] = useState<Partial<Point> | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [currViewState, setCurrViewState] = useState<ViewState | null>(null); 
  const [newlyCreatedPoint, setNewlyCreatedPoint] = useState<Point | null>(null);
  const mapRef = useRef<MapRef>(null);

  const handleMapClick = useCallback((event: MapMouseEvent) => {
    const { lngLat } = event;
    setNewPoint({
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
      };
      setPoints([...points, createdPoint]);
      setNewPoint(null);
      setSelectedPoint(createdPoint);
      setNewlyCreatedPoint(createdPoint);

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

  const handleFormChange = (field: keyof Point, value: string) => {
    setNewPoint(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="w-full max-w-6xl bg-gray-900 p-6 rounded-lg">
      <h2 className="text-2xl font-bold text-gray-100 mb-4">Explore POIs</h2>
      <p className="text-gray-300 mb-6">Discover Points of Interest around New York City</p>
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
            {points.map((point, index) => (
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
                    <div className={`w-3 h-3 rounded-full ${newlyCreatedPoint === point ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                  </div>
                </div>
              </Marker>
            ))}
          </Map>
        </div>
        <div className="w-full md:w-1/2 bg-gray-800 p-4 rounded-lg shadow-lg">
          {newPoint ? (

            <POIForm
              newPoint={newPoint}
              onSubmit={handleFormSubmit}
              onChange={handleFormChange}
            />
          ) : selectedPoint ? (
            <>
              <h3 className="text-xl font-semibold text-gray-100 mb-3">{selectedPoint.name}</h3>
              <p className="text-gray-300">{selectedPoint.description}</p>
            </>
          ) : (
            <>
              <h3 className="text-xl font-semibold text-gray-100 mb-3">About This Map</h3>
              <p className="text-gray-300">
                This interactive map showcases key Points of Interest (POIs) in New York City. Click on any marker to view more details about the location. Click anywhere on the map to add a new point.
              </p>
              <ul className="mt-4 text-gray-300">
                <li>🔴 Red markers indicate POI locations</li>
                <li>🖱️ Click on a marker to view details</li>
                <li>➕ Click on the map to add a new point</li>
                <li>🏙️ Explore the city&apos;s diverse attractions</li>
              </ul>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MapComponent;

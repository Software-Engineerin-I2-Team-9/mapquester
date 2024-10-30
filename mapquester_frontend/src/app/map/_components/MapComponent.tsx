import { useState } from 'react';
import Map, { Marker } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

interface Point {
  name: string;
  longitude: number;
  latitude: number;
  description: string;
}

const points: Point[] = [
  { name: 'Tandon School of Engineering', longitude: -73.9862, latitude: 40.6942, description: 'NYU\'s engineering and applied sciences campus in Brooklyn.' },
  { name: 'Brooklyn Bridge', longitude: -73.9969, latitude: 40.7061, description: 'An iconic suspension bridge connecting Manhattan and Brooklyn.' },
  { name: 'DUMBO', longitude: -73.9877, latitude: 40.7033, description: 'A trendy neighborhood known for its cobblestone streets and artistic atmosphere.' },
  { name: 'Prospect Park', longitude: -73.9701, latitude: 40.6602, description: 'A 526-acre urban oasis featuring diverse landscapes and recreational activities.' },
  { name: 'NYU Manhattan Campus', longitude: -73.9965, latitude: 40.7295, description: 'The main campus of New York University, located in Greenwich Village.' },
];

const MapComponent: React.FC = () => {
  const [selectedPoint, setSelectedPoint] = useState<Point | null>(null);

  return (
    <div className="w-full max-w-6xl bg-gray-900 p-6 rounded-lg">
      <h2 className="text-2xl font-bold text-gray-100 mb-4">Explore POIs</h2>
      <p className="text-gray-300 mb-6">Discover Points of Interest around New York City</p>
      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-1/2 h-[400px] rounded-lg overflow-hidden shadow-lg">
          <Map
            mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}
            initialViewState={{
              longitude: -73.9862,
              latitude: 40.6942,
              zoom: 11
            }}
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
                  }}
                >
                  <div className="flex flex-col items-center">
                    <div className="text-xs font-bold text-white bg-black bg-opacity-50 px-1 rounded mb-1">
                      {point.name}
                    </div>
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  </div>
                </div>
              </Marker>
            ))}
          </Map>
        </div>
        <div className="w-full md:w-1/2 bg-gray-800 p-4 rounded-lg shadow-lg">
          <h3 className="text-xl font-semibold text-gray-100 mb-3">
            {selectedPoint ? selectedPoint.name : "About This Map"}
          </h3>
          <p className="text-gray-300">
            {selectedPoint ? selectedPoint.description : "This interactive map showcases key Points of Interest (POIs) in New York City. Click on any marker to view more details about the location. The map includes landmarks such as the Brooklyn Bridge, NYU campuses, and popular neighborhoods."}
          </p>
          <ul className="mt-4 text-gray-300">
            <li>🔴 Red markers indicate POI locations</li>
            <li>🖱️ Click on a marker to view details</li>
            <li>🏙️ Explore the city's diverse attractions</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default MapComponent;

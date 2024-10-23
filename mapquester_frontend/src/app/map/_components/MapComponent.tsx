import { useState } from 'react';
import Map, { Marker, Popup } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

interface Point {
  name: string;
  longitude: number;
  latitude: number;
}

const points: Point[] = [
  { name: 'Tandon School of Engineering', longitude: -73.9862, latitude: 40.6942 },
  { name: 'Brooklyn Bridge', longitude: -73.9969, latitude: 40.7061 },
  { name: 'DUMBO', longitude: -73.9877, latitude: 40.7033 },
  { name: 'Prospect Park', longitude: -73.9701, latitude: 40.6602 },
  { name: 'NYU Manhattan Campus', longitude: -73.9965, latitude: 40.7295 },
];

const MapComponent: React.FC = () => {
  const [popupInfo, setPopupInfo] = useState<Point | null>(null);

  return (
    <div className="w-full max-w-md bg-gray-900 p-6 rounded-lg">
      <h2 className="text-2xl font-bold text-gray-100 mb-4">Explore POIs</h2>
      <p className="text-gray-300 mb-6">Discover Points of Interest around New York City</p>
      <div className="w-full h-[400px] rounded-lg overflow-hidden shadow-lg">
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
              color="red"
              onClick={() => {
                setPopupInfo(point);
              }}
            />
          ))}

          {popupInfo && (
            <Popup
              anchor="top"
              longitude={popupInfo.longitude}
              latitude={popupInfo.latitude}
              onClose={() => setPopupInfo(null)}
            >
              <div>{popupInfo.name}</div>
            </Popup>
          )}
        </Map>
      </div>
    </div>
  );
};

export default MapComponent;

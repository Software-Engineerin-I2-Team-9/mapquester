import { useState, useCallback, useRef, useEffect } from 'react';
import Map, { Marker, ViewState, MapRef, MapMouseEvent } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import POIForm from './POIForm';
import UpdatePOIForm from './UpdatePOIForm';
import { Point } from '@/app/utils/types'
import { capitalize } from '@/app/utils/fns';
import { tagToColorMapping } from '@/app/utils/data';
import apiClient from '@/app/api/axios';
import { useRecoilState } from 'recoil';
import { authState } from '../../atoms/authState';

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

const MapComponent: React.FC = () => {
  const [points, setPoints] = useState<Point[]>([]);
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
  const [auth, setAuth] = useRecoilState(authState);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    const fetchPoints = async () => {
      if (auth?.id) {
        try {
          const endpoint = `/api/v1/pois/get/${auth?.id}`;
          const response = await apiClient.get(endpoint, {
            params: {
              viewType: isMapView ? 'map' : 'list',
              tags: selectedTag === 'all' ? [] : [selectedTag],
              page: currentPage,
              page_size: 10 // Adjust as needed
            }
          });
          if (currentPage === 1) {
            setPoints(response.data.pois);
          } else {
            setPoints(prevPoints => [...prevPoints, ...response.data.pois]);
          }
          setHasMore(currentPage < response.data.pagination.total_pages);
        } catch (error) {
          console.error('Error fetching points:', error);
        }
      }
    };
    fetchPoints();
  }, [auth?.id, selectedTag, isMapView, currentPage]);

  /*const filteredPoints = selectedTag === 'all' 
    ? points 
    : points.filter(point => point.tag === selectedTag);*/

  const uniqueTags = ['all', ...Array.from(new Set(points.map(point => point.tag)))];
  
  const loadMorePOIs = () => {
    if (hasMore) {
      setCurrentPage(prevPage => prevPage + 1);
    }
  };

  const toggleView = () => {
    setIsMapView(!isMapView);
  };

  const handleTagChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedTag(e.target.value);
  };

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

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (newPoint && newPoint.name && newPoint.description) {
      try {
        const formData = new FormData();
        console.log(auth?.id)
        formData.append('userId', auth?.id);
        formData.append('latitude', newPoint.latitude!.toString());
        formData.append('longitude', newPoint.longitude!.toString());
        // formData.append('isPublic', '1');
        formData.append('title', newPoint.name);
        formData.append('tag', newPoint.tag!);
        formData.append('description', newPoint.description);
  
        // Handle file uploads if any
        /*
        if (newPoint.content && newPoint.content.length > 0) {
          newPoint.content.forEach((file, index) => {
            formData.append(`content[${index}][filename]`, file.name);
            formData.append(`content[${index}][data]`, file);
          });
        }
        */
        const endpoint = '/api/v1/pois/create/'
        const response = await apiClient.post(endpoint, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
  
        if (response.status === 201) {
          const createdPoint: Point = {
            id: response.data.poi_id,
            name: newPoint.name,
            latitude: newPoint.latitude!,
            longitude: newPoint.longitude!,
            description: newPoint.description,
            tag: newPoint.tag!,
            // content: response.data.content_urls,
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
  
          setTimeout(() => setNewlyCreatedPoint(null), 3000);
        }
      } catch (error) {
        console.error('Error creating POI:', error);
      }
    }
  };

  const cancelPointCreation = () => {
    setNewPoint(null);
    setTempMarker(null);
  };

  const deletePoint = useCallback(async (pointToDelete: Point) => {
    try {
      const endpoint = `/api/v1/pois/delete/${pointToDelete.id}/`;
      const response = await apiClient.patch(endpoint);
  
      if (response.status === 200) {
        setPoints(prevPoints => prevPoints.filter(point => point.id !== pointToDelete.id));
        if (selectedPoint && selectedPoint.id === pointToDelete.id) {
          setSelectedPoint(null);
          setSelectedTag('all');
        }
      }
    } catch (error) {
      console.error('Error deleting POI:', error);
    }
  }, [selectedPoint]);

  const handleUpdateSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (selectedPoint) {
      try {
        const endpoint = `/api/v1/pois/update/${selectedPoint.id}/`;
        const updateData = {
          title: selectedPoint.name,
          description: selectedPoint.description,
          tag: selectedPoint.tag,
          latitude: selectedPoint.latitude,
          longitude: selectedPoint.longitude
        };
  
        const response = await apiClient.patch(endpoint, updateData);
  
        if (response.status === 200) {
          const updatedPoints = points.map(point => 
            point.id === selectedPoint.id ? { ...point, ...response.data } : point
          );
          setPoints(updatedPoints);
          setSelectedPoint({ ...selectedPoint, ...response.data });
          setIsUpdating(false);
          setSelectedTag('all');
        }
      } catch (error) {
        console.error('Error updating POI:', error);
      }
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
    <div 
      className="w-full h-[400px] overflow-y-auto rounded-lg shadow-lg"
      onScroll={(e) => {
        const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
        if (scrollHeight - scrollTop <= clientHeight * 1.5) {
          loadMorePOIs();
        }
      }}
    >
      {points.map((point, index) => (
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
      {hasMore && (
        <div className="text-center py-4">
          <span className="text-gray-600">Loading more POIs...</span>
        </div>
      )}
    </div>
  );

  return (
    <div className="w-full max-w-6xl p-6 rounded-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Explore POIs</h2>
      <p className="text-gray-800 mb-6">Discover Points of Interest around New York City</p>
      <div className="mb-4 flex justify-between items-center">
        <div>
          <label htmlFor="tag-filter" className="text-gray-800 mr-2">Filter by Tag:</label>
          <select
            id="tag-filter"
            value={selectedTag}
            onChange={handleTagChange}
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
      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-1/2 h-[400px] rounded-lg overflow-hidden shadow-lg">
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
            {points.map((point, index) => {
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
          
        </div>
        <div className="w-full md:w-1/2 bg-eggshell p-4 rounded-lg shadow-lg">
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
                <h3 className="text-xl font-semibold text-gray-800 mb-3">{selectedPoint.name}</h3>
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
          ) : (
            <>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">About This Map</h3>
              <p className="text-gray-800">
                This interactive map showcases key Points of Interest (POIs) in New York City. Click on any marker to view more details about the location. Click anywhere on the map to add a new point.
              </p>
              <ul className="mt-4 text-gray-800">
                <li>🔴 Markers indicate POI locations</li>
                <li>👆 Click on a marker to view details</li>
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

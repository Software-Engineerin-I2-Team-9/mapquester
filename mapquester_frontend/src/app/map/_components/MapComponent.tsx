import { useState, useCallback, useRef, useEffect } from 'react';
import Map, { Marker, ViewState, MapRef, MapMouseEvent } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Point } from '@/app/utils/types';
import { capitalize } from '@/app/utils/fns';
import { tagToColorMapping } from '@/app/utils/data';
import apiClient from '@/app/api/axios';
import { useRecoilState } from 'recoil';
import { authState } from '../../atoms/authState';
import GuidePopup from './GuidePopup';
import ConfirmationDialog from '@/components/ConfirmationDialog';
import Navbar from './NavBar';
import { useRouter } from 'next/navigation';

const MapComponent: React.FC = () => {
  const router = useRouter();
  const listViewRef = useRef<HTMLDivElement>(null);

  const [points, setPoints] = useState<Point[]>([]);
  const [selectedPoint, setSelectedPoint] = useState<Point | null>(null);
  const [newPoint, setNewPoint] = useState<Partial<Point> | null>(null);
  const [newlyCreatedPoint, setNewlyCreatedPoint] = useState<Point | null>(null);
  const [tempMarker, setTempMarker] = useState<{ longitude: number; latitude: number } | null>(null);
  const [isMapView, setIsMapView] = useState(true);
  const mapRef = useRef<MapRef>(null);
  const [auth, setAuth] = useRecoilState(authState);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

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
  const [isViewTransitioning, setIsViewTransitioning] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const [currViewState, setCurrViewState] = useState<ViewState>({
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

  useEffect(() => {
    console.log("Fetching...")
    const fetchPoints = async () => {
      if (!auth?.id) return; // Ensure auth ID exists
  
      try {
        const endpoint = `/api/v1/pois/get/${auth.id}`;
        const response = await apiClient.get(endpoint, {
          params: {
            viewType: isMapView ? 'map' : 'list',
            tags: selectedTags,
            ...(isMapView ? {} : { page: currentPage, page_size: 10 }), // Include pagination only for list view
          },
          paramsSerializer: (params) => {
            const queryString = new URLSearchParams();
            Object.entries(params).forEach(([key, value]) => {
              if (Array.isArray(value)) {
                value.forEach((val) => queryString.append(key, val));
              } else if (value !== undefined) {
                queryString.append(key, value);
              }
            });
            return queryString.toString();
          },
        });
  
        if (isMapView) {
          // For map view, replace points directly
          setPoints(response.data.pois || []); // Ensure points are cleared if response is empty
        } else {
          // For list view, handle pagination
          setPoints((prevPoints) =>
            currentPage === 1
              ? response.data.pois
              : [...prevPoints, ...response.data.pois]
          );
          setHasMore(currentPage < (response.data.pagination?.total_pages || 0)); // Ensure pagination exists
        }
      } catch (error) {
        console.error('Error fetching points:', error);
      }
    };
  
    fetchPoints();
  }, [auth?.id, selectedTags, isMapView, currentPage]);

  useEffect(() => {
    console.log("Fetching points for page:", currentPage, "Tags:", selectedTags);
  }, [currentPage, selectedTags]);
  
  const handleScroll = () => {
    if (listViewRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = listViewRef.current;
      console.log("Scroll details:", { scrollTop, scrollHeight, clientHeight });
  
      // Trigger loading more data when near the bottom
      if (scrollHeight - scrollTop <= clientHeight * 1.5 && hasMore) {
        console.log("Triggered loadMorePOIs");
        loadMorePOIs();
      }
    }
  };

  const loadMorePOIs = () => {
    if (hasMore) {
      setCurrentPage(prevPage => prevPage + 1);
    }
  };

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

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (newPoint && newPoint.title && newPoint.description) {
      try {
        const formData = new FormData();
        formData.append('userId', auth?.id);
        formData.append('latitude', newPoint.latitude!.toString());
        formData.append('longitude', newPoint.longitude!.toString());
        formData.append('title', newPoint.title);
        formData.append('tag', newPoint.tag!);
        formData.append('description', newPoint.description);

        const endpoint = '/api/v1/pois/create/';
        const response = await apiClient.post(endpoint, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        if (response.status === 201) {
          const createdPoint: Point = {
            id: response.data.poi_id,
            title: newPoint.title,
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
          setSelectedTags([]);

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
          setSelectedTags([]);
        }
      }
    } catch (error) {
      console.error('Error deleting POI:', error);
    }
  }, [selectedPoint]);

  const handleUpdateChange = (field: keyof Point, value: string) => {
    if (selectedPoint) {
      setSelectedPoint({ ...selectedPoint, [field]: value });
    }
  };

  const handleUpdateSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    console.log("Selected point: ",selectedPoint)
    if (selectedPoint) {
      try {
        const endpoint = `/api/v1/pois/update/${selectedPoint.id}/`;
        const updateData = {
          title: selectedPoint.title,
          description: selectedPoint.description,
          tag: selectedPoint.tag,
          latitude: selectedPoint.latitude,
          longitude: selectedPoint.longitude,
        };
  
        const response = await apiClient.patch(endpoint, updateData);
  
        if (response.status === 200) {
          // Create a new points array with the updated data
          setPoints((prevPoints) =>
            prevPoints.map((point) =>
              point.id === selectedPoint.id ? { ...point, ...response.data } : point
            )
          );
          setSelectedPoint((prevPoint) => ({
            ...prevPoint!,
            ...response.data,
          }));
          setIsUpdating(false);
          setSelectedTags([]);
        }
      } catch (error) {
        console.error('Error updating POI:', error);
      }
    }
  };
  

  const handleFormChange = (field: keyof Point, value: string) => {
    setNewPoint(prev => ({ ...prev, [field]: value }));
  };

  const handleTagChange = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
    if (listViewRef.current) {
      listViewRef.current.scrollTop = 0;
    }
    if (!isMapView) setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setSelectedTags([]);
    setPoints([]);
    setIsFilterMenuOpen(false);
    if (!isMapView) setCurrentPage(1);
  };

  const handleToggleFilterMenu = () => {
    setIsFilterMenuOpen((prev) => !prev);
  };

  return (
    <div className="relative w-full h-full flex flex-col">
      {/* Controls overlay */}
      <Navbar
        isMapView={isMapView}
        isFilterMenuOpen={isFilterMenuOpen}
        onToggleView={toggleView}
        onToggleFilterMenu={handleToggleFilterMenu}
        onResetFilters={handleResetFilters}
        selectedTags={selectedTags}
        onTagChange={handleTagChange}
        tags={ALL_TAGS.filter((tag) => tag !== 'all')}
      />

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
                      <div className="text-xs font-bold text-eggshell bg-black bg-opacity-50 px-1 rounded mb-1">
                        {point.title}
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
              className="absolute bottom-[6px] right-[10px] z-[99] bg-[#D69C89] text-white w-[32px] h-[32px] rounded-full flex items-center justify-center hover:opacity-90 transition-opacity"
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
          <div className={`absolute inset-0 flex flex-col ${isViewTransitioning ? 'view-transition-exit' : 'view-transition-enter'}`}>
  {/* List View Content */}
  <div ref={listViewRef} className="flex-1 overflow-y-auto bg-gray-50" onScroll={handleScroll}>
                <div className="space-y-2 p-4">
                  {!points.length ? (
                    <div className="animate-pulse space-y-2">
                      {Array(3).fill(null).map((_, index) => (
                        <div key={index} className="bg-gray-200 h-10 rounded"></div>
                      ))}
                    </div>
                  ) : (
                    points.map((point, index) => {
                      return (
                      
                        <div
                        key={index}
                        className="card bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden"
                      >
                        <div className="p-3">
                          <div className="flex justify-between items-start">
                          <div className="space-y-2">
                            <div className='flex space-x-2'>
                            <h3 className="text-base font-medium text-gray-800">
                              {point.title}
                            </h3>
                            <span
                              className="inline-block px-2 py-1 text-xs font-medium rounded-full text-white"
                              style={{
                                backgroundColor: tagToColorMapping[point.tag],
                              }}
                            >
                              {point.tag}
                            </span>
                            </div>
                            <p className="text-sm text-gray-600">
                              {point.description}
                            </p>
                          </div>

                          </div>
                          <div className="mt-4">
                            <button
                              onClick={() => setSelectedPoint(point)}
                              className="w-full hover-button bg-[#D69C89] text-white text-sm font-medium px-4 py-2 rounded"
                            >
                              View Details
                            </button>
                          </div>
                        </div>
                      </div>
                      
                    )})
                  )}
                  {hasMore && (
                    <div className="text-center py-4">
                      <span className="text-gray-600 animate-pulse">Loading more POIs...</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
        )}
      </div>

      {/* Footer Navigation */}
      <div className="h-[60px] bg-white border-t border-gray-200 flex justify-around items-center px-4 w-full">
        <button className="flex flex-col items-center text-[#C91C1C]">
          <span className="text-sm">Explore</span>
        </button>
        <button className="flex flex-col items-center text-gray-400">
          <span className="text-sm">Saved POI</span>
        </button>
        <button
          className="flex flex-col items-center text-gray-400"
          onClick={() => {
            
            router.push('/settings');
          }}
        >
          <span className="text-sm">Profile</span>
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
                    <label className="block text-sm font-medium text-gray-700">Title</label>
                    <input
                      type="text"
                      placeholder="Enter name"
                      value={newPoint.title || ''}
                      onChange={(e) => handleFormChange('title', e.target.value)}
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
                      {ALL_TAGS.filter(tag => tag !== 'all').map(tag => (
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
                {isUpdating ? (
                  <form onSubmit={handleUpdateSubmit}>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Title</label>
                        <input
                          type="text"
                          value={selectedPoint.title}
                          onChange={(e) => handleUpdateChange('title', e.target.value)}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#C91C1C] focus:border-[#C91C1C] sm:text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Tag</label>
                        <select
                          value={selectedPoint.tag}
                          onChange={(e) => handleUpdateChange('tag', e.target.value)}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#C91C1C] focus:border-[#C91C1C] sm:text-sm"
                        >
                          {ALL_TAGS.filter(tag => tag !== 'all').map(tag => (
                            <option key={tag} value={tag}>
                              {capitalize(tag)}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Description</label>
                        <textarea
                          value={selectedPoint.description}
                          onChange={(e) => handleUpdateChange('description', e.target.value)}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#C91C1C] focus:border-[#C91C1C] sm:text-sm"
                          rows={3}
                        />
                      </div>
                      <div className="flex justify-end space-x-2">
                        <button
                          type="submit"
                          className="bg-[#C91C1C] hover:bg-red-600 text-white font-bold py-2 px-4 rounded-full"
                        >
                          Save Changes
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsUpdating(false)}
                          className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-full"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </form>
                ) : (
                  <>
                    <h3 className="text-xl font-semibold text-gray-800 mb-3">{selectedPoint.title}</h3>
                    <p className="text-gray-800 mb-4">{selectedPoint.description}</p>
                    <p className="text-gray-800 mb-4">Tag: {capitalize(selectedPoint.tag)}</p>
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => setIsUpdating(true)}
                        className="bg-[#D69C89] hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
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
                )}
              </>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};

export default MapComponent;

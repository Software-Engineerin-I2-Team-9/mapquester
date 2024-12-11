import { useState, useCallback, useRef, useEffect, FC } from 'react';
import Map, { Marker, ViewState, MapRef, MapMouseEvent } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Point, ReactionUser } from '@/app/utils/types';
import { capitalize } from '@/app/utils/fns';
import { tagToColorMapping } from '@/app/utils/data';
import apiClient from '@/app/api/axios';
import { useRecoilState } from 'recoil';
import { authState } from '../../atoms/authState';
import GuidePopup from './GuidePopup';
import ConfirmationDialog from '@/components/ConfirmationDialog';
import Navbar from './NavBar';
import { useRouter, useSearchParams } from 'next/navigation';
import Footer from '@/app/_components/Footer';
import PointDetailsPanel from './panels/PointDetailsPanel';

type Location = {
  latitude: number;
  longitude: number;
};

const MapComponent: FC<{feed?: boolean}> = ({feed}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
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
  const [showAddPointButton, setShowAddPointButton] = useState(false);
  const addPointButtonTimeoutRef = useRef<NodeJS.Timeout>();

  const [showReactionModal, setShowReactionModal] = useState(false);
  const [reactionUsers, setReactionUsers] = useState<ReactionUser[]>([]);
  const [userLocation, setUserLocation] = useState<Location | null>(null);
  const [locationPermission, setLocationPermission] = useState<string>('prompt');

  useEffect(() => {
    // Request location permission when component mounts
    requestLocationPermission();
  }, []);

  const requestLocationPermission = async () => {
    try {
      const permission = await navigator.permissions.query({ name: 'geolocation' });
      setLocationPermission(permission.state);

      if (permission.state === 'granted') {
        startLocationTracking();
      } else if (permission.state === 'prompt') {
        // Show a custom dialog to request permission
        const result = window.confirm('MapQuester needs your location to provide better service. Allow location access?');
        if (result) {
          startLocationTracking();
        }
      }
    } catch (error) {
      console.error('Error requesting location permission:', error);
    }
  };

  const startLocationTracking = () => {
    if ('geolocation' in navigator) {
      // Get initial location
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => console.error('Error getting location:', error)
      );

      // Start watching location
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => console.error('Error watching location:', error),
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0,
        }
      );

      // Cleanup function
      return () => navigator.geolocation.clearWatch(watchId);
    }
  };

  useEffect(() => {
    console.log("Fetching...")
    const fetchPoints = async () => {
      if (!auth?.id) return; // Ensure auth ID exists

      /*
      if (feed) {
        const endpoint = `/api/v1/pois/feed/${auth.id}/`;
        const response = await apiClient.get(endpoint, {
          params: {
            tags: selectedTags,
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
        setPoints(response.data.feed || []);
        return;
      }
      */
  
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
    if (feed) return;
    
    const { lngLat } = event;
    
    // Clear any existing timeout
    if (addPointButtonTimeoutRef.current) {
      clearTimeout(addPointButtonTimeoutRef.current);
    }
    
    // Clear selected point when clicking on map
    setSelectedPoint(null);
    setIsUpdating(false);
    
    setTempMarker({
      latitude: lngLat.lat,
      longitude: lngLat.lng,
    });
    setPendingLocation({
      latitude: lngLat.lat,
      longitude: lngLat.lng,
    });
    setShowAddPointButton(true);
    
    // Set timeout to hide the button after 3 seconds
    addPointButtonTimeoutRef.current = setTimeout(() => {
      setShowAddPointButton(false);
      setTempMarker(null);
      setPendingLocation(null);
    }, 3000);
  }, [feed]);

  useEffect(() => {
    return () => {
      if (addPointButtonTimeoutRef.current) {
        clearTimeout(addPointButtonTimeoutRef.current);
      }
    };
  }, []);

  const handleMarkerClick = (point: Point) => {
    setSelectedPoint(point);
    setNewPoint(null);
    setShowAddPointButton(false);
    setTempMarker(null);
    setPendingLocation(null);
    if (addPointButtonTimeoutRef.current) {
      clearTimeout(addPointButtonTimeoutRef.current);
    }
  
    // Center map with vertical offset
    if (mapRef.current) {
      const map = mapRef.current?.getMap()
      if (map) {
        const height = map.getContainer().clientHeight;
        map.easeTo({
          center: [Number(point.longitude), Number(point.latitude)],
          offset: [0, -0.2 * height], // Shift map center up by 20% of map's height
          duration: 1000
        });
      }
    }
  };

  const handleAddPoint = () => {
    if (pendingLocation) {
      setNewPoint(pendingLocation);
      setShowAddPointButton(false);
      if (addPointButtonTimeoutRef.current) {
        clearTimeout(addPointButtonTimeoutRef.current);
      }
    }
  };

  const handleConfirmNewPoint = () => {
    if (pendingLocation) {
      setNewPoint(pendingLocation);
      setTempMarker(pendingLocation);
      setSelectedPoint(null);
    }
  };

  const handleCancelNewPoint = () => {
    setPendingLocation(null);
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

  const handleUpdateChange = (field: keyof Point, value: string | boolean | Array<{filename: string, data: File}>) => {
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
  

  const handleFormChange = (field: keyof Point, value: string | boolean | Array<{filename: string, data: File}>) => {
    setNewPoint(prev => ({ ...prev, [field]: value }));
  };

  const handleTagChange = (tag: string) => {
    const newTags = selectedTags.includes(tag) 
      ? selectedTags.filter((t) => t !== tag) 
      : [...selectedTags, tag];
    
    setSelectedTags(newTags);
    
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

  useEffect(() => {
    // Run only once on mount
    const initialTagParams = searchParams.getAll('tag');
    if (initialTagParams.length > 0) {
      setSelectedTags(initialTagParams);
    }
  
    const poiId = searchParams.get('poi_id');
    if (poiId && points.length > 0) {
      const foundPoint = points.find(point => point.id.toString() === poiId);
      if (foundPoint) {
        setSelectedPoint(foundPoint);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 

// Effect to update the URL whenever selectedTags or selectedPoint change
useEffect(() => {
  const currentParams = new URLSearchParams();
  
  selectedTags.forEach(tag => {
    currentParams.append('tag', tag);
  });
  
  // Only include poi_id in URL if we're in map view
  if (selectedPoint && isMapView) {
    currentParams.set('poi_id', selectedPoint.id.toString());
  }

  const newUrl = currentParams.toString()
    ? `${window.location.pathname}?${currentParams.toString()}`
    : window.location.pathname;

  if (window.location.search !== `?${currentParams.toString()}`) {
    window.history.pushState({}, '', newUrl);
  }
}, [selectedTags, selectedPoint, isMapView]);

// Effect to recenter the map if we have a selectedPoint
useEffect(() => {
  if (!selectedPoint || !mapRef.current) return;
  
  const map = mapRef.current.getMap();
  if (map) {
    const height = map.getContainer().clientHeight;
    map.easeTo({
      center: [Number(selectedPoint.longitude), Number(selectedPoint.latitude)],
      offset: [0, -0.2 * height],
      duration: 1000
    });
  }
}, [selectedPoint]);



  

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
              onClick={feed? undefined : handleMapClick}
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
                      handleMarkerClick(point);
                    }}
                  >
                    <div className="flex flex-col items-center">
                      <div className="text-xs font-bold text-eggshell bg-black bg-opacity-50 px-1 rounded mb-1">
                        {point.title}
                      </div>
                      <svg 
                        width="24" 
                        height="38" 
                        viewBox="0 0 42 66" 
                        fill="none" 
                        xmlns="http://www.w3.org/2000/svg"
                        className={`${newlyCreatedPoint === point ? 'animate-pulse' : ''}`}
                      >
                        <path 
                          opacity="0.3" 
                          d="M25.5 63.5C25.5 63.8989 25.1636 64.3947 24.3119 64.8206C23.4902 65.2314 22.3199 65.5 21 65.5C19.6801 65.5 18.5098 65.2314 17.6881 64.8206C16.8364 64.3947 16.5 63.8989 16.5 63.5C16.5 63.1011 16.8364 62.6053 17.6881 62.1794C18.5098 61.7686 19.6801 61.5 21 61.5C22.3199 61.5 23.4902 61.7686 24.3119 62.1794C25.1636 62.6053 25.5 63.1011 25.5 63.5Z" 
                          fill={newlyCreatedPoint === point ? '#22c55e' : tagToColorMapping[point.tag]} 
                          stroke={newlyCreatedPoint === point ? '#22c55e' : tagToColorMapping[point.tag]}
                        />
                        <path 
                          d="M22.953 41.4082L22.5 41.451V41.906V62C22.5 62.8284 21.8284 63.5 21 63.5C20.1716 63.5 19.5 62.8284 19.5 62V41.906V41.451L19.047 41.4082C8.6415 40.4251 0.5 31.663 0.5 21C0.5 9.67816 9.67816 0.5 21 0.5C32.3218 0.5 41.5 9.67816 41.5 21C41.5 31.663 33.3585 40.4251 22.953 41.4082Z" 
                          fill="white" 
                          stroke={newlyCreatedPoint === point ? '#22c55e' : tagToColorMapping[point.tag]}
                        />
                        <path 
                          d="M21 4.5C30.1127 4.5 37.5 11.8873 37.5 21C37.5 30.1127 30.1127 37.5 21 37.5C11.8873 37.5 4.5 30.1127 4.5 21C4.5 11.8873 11.8873 4.5 21 4.5Z" 
                          fill={newlyCreatedPoint === point ? '#22c55e' : tagToColorMapping[point.tag]} 
                          stroke={newlyCreatedPoint === point ? '#22c55e' : tagToColorMapping[point.tag]}
                        />
                        <path 
                          d="M21 14.5C24.5899 14.5 27.5 17.4101 27.5 21C27.5 24.5899 24.5899 27.5 21 27.5C17.4101 27.5 14.5 24.5899 14.5 21C14.5 17.4101 17.4101 14.5 21 14.5Z" 
                          fill="white" 
                          stroke={newlyCreatedPoint === point ? '#22c55e' : tagToColorMapping[point.tag]}
                        />
                      </svg>
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
              {userLocation && (
                <Marker 
                  longitude={userLocation.longitude} 
                  latitude={userLocation.latitude}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="8" fill="#007AFF" fillOpacity="0.2"/>
                    <circle cx="12" cy="12" r="4" fill="#007AFF"/>
                  </svg>
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
                fontWeight: 'bold',
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
                              {capitalize(point.tag)}
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

      {showAddPointButton && isMapView && !feed && (
  <div 
    className="absolute bottom-20 left-1/2 transform -translate-x-1/2 z-50 animate-fadeIn"
    style={{
      animation: 'fadeIn 0.3s ease-out forwards',
    }}
  >
    <button
      onClick={handleAddPoint}
      className="bg-[#D69C89] hover:bg-[#CD5C5C] text-white font-bold py-2 px-6 rounded-full shadow-lg flex items-center space-x-2"
    >
      <span>Add Point Here</span>
    </button>
  </div>
)}

      {/* Footer Navigation */}
      <Footer currentPage={feed ? "feed" : "explore"} />

      {/* Modals and popups */}
      <GuidePopup isOpen={showGuide} onClose={() => setShowGuide(false)} />

      {showReactionModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div 
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => setShowReactionModal(false)}
          />
          <div className="relative bg-white rounded-lg p-6 mx-4 shadow-xl max-w-[90%] w-[400px] z-10">
            <div className="flex justify-center items-center mb-4">
              <h4 className="text-sm font-medium text-gray-700">Reactions</h4>
            </div>
            <div className="space-y-2">
              {reactionUsers.map((user, index) => (
                <div key={index} className="flex justify-start px-2">
                  <span className="text-sm">{user.username}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <PointDetailsPanel
        feed={feed}
        newPoint={newPoint}
        selectedPoint={selectedPoint}
        isUpdating={isUpdating}
        onFormSubmit={handleFormSubmit}
        onFormChange={handleFormChange}
        onCancelPointCreation={cancelPointCreation}
        onUpdateSubmit={handleUpdateSubmit}
        onUpdateChange={handleUpdateChange}
        onDeletePoint={deletePoint}
        setSelectedPoint={setSelectedPoint}
        setIsUpdating={setIsUpdating}
        tags={ALL_TAGS.filter(tag => tag !== 'all')}
        setShowReactionModal={setShowReactionModal}
        setReactionUsers={setReactionUsers}
      />
    </div>
  );
};

export default MapComponent;

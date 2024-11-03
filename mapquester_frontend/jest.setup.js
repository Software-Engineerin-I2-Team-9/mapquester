// jest.setup.js
import '@testing-library/jest-dom'

// Mock next/router
jest.mock('next/router', () => ({
  useRouter() {
    return {
      route: '/',
      pathname: '',
      query: {},
      asPath: '',
      push: jest.fn(),
      replace: jest.fn(),
    }
  },
}))

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// Mock mapbox-gl with more complete functionality
jest.mock('mapbox-gl/dist/mapbox-gl', () => ({
  Map: class {
    on() { return this }
    remove() {}
    flyTo() {}
    getCenter() { return { lat: 0, lng: 0 } }
    getZoom() { return 10 }
  },
  Marker: class {
    setLngLat() { return this }
    addTo() { return this }
  },
  // Add other mapbox-gl elements your component uses
  NavigationControl: class {},
}))

// Mock react-map-gl since you're using it directly
jest.mock('react-map-gl', () => ({
  Map: ({ children, onClick }) => (
    <div data-testid="map-container" onClick={onClick}>
      {children}
    </div>
  ),
  Marker: ({ children, longitude, latitude }) => (
    <div data-testid={`marker-${longitude}-${latitude}`}>
      {children}
    </div>
  ),
  NavigationControl: () => <div data-testid="navigation-control" />,
  ViewState: class {},
  MapRef: class {
    flyTo() {}
  },
}))

// Mock environment variables
process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN = 'mock-token'
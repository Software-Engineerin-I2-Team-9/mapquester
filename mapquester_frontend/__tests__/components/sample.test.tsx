import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import MapComponent from '../../src/app/map/_components/MapComponent'

// Mock mapbox-gl since it doesn't work well in Jest environment
jest.mock('react-map-gl', () => ({
  Map: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="map-container">{children}</div>
  ),
  Marker: ({ children }: { children: React.ReactNode }) => children,
}))

describe('Map Component', () => {
  it('renders map container and initial points', () => {
    render(<MapComponent />)
    
    // Check if map container exists
    expect(screen.getByTestId('map-container')).toBeInTheDocument()
    
    // Check if initial POIs are rendered
    expect(screen.getByText('Tandon School of Engineering')).toBeInTheDocument()
    expect(screen.getByText('Brooklyn Bridge')).toBeInTheDocument()
    expect(screen.getByText('DUMBO')).toBeInTheDocument()
  })

  it('shows about section when no point is selected', () => {
    render(<MapComponent />)
    expect(screen.getByText('About This Map')).toBeInTheDocument()
    expect(screen.getByText('This interactive map showcases key Points of Interest (POIs) in New York City.')).toBeInTheDocument()
  })

  it('shows point details when a marker is clicked', () => {
    render(<MapComponent />)
    
    // Click on the first marker (Tandon)
    const markerName = screen.getByText('Tandon School of Engineering')
    fireEvent.click(markerName)
    
    // Check if the description is shown
    expect(screen.getByText("NYU's engineering and applied sciences campus in Brooklyn.")).toBeInTheDocument()
  })

  it('shows POI form when map is clicked', () => {
    render(<MapComponent />)
    
    // Simulate map click by triggering the onClick handler
    const mapContainer = screen.getByTestId('map-container')
    fireEvent.click(mapContainer)
    
    // Check if the form appears
    // Note: You'll need to add test-ids or specific text to your POIForm component
    expect(screen.queryByText('About This Map')).not.toBeInTheDocument()
    // Add more specific form checks based on your POIForm implementation
  })
})
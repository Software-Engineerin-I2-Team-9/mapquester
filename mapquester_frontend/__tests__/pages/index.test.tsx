// __tests__/pages/index.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { RecoilRoot } from 'recoil'
import { authState } from '../../src/app/atoms/authState'
import Home from '../../src/app/page'

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
    }
  }
}))

// Mock MapComponent
jest.mock('../../src/map/_components/MapComponent', () => {
  return function MockMapComponent() {
    return <div data-testid="map-component">Map Component</div>
  }
})

describe('Home Page', () => {
  const renderWithRecoil = (ui: React.ReactElement, initialState = { isLoggedIn: false, username: '' }) => {
    return render(
      <RecoilRoot initializeState={({ set }) => set(authState, initialState)}>
        {ui}
      </RecoilRoot>
    )
  }

  describe('When user is not logged in', () => {
    beforeEach(() => {
      renderWithRecoil(<Home />, { isLoggedIn: false, username: '' })
    })

    it('renders the landing page content', () => {
      expect(screen.getByText('MapQuester')).toBeInTheDocument()
      expect(screen.getByText('Pin, Share, and Discover Hobbies')).toBeInTheDocument()
      expect(screen.getByText('Get Started')).toBeInTheDocument()
    })

    it('redirects to login when Get Started is clicked', () => {
      const button = screen.getByText('Get Started')
      fireEvent.click(button)
      // Verify router.push was called with '/login'
      expect(require('next/navigation').useRouter().push).toHaveBeenCalledWith('/login')
    })
  })

  describe('When user is logged in', () => {
    beforeEach(() => {
      renderWithRecoil(<Home />, { isLoggedIn: true, username: 'testuser' })
    })

    it('renders the map component', () => {
      expect(screen.getByTestId('map-component')).toBeInTheDocument()
    })

    it('applies correct styling to map container', () => {
      const container = screen.getByTestId('map-component').parentElement
      expect(container).toHaveClass('bg-blue-800/30', 'backdrop-blur-md', 'rounded-lg')
    })
  })

  describe('When DEV_NO_AUTH is true', () => {
    beforeEach(() => {
      process.env.NEXT_PUBLIC_DEV_NO_AUTH = 'true'
      renderWithRecoil(<Home />, { isLoggedIn: false, username: '' })
    })

    afterEach(() => {
      process.env.NEXT_PUBLIC_DEV_NO_AUTH = undefined
    })

    it('renders the map component even when not logged in', () => {
      expect(screen.getByTestId('map-component')).toBeInTheDocument()
    })
  })
})
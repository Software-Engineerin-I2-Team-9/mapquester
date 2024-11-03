// __tests__/components/POIForm.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import POIForm from '../../src/app/map/_components/POIForm'

describe('POIForm Component', () => {
  const mockOnSubmit = jest.fn((e) => e.preventDefault())
  const mockOnChange = jest.fn()
  const defaultProps = {
    newPoint: {
      latitude: 40.6942,
      longitude: -73.9862,
    },
    onSubmit: mockOnSubmit,
    onChange: mockOnChange,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders all form fields', () => {
    render(<POIForm {...defaultProps} />)
    
    // Check if all form elements are present
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/latitude/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/longitude/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument()
    expect(screen.getByText('Create Point')).toBeInTheDocument()
  })

  it('displays provided coordinates correctly', () => {
    render(<POIForm {...defaultProps} />)
    
    const latitudeInput = screen.getByLabelText(/latitude/i) as HTMLInputElement
    const longitudeInput = screen.getByLabelText(/longitude/i) as HTMLInputElement
    
    expect(latitudeInput.value).toBe('40.6942')
    expect(longitudeInput.value).toBe('-73.9862')
  })

  it('handles input changes correctly', () => {
    render(<POIForm {...defaultProps} />)
    
    // Test name input
    const nameInput = screen.getByLabelText(/name/i)
    fireEvent.change(nameInput, { target: { value: 'Test Location' } })
    expect(mockOnChange).toHaveBeenCalledWith('name', 'Test Location')

    // Test description input
    const descriptionInput = screen.getByLabelText(/description/i)
    fireEvent.change(descriptionInput, { target: { value: 'Test Description' } })
    expect(mockOnChange).toHaveBeenCalledWith('description', 'Test Description')
  })

  it('coordinates inputs are read-only', () => {
    render(<POIForm {...defaultProps} />)
    
    const latitudeInput = screen.getByLabelText(/latitude/i) as HTMLInputElement
    const longitudeInput = screen.getByLabelText(/longitude/i) as HTMLInputElement
    
    expect(latitudeInput).toHaveAttribute('readOnly')
    expect(longitudeInput).toHaveAttribute('readOnly')
  })

  it('submits form with all required fields', () => {
    const filledProps = {
      ...defaultProps,
      newPoint: {
        ...defaultProps.newPoint,
        name: 'Test Location',
        description: 'Test Description'
      }
    }
    
    render(<POIForm {...filledProps} />)
    
    const submitButton = screen.getByText('Create Point')
    fireEvent.click(submitButton)
    
    expect(mockOnSubmit).toHaveBeenCalled()
  })

  it('requires name and description fields', () => {
    render(<POIForm {...defaultProps} />)
    
    const nameInput = screen.getByLabelText(/name/i) as HTMLInputElement
    const descriptionInput = screen.getByLabelText(/description/i) as HTMLInputElement
    
    expect(nameInput).toBeRequired()
    expect(descriptionInput).toBeRequired()
  })

  it('applies correct styling classes', () => {
    render(<POIForm {...defaultProps} />)
    
    const form = screen.getByRole('form')
    const submitButton = screen.getByText('Create Point')
    
    expect(form).toHaveClass('space-y-4')
    expect(submitButton).toHaveClass('bg-blue-600', 'text-white', 'rounded-md')
  })
})
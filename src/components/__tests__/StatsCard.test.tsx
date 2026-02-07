import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import StatsCard from '../StatsCard'
import { CheckCircle } from 'lucide-react'

describe('StatsCard', () => {
  it('renders stats card with correct content', () => {
    render(
      <StatsCard
        name="Test Stat"
        value={42}
        icon={CheckCircle}
        color="from-blue-500 to-blue-600"
      />
    )

    expect(screen.getByText('Test Stat')).toBeInTheDocument()
    expect(screen.getByText('42')).toBeInTheDocument()
  })

  it('renders icon correctly', () => {
    render(
      <StatsCard
        name="Test Stat"
        value={42}
        icon={CheckCircle}
        color="from-blue-500 to-blue-600"
      />
    )

    const icon = document.querySelector('svg')
    expect(icon).toBeInTheDocument()
  })

  it('applies custom className', () => {
    render(
      <StatsCard
        name="Test Stat"
        value={42}
        icon={CheckCircle}
        color="from-blue-500 to-blue-600"
        className="custom-class"
      />
    )

    const card = document.querySelector('.custom-class')
    expect(card).toBeInTheDocument()
  })
})

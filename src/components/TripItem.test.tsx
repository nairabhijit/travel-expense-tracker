import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import TripItem from './TripItem';
import { Trip, Expense } from '../types';

vi.mock('../hooks/useExpenses', () => ({
  useExpenses: () => ({
    expenses: [
      { id: '1', tripId: 'trip-1', categoryId: 'food', amount: 100, date: '2024-01-01', sourceId: 'cash', currency: 'USD', baseCurrencyAmount: 100 }
    ],
    addExpense: vi.fn(),
    updateExpense: vi.fn(),
    deleteExpense: vi.fn(),
  })
}));

vi.mock('../hooks/useTrips', () => ({
  useTrips: () => ({
    trips: [],
    addTrip: vi.fn(),
    updateTrip: vi.fn(),
    deleteTrip: vi.fn(),
  })
}));

vi.mock('@ionic/react', async () => {
  const actual = await vi.importActual('@ionic/react') as any;
  return {
    ...actual,
    IonModal: ({ children, isOpen }: any) => isOpen ? <div data-testid="mock-modal">{children}</div> : null,
  };
});

describe('TripItem', () => {
  const mockTrip: Trip = {
    id: 'trip-1',
    title: 'Test Trip',
    startDate: '2024-01-01',
    endDate: '2024-01-10',
    localCurrency: 'USD',
    spendingCurrency: 'USD',
  };

  it('renders trip item correctly and displays total expense', () => {
    render(<TripItem trip={mockTrip} />);
    
    // Check Base Currency
    expect(screen.getByText(/Base Currency:/)).toBeInTheDocument();
    
    // Total should be 100
    expect(screen.getByText(/100.00/)).toBeInTheDocument();
    
    // Renders expense
    expect(screen.getByText('Food & Dining')).toBeInTheDocument();
  });
});

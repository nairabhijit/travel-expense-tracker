import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import Home from '../pages/Home';

vi.mock('@ionic/react', async () => {
  const actual = await vi.importActual('@ionic/react') as any;
  return {
    ...actual,
    IonModal: ({ children, isOpen }: any) => isOpen ? <div data-testid="mock-modal">{children}</div> : null,
  };
});

vi.mock('../hooks/useTrips', () => ({
  useTrips: () => ({
    trips: [
      { id: 'trip-1', title: 'Test Trip', startDate: '2024-01-01', endDate: '2024-01-10', localCurrency: 'USD', spendingCurrency: 'USD' }
    ],
    addTrip: vi.fn(),
    updateTrip: vi.fn(),
    deleteTrip: vi.fn(),
  })
}));

vi.mock('../hooks/useExpenses', () => ({
  useExpenses: () => ({
    expenses: [],
    addExpense: vi.fn(),
    updateExpense: vi.fn(),
    deleteExpense: vi.fn(),
  })
}));

describe('Home Page', () => {
  it('renders correctly', () => {
    // Basic test to ensure it loads without crashing
    render(<Home />);
    expect(screen.getByText('Travel Expenses')).toBeInTheDocument();
  });
});

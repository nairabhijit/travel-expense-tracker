import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import TripStatsModal from './TripStatsModal';
import { Trip, Expense } from '../types';

vi.mock('@ionic/react', async () => {
  const actual = await vi.importActual('@ionic/react') as any;
  return {
    ...actual,
    IonModal: ({ children, isOpen }: any) => isOpen ? <div data-testid="mock-modal">{children}</div> : null,
  };
});

vi.mock('recharts', async () => {
  const actual = await vi.importActual('recharts') as any;
  return {
    ...actual,
    ResponsiveContainer: ({ children }: any) => <div>{children}</div>,
    PieChart: () => <div>PieChart Mock</div>,
  };
});

describe('TripStatsModal', () => {
  const mockTrip: Trip = {
    id: 'trip-1',
    title: 'Test Trip',
    startDate: '2024-01-01',
    endDate: '2024-01-10',
    localCurrency: 'USD',
    spendingCurrency: 'USD',
  };

  const mockExpenses: Expense[] = [
    {
      id: 'exp-1',
      tripId: 'trip-1',
      categoryId: 'food',
      amount: 100,
      date: '2024-01-02',
      sourceId: 'cash',
      currency: 'USD',
      baseCurrencyAmount: 100,
    }
  ];

  it('renders without crashing even when closed', () => {
    render(
      <TripStatsModal
        isOpen={false}
        onDidDismiss={() => {}}
        trip={mockTrip}
        expenses={mockExpenses}
      />
    );
  });

  it('renders modal content when open', () => {
    render(
      <TripStatsModal
        isOpen={true}
        onDidDismiss={() => {}}
        trip={mockTrip}
        expenses={mockExpenses}
      />
    );
    expect(screen.getByText('Trip Stats')).toBeInTheDocument();
  });
});

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import AddExpenseModal from './AddExpenseModal';
import { Trip } from '../types';

vi.mock('@ionic/react', async () => {
  const actual = await vi.importActual('@ionic/react') as any;
  return {
    ...actual,
    IonModal: ({ children, isOpen }: any) => isOpen ? <div>{children}</div> : null,
  };
});

describe('AddExpenseModal', () => {
  const mockTrip: Trip = {
    id: 'trip-1',
    title: 'Test Trip',
    startDate: '2024-01-01',
    endDate: '2024-01-10',
    localCurrency: 'USD',
    spendingCurrency: 'USD',
  };

  it('renders correctly when open', () => {
    render(
      <AddExpenseModal
        isOpen={true}
        onDidDismiss={() => {}}
        onSaveExpense={() => {}}
        trip={mockTrip}
      />
    );
    expect(screen.getByText('Add Expense')).toBeInTheDocument();
    expect(screen.getByText('Food & Dining')).toBeInTheDocument(); // Categories should be visible first
  });

  it('calls onDidDismiss when close button is clicked', () => {
    const handleDismiss = vi.fn();
    render(
      <AddExpenseModal
        isOpen={true}
        onDidDismiss={handleDismiss}
        onSaveExpense={() => {}}
        trip={mockTrip}
      />
    );

    const closeButton = screen.getByText('Close');
    fireEvent.click(closeButton);
    expect(handleDismiss).toHaveBeenCalled();
  });
});

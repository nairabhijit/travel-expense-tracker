import { renderHook, act } from '@testing-library/react';
import { useTrips } from './useTrips';

describe('useTrips', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should initialize with empty trips', () => {
    const { result } = renderHook(() => useTrips());
    expect(result.current.trips).toEqual([]);
  });

  it('should add a trip', () => {
    const { result } = renderHook(() => useTrips());

    act(() => {
      result.current.addTrip({
        title: 'Test Trip',
        startDate: '2024-01-01',
        endDate: '2024-01-10',
        localCurrency: 'USD',
        spendingCurrency: 'USD',
      });
    });

    expect(result.current.trips).toHaveLength(1);
    expect(result.current.trips[0].localCurrency).toBe('USD');
    expect(result.current.trips[0].id).toBeDefined();
  });

  it('should update a trip', () => {
    const { result } = renderHook(() => useTrips());

    act(() => {
      result.current.addTrip({
        title: 'Test Trip',
        startDate: '2024-01-01',
        endDate: '2024-01-10',
        localCurrency: 'USD',
        spendingCurrency: 'USD',
      });
    });

    const tripId = result.current.trips[0].id;

    act(() => {
      result.current.updateTrip({
        id: tripId,
        title: 'Updated Trip',
        startDate: '2024-01-01',
        endDate: '2024-01-10',
        localCurrency: 'EUR',
        spendingCurrency: 'EUR',
        cashExchangeRate: 1.1,
      });
    });

    expect(result.current.trips[0].localCurrency).toBe('EUR');
    expect(result.current.trips[0].cashExchangeRate).toBe(1.1);
  });

  it('should delete a trip', () => {
    const { result } = renderHook(() => useTrips());

    act(() => {
      result.current.addTrip({
        title: 'Test Trip',
        startDate: '2024-01-01',
        endDate: '2024-01-10',
        localCurrency: 'USD',
        spendingCurrency: 'USD',
      });
    });

    const tripId = result.current.trips[0].id;

    act(() => {
      result.current.deleteTrip(tripId);
    });

    expect(result.current.trips).toHaveLength(0);
  });
});

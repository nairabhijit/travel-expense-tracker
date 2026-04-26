import { renderHook, act } from '@testing-library/react';
import { useExpenses } from './useExpenses';

describe('useExpenses', () => {
  const tripId = 'test-trip-id';

  beforeEach(() => {
    localStorage.clear();
  });

  it('should initialize with empty expenses', () => {
    const { result } = renderHook(() => useExpenses(tripId));
    expect(result.current.expenses).toEqual([]);
  });

  it('should add an expense', () => {
    const { result } = renderHook(() => useExpenses(tripId));

    act(() => {
      result.current.addExpense({
        tripId,
        categoryId: 'food',
        amount: 100,
        date: '2024-01-01',
        sourceId: 'cash',
        currency: 'USD',
        baseCurrencyAmount: 100,
      });
    });

    expect(result.current.expenses).toHaveLength(1);
    expect(result.current.expenses[0].categoryId).toBe('food');
    expect(result.current.expenses[0].tripId).toBe(tripId);
    expect(result.current.expenses[0].id).toBeDefined();
  });

  it('should update an expense', () => {
    const { result } = renderHook(() => useExpenses(tripId));

    act(() => {
      result.current.addExpense({
        tripId,
        categoryId: 'food',
        amount: 100,
        date: '2024-01-01',
        sourceId: 'cash',
        currency: 'USD',
        baseCurrencyAmount: 100,
      });
    });

    const expenseId = result.current.expenses[0].id;

    act(() => {
      result.current.updateExpense({
        id: expenseId,
        tripId,
        categoryId: 'transport',
        amount: 50,
        date: '2024-01-02',
        sourceId: 'card',
        currency: 'EUR',
        baseCurrencyAmount: 55,
      });
    });

    expect(result.current.expenses[0].categoryId).toBe('transport');
    expect(result.current.expenses[0].baseCurrencyAmount).toBe(55);
  });

  it('should delete an expense', () => {
    const { result } = renderHook(() => useExpenses(tripId));

    act(() => {
      result.current.addExpense({
        tripId,
        categoryId: 'food',
        amount: 100,
        date: '2024-01-01',
        sourceId: 'cash',
        currency: 'USD',
        baseCurrencyAmount: 100,
      });
    });

    const expenseId = result.current.expenses[0].id;

    act(() => {
      result.current.deleteExpense(expenseId);
    });

    expect(result.current.expenses).toHaveLength(0);
  });
});

import { useState, useCallback, useEffect } from 'react';
import { Expense } from '../types';
import { generateId } from '../utils/format';

const EXPENSES_KEY = 'travel_expenses_expenses';

export const useExpenses = (tripId?: string) => {
  const [expenses, setExpenses] = useState<Expense[]>([]);

  const loadExpenses = useCallback(() => {
    const stored = localStorage.getItem(EXPENSES_KEY);
    if (stored) {
      const allExpenses: Expense[] = JSON.parse(stored);
      if (tripId) {
        setExpenses(allExpenses.filter(e => e.tripId === tripId));
      } else {
        setExpenses(allExpenses);
      }
    }
  }, [tripId]);

  useEffect(() => {
    loadExpenses();
  }, [loadExpenses]);

  const addExpense = (expense: Omit<Expense, 'id'>) => {
    const newExpense = { ...expense, id: generateId() };
    const stored = localStorage.getItem(EXPENSES_KEY);
    const allExpenses: Expense[] = stored ? JSON.parse(stored) : [];
    
    const updatedExpenses = [newExpense, ...allExpenses]; // Prepend new expenses
    localStorage.setItem(EXPENSES_KEY, JSON.stringify(updatedExpenses));
    
    if (!tripId || expense.tripId === tripId) {
      setExpenses(prev => [newExpense, ...prev]);
    }
    
    return newExpense;
  };

  const updateExpense = (updatedExpense: Expense) => {
    const stored = localStorage.getItem(EXPENSES_KEY);
    const allExpenses: Expense[] = stored ? JSON.parse(stored) : [];
    
    const index = allExpenses.findIndex(e => e.id === updatedExpense.id);
    if (index !== -1) {
      allExpenses[index] = updatedExpense;
      localStorage.setItem(EXPENSES_KEY, JSON.stringify(allExpenses));
      
      setExpenses(prev => {
        const newExpenses = [...prev];
        const localIndex = newExpenses.findIndex(e => e.id === updatedExpense.id);
        if (localIndex !== -1) {
          newExpenses[localIndex] = updatedExpense;
        }
        return newExpenses;
      });
    }
  };

  const deleteExpense = (expenseId: string) => {
    const stored = localStorage.getItem(EXPENSES_KEY);
    const allExpenses: Expense[] = stored ? JSON.parse(stored) : [];
    
    const filteredExpenses = allExpenses.filter(e => e.id !== expenseId);
    localStorage.setItem(EXPENSES_KEY, JSON.stringify(filteredExpenses));
    
    setExpenses(prev => prev.filter(e => e.id !== expenseId));
  };

  return { expenses, addExpense, updateExpense, deleteExpense, loadExpenses };
};

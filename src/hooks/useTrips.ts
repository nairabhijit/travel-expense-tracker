import { useState, useCallback, useEffect } from 'react';
import { Trip } from '../types';
import { generateId } from '../utils/format';

const TRIPS_KEY = 'travel_expenses_trips';

export const useTrips = () => {
  const [trips, setTrips] = useState<Trip[]>([]);

  const loadTrips = useCallback(() => {
    const stored = localStorage.getItem(TRIPS_KEY);
    if (stored) {
      setTrips(JSON.parse(stored));
    }
  }, []);

  useEffect(() => {
    loadTrips();
    window.addEventListener('tripsUpdated', loadTrips);
    return () => window.removeEventListener('tripsUpdated', loadTrips);
  }, [loadTrips]);

  const addTrip = (trip: Omit<Trip, 'id'>) => {
    const newTrip = { ...trip, id: generateId() };
    const stored = localStorage.getItem(TRIPS_KEY);
    const allTrips: Trip[] = stored ? JSON.parse(stored) : [];
    
    const updatedTrips = [newTrip, ...allTrips]; // Prepend new trips
    localStorage.setItem(TRIPS_KEY, JSON.stringify(updatedTrips));
    setTrips(updatedTrips);
    window.dispatchEvent(new Event('tripsUpdated'));
    return newTrip;
  };

  const updateTrip = (updatedTrip: Trip) => {
    const stored = localStorage.getItem(TRIPS_KEY);
    const allTrips: Trip[] = stored ? JSON.parse(stored) : [];
    
    const index = allTrips.findIndex(t => t.id === updatedTrip.id);
    if (index !== -1) {
      allTrips[index] = updatedTrip;
      localStorage.setItem(TRIPS_KEY, JSON.stringify(allTrips));
      setTrips(allTrips);
      window.dispatchEvent(new Event('tripsUpdated'));
    }
  };

  const deleteTrip = (tripId: string) => {
    const stored = localStorage.getItem(TRIPS_KEY);
    const allTrips: Trip[] = stored ? JSON.parse(stored) : [];
    
    const filteredTrips = allTrips.filter(t => t.id !== tripId);
    localStorage.setItem(TRIPS_KEY, JSON.stringify(filteredTrips));
    setTrips(filteredTrips);
    window.dispatchEvent(new Event('tripsUpdated'));
  };

  return { trips, addTrip, updateTrip, deleteTrip, loadTrips };
};

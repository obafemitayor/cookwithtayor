import { useState, useEffect, useCallback } from 'react';
import { cuisineService } from '../services/cuisineService';
import type { Cuisine } from '../types';

export const useCuisines = () => {
  const [cuisines, setCuisines] = useState<Cuisine[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown | null>(null);

  const fetchCuisines = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const cuisinesData = await cuisineService.getAllCuisines();
      setCuisines(cuisinesData);
    } catch (err: unknown) {
      setError(err);
      setCuisines([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCuisines();
  }, [fetchCuisines]);

  return {
    cuisines,
    loading,
    error,
  };
};

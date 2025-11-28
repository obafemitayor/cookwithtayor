import { useState, useCallback, useRef, useEffect } from 'react';
import { ingredientService, type IngredientsParams } from '../services/ingredientService';
import type { Ingredient, IngredientsResponse } from '../types';

const DEBOUNCE_DELAY = 300;
// I am deliberately making an assumption that the ingredient the user wants
// will be found in the first 200 items. So I set PAGE_SIZE to 200.
// This lets me skip adding pagination to the dropdown,
// which I feel would be an overkill for this prototype.
const PAGE_SIZE = 200;

export const useIngredients = () => {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown | null>(null);
  const debounceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  const fetchIngredients = useCallback(async (query: string) => {
    setLoading(true);
    setError(null);

    try {
      const params: IngredientsParams = {
        query: query,
        pageSize: PAGE_SIZE,
      };
      const response: IngredientsResponse = await ingredientService.getIngredients(params);
      response.ingredients.push({
        id: null,
        name: `Add "${query}" as an ingredient`,
      });
      setIngredients(response.ingredients);
    } catch (err: unknown) {
      setError(err);
      setIngredients([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setIngredients([]);
    setError(null);
  }, []);

  const searchIngredients = useCallback(
    (query: string) => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      if (!query.trim()) {
        reset();
        return;
      }
      debounceTimeoutRef.current = setTimeout(() => {
        fetchIngredients(query);
      }, DEBOUNCE_DELAY);
    },
    [fetchIngredients, reset]
  );

  return {
    ingredients,
    loading,
    error,
    searchIngredients,
    reset,
  };
};

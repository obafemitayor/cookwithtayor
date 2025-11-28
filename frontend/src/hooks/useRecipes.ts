import { useState, useCallback } from 'react';
import { recipeService } from '../services/recipeService';
import type { Recipe, RecipeFilters } from '../types';

export const useRecipes = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown | null>(null);

  const getMostRelevantRecipes = useCallback(async (userId: number, filters?: RecipeFilters) => {
    setLoading(true);
    setError(null);

    try {
      const recipesData = await recipeService.findMostRelevantRecipes(userId, filters);
      setRecipes(recipesData);
    } catch (err: unknown) {
      setError(err);
      setRecipes([]);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    recipes,
    loading,
    error,
    getMostRelevantRecipes,
  };
};

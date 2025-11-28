import { useState, useCallback } from 'react';
import { recipeService } from '../services/recipeService';
import type { RecipeDetails } from '../types';

export const useRecipeDetails = () => {
  const [recipe, setRecipe] = useState<RecipeDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown | null>(null);

  const getRecipeDetails = useCallback(async (userId: number, recipeId: number) => {
    setLoading(true);
    setError(null);

    try {
      const recipeData = await recipeService.getRecipeDetails(userId, recipeId);
      setRecipe(recipeData);
    } catch (err: unknown) {
      setError(err);
      setRecipe(null);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    recipe,
    loading,
    error,
    getRecipeDetails,
  };
};

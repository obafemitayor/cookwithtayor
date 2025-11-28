import { useState, useCallback } from 'react';
import { userIngredientService } from '../services/userIngredientService';
import type { UserIngredient, UpdateIngredientPayload } from '../types';

const DEFAULT_PAGE_SIZE = 10;

export const useUserIngredients = (userId: number | undefined) => {
  const [ingredients, setIngredients] = useState<UserIngredient[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [currentOffset, setCurrentOffset] = useState(0);

  const getUserIngredients = useCallback(
    async (offset: number = 0) => {
      if (!userId) {
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const response = await userIngredientService.getUserIngredients(userId, {
          pageSize: DEFAULT_PAGE_SIZE,
          offset,
        });
        setIngredients(response.ingredients);
        setHasMore(response.has_more);
        setCurrentOffset(response.offset);
      } catch (err: unknown) {
        setError(err);
      } finally {
        setLoading(false);
      }
    },
    [userId]
  );

  const loadNextPage = useCallback(async () => {
    if (!hasMore || loading) {
      return;
    }
    const nextOffset = currentOffset + DEFAULT_PAGE_SIZE;
    await getUserIngredients(nextOffset);
  }, [currentOffset, hasMore, loading, getUserIngredients]);

  const loadPreviousPage = useCallback(async () => {
    if (currentOffset === 0 || loading) {
      return;
    }
    const prevOffset = Math.max(0, currentOffset - DEFAULT_PAGE_SIZE);
    await getUserIngredients(prevOffset);
  }, [currentOffset, loading, getUserIngredients]);

  const updateIngredient = async (ingredientId: number, ingredient: UpdateIngredientPayload) => {
    if (!userId) {
      return;
    }
    setLoading(true);
    try {
      await userIngredientService.updateIngredient(userId, ingredientId, ingredient);
    } catch (err: unknown) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteIngredient = async (ingredientId: number) => {
    if (!userId) {
      return;
    }
    setLoading(true);
    try {
      await userIngredientService.removeIngredients(userId, [ingredientId]);
    } catch (err: unknown) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const addIngredients = async (ingredients: {
    ingredientsInDB: number[];
    ingredientsNotInDB: string[];
  }): Promise<void> => {
    if (!userId) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await userIngredientService.addIngredients(userId, ingredients);
    } catch (err: unknown) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    ingredients,
    loading,
    error,
    hasMore,
    hasPrevious: currentOffset > 0,
    getUserIngredients,
    loadNextPage,
    loadPreviousPage,
    updateIngredient,
    deleteIngredient,
    addIngredients,
  };
};

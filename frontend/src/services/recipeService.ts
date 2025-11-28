import api from './api';
import type { Recipe, RecipeDetails, RecipeFilters } from '../types';

interface RequestRecipeFilters {
  category_id?: number;
  cuisine_id?: number;
}

export const recipeService = {
  async findMostRelevantRecipes(userId: number, params?: RecipeFilters): Promise<Recipe[]> {
    const requestParams: RequestRecipeFilters = {};
    if (params?.categoryId) {
      requestParams.category_id = params.categoryId;
    }
    if (params?.cuisineId) {
      requestParams.cuisine_id = params.cuisineId;
    }
    const response = await api.get<{ recommendations: Recipe[] }>(
      `/users/${userId}/recipes/recommended-recipes`,
      { params: requestParams }
    );
    return response.data.recommendations;
  },

  async getRecipeDetails(userId: number, recipeId: number): Promise<RecipeDetails> {
    const response = await api.get<RecipeDetails>(
      `/users/${userId}/recipes/recommended-recipes/${recipeId}`
    );
    return response.data;
  },
};

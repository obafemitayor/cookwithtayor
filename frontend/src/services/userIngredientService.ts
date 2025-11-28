import api from './api';
import type { UserIngredientsResponse, UpdateIngredientPayload } from '../types';

export const userIngredientService = {
  async getUserIngredients(
    userId: number,
    params?: {
      pageSize?: number;
      offset?: number;
    }
  ): Promise<UserIngredientsResponse> {
    const response = await api.get<UserIngredientsResponse>(`/users/${userId}/ingredients`, {
      params,
    });
    return response.data;
  },

  async addIngredients(
    userId: number,
    ingredients: {
      ingredientsInDB: number[];
      ingredientsNotInDB: string[];
    }
  ): Promise<void> {
    await api.post(`/users/${userId}/ingredients`, ingredients);
  },

  async updateIngredient(
    userId: number,
    userIngredientId: number,
    ingredient: UpdateIngredientPayload
  ): Promise<void> {
    await api.put(`/users/${userId}/ingredients/${userIngredientId}`, {
      ingredient,
    });
  },

  async removeIngredients(userId: number, ingredientIds: number[]): Promise<void> {
    await api.delete(`/users/${userId}/ingredients`, {
      data: { ids: ingredientIds },
    });
  },
};

import api from './api';
import type { IngredientsResponse } from '../types';

export interface IngredientsParams {
  query: string;
  pageSize: number;
}

export const ingredientService = {
  async getIngredients(params: IngredientsParams): Promise<IngredientsResponse> {
    const response = await api.get<IngredientsResponse>('/ingredients', {
      params: {
        query: params.query,
        pageSize: params.pageSize,
      },
    });
    return response.data;
  },
};

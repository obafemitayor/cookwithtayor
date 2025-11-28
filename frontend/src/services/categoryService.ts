import api from './api';
import type { CategoriesResponse, CategoriesParams } from '../types';

export const categoryService = {
  async getCategories(params?: CategoriesParams): Promise<CategoriesResponse> {
    const response = await api.get<CategoriesResponse>('/categories', { params });
    return response.data;
  },
};

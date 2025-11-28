import api from './api';
import type { Cuisine } from '../types';

export interface CuisinesResponse {
  cuisines: Cuisine[];
}

export const cuisineService = {
  async getAllCuisines(): Promise<Cuisine[]> {
    const response = await api.get<CuisinesResponse>('/cuisines');
    return response.data.cuisines;
  },
};

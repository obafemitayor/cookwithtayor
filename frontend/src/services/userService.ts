import api from './api';
import type { User } from '../types';

export const userService = {
  async getUserByEmail(email: string): Promise<User> {
    const response = await api.get<User>('/users', {
      params: { email },
    });
    return response.data;
  },

  async createUser(
    email: string,
    ingredients: {
      ingredientsInDB: number[];
      ingredientsNotInDB: string[];
    }
  ): Promise<{ id: number }> {
    const response = await api.post<{ id: number }>('/users', {
      userEmail: email,
      ingredients,
    });
    return response.data;
  },
};

import { useState, useCallback } from 'react';
import { userService } from '../services/userService';
import type { User } from '../types';

export const useUser = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown | null>(null);

  const fetchUserByEmail = useCallback(async (email: string) => {
    setLoading(true);
    setError(null);

    try {
      const userData = await userService.getUserByEmail(email);
      setUser(userData);
      return userData;
    } catch (err: unknown) {
      setError(err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const createUser = async (
    email: string,
    ingredients: {
      ingredientsInDB: number[];
      ingredientsNotInDB: string[];
    }
  ): Promise<{ id: number }> => {
    setLoading(true);
    setError(null);
    try {
      const createdUser = await userService.createUser(email, ingredients);
      setUser({ id: createdUser.id, email });
      return createdUser;
    } catch (err: unknown) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    loading,
    error,
    fetchUserByEmail,
    createUser,
  };
};

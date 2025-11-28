import { USER_EMAIL_KEY } from './constants';

export const localStorageUtils = {
  getUserEmail: (): string | null => {
    return localStorage.getItem(USER_EMAIL_KEY);
  },

  setUserEmail: (email: string): void => {
    localStorage.setItem(USER_EMAIL_KEY, email);
  },
};

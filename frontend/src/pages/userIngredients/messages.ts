import { defineMessages } from 'react-intl';

export const messages = defineMessages({
  manageUserIngredients: {
    id: 'userIngredients.manageUserIngredients',
    defaultMessage: 'Ingredients You Have',
  },
  addIngredient: {
    id: 'userIngredients.addIngredient',
    defaultMessage: 'Add More Ingredients',
  },
  backToHome: {
    id: 'userIngredients.backToHome',
    defaultMessage: 'Back to Recipes',
  },
  previous: {
    id: 'userIngredients.previous',
    defaultMessage: 'Previous',
  },
  next: {
    id: 'userIngredients.next',
    defaultMessage: 'Next',
  },
  failedToLoadIngredients: {
    id: 'userIngredients.failedToLoadIngredients',
    defaultMessage: 'Failed to load ingredients. Please try again.',
  },
});

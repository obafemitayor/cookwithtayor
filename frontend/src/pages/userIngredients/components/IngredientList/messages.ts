import { defineMessages } from 'react-intl';

export const messages = defineMessages({
  noIngredients: {
    id: 'userIngredients.ingredientList.noIngredients',
    defaultMessage: 'No ingredients in your user ingredients. Add some ingredients to get started!',
  },
  ingredientName: {
    id: 'userIngredients.ingredientList.ingredientName',
    defaultMessage: 'Ingredient Name',
  },
  actions: {
    id: 'userIngredients.ingredientList.actions',
    defaultMessage: 'Actions',
  },
  editIngredient: {
    id: 'userIngredients.ingredientList.editIngredient',
    defaultMessage: 'Edit ingredient',
  },
  deleteIngredient: {
    id: 'userIngredients.ingredientList.deleteIngredient',
    defaultMessage: 'Delete ingredient',
  },
  confirmDelete: {
    id: 'userIngredients.ingredientList.confirmDelete',
    defaultMessage: 'Are you sure you want to remove this ingredient?',
  },
  failedToDelete: {
    id: 'userIngredients.ingredientList.failedToDelete',
    defaultMessage: 'Failed to delete ingredient',
  },
});

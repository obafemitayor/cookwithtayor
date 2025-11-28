import { defineMessages } from 'react-intl';

export const messages = defineMessages({
  back: {
    id: 'recipeDetails.back',
    defaultMessage: '← Back',
  },
  cook: {
    id: 'recipeDetails.cook',
    defaultMessage: 'Cooking Time',
  },
  noCookingRequired: {
    id: 'recipeDetails.noCookingRequired',
    defaultMessage: 'Does not require cooking',
  },
  prep: {
    id: 'recipeDetails.prep',
    defaultMessage: 'Preparation Time',
  },
  rating: {
    id: 'recipeDetails.rating',
    defaultMessage: 'Rating',
  },
  min: {
    id: 'recipeDetails.min',
    defaultMessage: 'min',
  },
  ingredients: {
    id: 'recipeDetails.ingredients',
    defaultMessage: 'Ingredients',
  },
  allIngredientsAvailable: {
    id: 'recipeDetails.allIngredientsAvailable',
    defaultMessage: "You're all set, you've got every ingredient you need for this recipe 👌",
  },
  closeToCooking: {
    id: 'recipeDetails.closeToCooking',
    defaultMessage: "You're really close!. You only need these ingredient(s) below to make it 🤏",
  },
  kitchenNotStocked: {
    id: 'recipeDetails.kitchenNotStocked',
    defaultMessage:
      "Your kitchen isn't stocked for this one yet. Here are the ingredient(s) you'd need:",
  },
  recipeNotFound: {
    id: 'recipeDetails.recipeNotFound',
    defaultMessage: 'Recipe not found',
  },
  goBack: {
    id: 'recipeDetails.goBack',
    defaultMessage: 'Go Back',
  },
  failedToLoadRecipe: {
    id: 'recipeDetails.failedToLoadRecipe',
    defaultMessage: 'Failed to load recipe. Please try again.',
  },
});

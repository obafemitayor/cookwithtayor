import { defineMessages } from 'react-intl';

export const messages = defineMessages({
  recommendedRecipes: {
    id: 'home.recommendedRecipes',
    defaultMessage:
      "Here's what you can cook now… and the ones you're just a few ingredients away from. 👌",
  },
  userNotFound: {
    id: 'home.userNotFound',
    defaultMessage: 'User not found',
  },
  cook: {
    id: 'home.cook',
    defaultMessage: 'Cooking Time',
  },
  noCookingRequired: {
    id: 'home.noCookingRequired',
    defaultMessage: 'Does not require cooking',
  },
  prep: {
    id: 'home.prep',
    defaultMessage: 'Preparation Time',
  },
  rating: {
    id: 'home.rating',
    defaultMessage: 'Rating',
  },
  min: {
    id: 'home.min',
    defaultMessage: 'min',
  },
  recipesNotFound: {
    id: 'home.recipesNotFound',
    defaultMessage: 'No recipes found',
  },
  canFullyCook: {
    id: 'home.canFullyCook',
    defaultMessage: "You're all set, you can cook this right now! 👌",
  },
  needFewIngredients: {
    id: 'home.needFewIngredients',
    defaultMessage:
      "You're super close to cooking this, you just need to grab {count} {count, plural, one {ingredient} other {ingredients}} 🤏",
  },
  needManyIngredients: {
    id: 'home.needManyIngredients',
    defaultMessage:
      'This one\'s a stretch, your pantry said "not today"😅. You\'re missing quite a few ingredients for this recipe.',
  },
  errorLoadingData: {
    id: 'home.errorLoadingData',
    defaultMessage:
      'Oops! Something went wrong while loading your recipes. Please try again later.',
  },
});

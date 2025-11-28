import { defineMessages } from 'react-intl';

export const messages = defineMessages({
  title: {
    id: 'userIngredients.title',
    defaultMessage: '⚠️ Before you add or update an ingredient…',
  },
  guideText: {
    id: 'userIngredients.guideText',
    defaultMessage: `A quick guide to help keep your ingredient list clean and clear:

• Check the suggestions first — only add something new if you don't see it listed.
• One ingredient per entry — salt, tomato sauce, pepper… not "salt and tomato sauce", "rice and beans".
• Use the singular form — tomato, not tomatoes, apple, not apples.
• Skip measurements — no "3 cups of rice" or "5 spoons of salt"; just the ingredient itself.
• Avoid duplicates — if you're adding multiple ingredients, don't create different versions of the same thing. Example, Tap water, bottled water, table water… they all count as water.

Thanks! This helps me understand your kitchen better — and cook up perfect recipes for you. 🍳😄`,
  },
  searchPlaceholder: {
    id: 'userIngredients.searchPlaceholder',
    defaultMessage: 'Search for an ingredient...',
  },
  removeIngredient: {
    id: 'userIngredients.removeIngredient',
    defaultMessage: 'Remove ingredient',
  },
  addAnotherIngredient: {
    id: 'userIngredients.addAnotherIngredient',
    defaultMessage: 'Add More',
  },
  addNonExistingIngredient: {
    id: 'userIngredients.addAsIngredient',
    defaultMessage: 'Add "{value}" as an ingredient',
  },
});

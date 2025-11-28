import type { Ingredient } from '../types';

export const parseValue = (name: string): string | null => {
  const match = name.match(/^Add "(.+)" as an ingredient$/);
  if (match && match[1]) {
    return match[1];
  }
  return null;
};

export const parseIngredient = (ingredient: Ingredient): Ingredient => {
  const parsedIngredientName = parseValue(ingredient.name);
  if (parsedIngredientName) {
    return { id: null, name: parsedIngredientName };
  }
  return ingredient;
};

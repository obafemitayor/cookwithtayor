import type { UserIngredientPickerInput, UserIngredientsPayload } from '../types';

export const buildUserIngredientsPayload = (
  userIngredients: UserIngredientPickerInput[]
): UserIngredientsPayload => {
  return userIngredients.reduce(
    (acc, input) => {
      if (!input.selectedIngredient) {
        return acc;
      }
      const ingredientId = input.selectedIngredient.id;
      if (!ingredientId) {
        acc.ingredientsNotInDB.push(input.selectedIngredient.name);
        return acc;
      }
      acc.ingredientsInDB.push(ingredientId as number);
      return acc;
    },
    { ingredientsInDB: [] as number[], ingredientsNotInDB: [] as string[] }
  );
};

export interface User {
  id: number;
  email: string;
}

export interface Ingredient {
  id: number | null;
  name: string;
}

export interface IngredientsResponse {
  ingredients: Ingredient[];
  total: number;
  offset: number;
  limit: number;
  has_more: boolean;
}

export interface Recipe {
  id: number;
  name: string;
  image_url: string;
  category_id: number | null;
  cuisine_id: number | null;
  cook_time: number | null;
  prep_time: number | null;
  ratings: string | null;
  total_ingredients_needed_for_recipe: number;
  total_ingredients_user_has_for_recipe: number;
  total_ingredients_missing_for_recipe: number;
}

export interface RecipeDetails extends Recipe {
  ingredients: string[];
  missing_ingredients: string[];
}

export interface Category {
  id: number;
  name: string;
}

export interface CategoriesResponse {
  categories: Category[];
  total: number;
  offset: number;
  limit: number;
  has_more: boolean;
}

export interface CategoriesParams {
  query?: string;
  pageSize?: number;
  offset?: number;
}

export interface Cuisine {
  id: number;
  name: string;
}

export interface UserIngredient {
  id: number;
  ingredient_id: number;
  ingredient?: Ingredient;
}

export interface UserIngredientsResponse {
  ingredients: UserIngredient[];
  total: number;
  offset: number;
  limit: number;
  has_more: boolean;
}

export interface UserIngredientPickerInput {
  id: string;
  selectedIngredient: Ingredient | null;
}

export interface UserIngredientsPayload {
  ingredientsInDB: number[];
  ingredientsNotInDB: string[];
}

export interface RecipeFilters {
  categoryId?: number;
  cuisineId?: number;
}

export interface UpdateIngredientPayload {
  id: number | null;
  name: string;
}

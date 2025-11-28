require 'rails_helper'

RSpec.describe "Recipes API", type: :request do
  describe "GET /users/:user_id/recipes/recommended-recipes/:recipeId" do
    let(:user) { User.create!(email: "user@example.com") }
    let(:category) { Category.create!(name: "Dessert") }
    let(:cuisine) { Cuisine.create!(name: "Italian") }
    let(:salt) { Ingredient.create!(name: "salt") }
    let(:pepper) { Ingredient.create!(name: "pepper") }
    let(:recipe) do
      Recipe.create!(
        name: "Test Recipe",
        category: category,
        cuisine: cuisine,
        cook_time: 30,
        prep_time: 15,
        ratings: 4.5,
        image_url: "https://example.com/image.jpg"
      )
    end

    before do
      RecipeIngredient.create!(
        recipe: recipe,
        ingredient: salt,
        canonical_name: "salt"
      )
      RecipeIngredient.create!(
        recipe: recipe,
        ingredient: pepper,
        canonical_name: "pepper"
      )
    end

    it "returns 404 when user does not exist" do
      get "/users/99999/recipes/recommended-recipes/#{recipe.id}"

      expect(response).to have_http_status(:not_found)
      expect(json_response["error"]).to eq("User not found")
    end

    it "returns 404 when recipe does not exist" do
      get "/users/#{user.id}/recipes/recommended-recipes/99999"

      expect(response).to have_http_status(:not_found)
      expect(json_response["error"]).to eq("Recipe not found")
    end

    it "returns 404 when recipe id is invalid" do
      get "/users/#{user.id}/recipes/recommended-recipes/invalid_id"

      expect(response).to have_http_status(:not_found)
      expect(json_response["error"]).to eq("Recipe not found")
    end

    it "returns recipe successfully when recipe exists" do
      get "/users/#{user.id}/recipes/recommended-recipes/#{recipe.id}"

      expect(response).to have_http_status(:ok)
      expect(json_response["id"]).to eq(recipe.id)
      expect(json_response["name"]).to eq("Test Recipe")
      expect(json_response["image_url"]).to eq("https://example.com/image.jpg")
      expect(json_response["category_id"]).to eq(category.id)
      expect(json_response["cuisine_id"]).to eq(cuisine.id)
      expect(json_response["cook_time"]).to eq(30)
      expect(json_response["prep_time"]).to eq(15)
      expect(json_response["ratings"]).to eq("4.5")
      expect(json_response["ingredients"]).to contain_exactly("salt", "pepper")
      expect(json_response["missing_ingredients"]).to contain_exactly("salt", "pepper")
    end
  end

  describe "GET /users/:user_id/recipes/recommended-recipes" do
    let(:user) { User.create!(email: "user@example.com") }

    it "returns 404 when user does not exist" do
      get "/users/99999/recipes/recommended-recipes", headers: { "Accept" => "application/json" }

      expect(response).to have_http_status(:not_found)
      expect(json_response["error"]).to eq("User not found")
    end

    [
      {
        param_name: "category_id",
        invalid_value: "not an integer",
        description: "when category_id is not an integer"
      },
      {
        param_name: "category_id",
        invalid_value: 0,
        description: "when category_id is less than or equal to 0"
      },
      {
        param_name: "cuisine_id",
        invalid_value: "not an integer",
        description: "when cuisine_id is not an integer"
      },
      {
        param_name: "cuisine_id",
        invalid_value: -1,
        description: "when cuisine_id is less than or equal to 0"
      }
    ].each do |test_case|
      it "returns 400 #{test_case[:description]}" do
        params_hash = { test_case[:param_name].to_sym => test_case[:invalid_value] }
        get "/users/#{user.id}/recipes/recommended-recipes", params: params_hash, headers: { "Accept" => "application/json" }

        expect(response).to have_http_status(:bad_request)
        expect(json_response["errors"]).to have_key(test_case[:param_name])
      end
    end

    it "returns recommendations when there are ingredients in users pantry that can completely make some recipes in the database" do
      # Create user with ingredients in pantry
      salt = Ingredient.create!(name: "salt")
      pepper = Ingredient.create!(name: "pepper")
      flour = Ingredient.create!(name: "flour")
      egg = Ingredient.create!(name: "egg")

      UserIngredient.create!(user: user, ingredient: salt)
      UserIngredient.create!(user: user, ingredient: pepper)
      UserIngredient.create!(user: user, ingredient: flour)
      UserIngredient.create!(user: user, ingredient: egg)

      # Recipe 1: User has all ingredients (salt, pepper) - 0 missing
      recipe1 = Recipe.create!(name: "Recipe 1 - All Ingredients")
      RecipeIngredient.create!(recipe: recipe1, ingredient: salt, canonical_name: "salt")
      RecipeIngredient.create!(recipe: recipe1, ingredient: pepper, canonical_name: "pepper")

      # Recipe 2: User has all ingredients (salt, pepper, flour) - 0 missing
      recipe2 = Recipe.create!(name: "Recipe 2 - All Ingredients")
      RecipeIngredient.create!(recipe: recipe2, ingredient: salt, canonical_name: "salt")
      RecipeIngredient.create!(recipe: recipe2, ingredient: pepper, canonical_name: "pepper")
      RecipeIngredient.create!(recipe: recipe2, ingredient: flour, canonical_name: "flour")

      # Recipe 3: User missing 1 ingredient (butter) - 1 missing
      butter = Ingredient.create!(name: "butter")
      recipe3 = Recipe.create!(name: "Recipe 3 - Missing One")
      RecipeIngredient.create!(recipe: recipe3, ingredient: salt, canonical_name: "salt")
      RecipeIngredient.create!(recipe: recipe3, ingredient: pepper, canonical_name: "pepper")
      RecipeIngredient.create!(recipe: recipe3, ingredient: flour, canonical_name: "flour")
      RecipeIngredient.create!(recipe: recipe3, ingredient: butter, canonical_name: "butter")

      # Recipe 4: User missing 2 ingredients (tomato, onion) - 2 missing
      tomato = Ingredient.create!(name: "tomato")
      onion = Ingredient.create!(name: "onion")
      recipe4 = Recipe.create!(name: "Recipe 4 - Missing Two")
      RecipeIngredient.create!(recipe: recipe4, ingredient: salt, canonical_name: "salt")
      RecipeIngredient.create!(recipe: recipe4, ingredient: pepper, canonical_name: "pepper")
      RecipeIngredient.create!(recipe: recipe4, ingredient: tomato, canonical_name: "tomato")
      RecipeIngredient.create!(recipe: recipe4, ingredient: onion, canonical_name: "onion")

      get "/users/#{user.id}/recipes/recommended-recipes", headers: { "Accept" => "application/json" }

      expect(response).to have_http_status(:ok)
      recommendations = json_response["recommendations"]

      most_relevant_recipes = recommendations.map { |r| r["id"] }

      # When both have 0 missing, recipe2 (3 ingredients) comes before recipe1 (2 ingredients)
      # because total_ingredients_user_has_for_recipe DESC prioritizes recipes with more user ingredients
      expect(most_relevant_recipes[0]).to eq(recipe2.id)
      expect(most_relevant_recipes[1]).to eq(recipe1.id)
      expect(most_relevant_recipes[2]).to eq(recipe3.id)
      expect(most_relevant_recipes[3]).to eq(recipe4.id)
    end

    it "returns recommendations when there are ingredients in users pantry that can partially make some recipes in the database" do
      # Create user with some ingredients in pantry
      salt = Ingredient.create!(name: "salt")
      pepper = Ingredient.create!(name: "pepper")
      flour = Ingredient.create!(name: "flour")
      egg = Ingredient.create!(name: "egg")

      UserIngredient.create!(user: user, ingredient: salt)
      UserIngredient.create!(user: user, ingredient: pepper)
      UserIngredient.create!(user: user, ingredient: flour)
      UserIngredient.create!(user: user, ingredient: egg)

      # Recipe 1: User has 4 out of 6 ingredients (missing 2)
      butter = Ingredient.create!(name: "butter")
      sugar = Ingredient.create!(name: "sugar")
      recipe1 = Recipe.create!(name: "Recipe 1 - Missing 2")
      RecipeIngredient.create!(recipe: recipe1, ingredient: salt, canonical_name: "salt")
      RecipeIngredient.create!(recipe: recipe1, ingredient: pepper, canonical_name: "pepper")
      RecipeIngredient.create!(recipe: recipe1, ingredient: flour, canonical_name: "flour")
      RecipeIngredient.create!(recipe: recipe1, ingredient: egg, canonical_name: "egg")
      RecipeIngredient.create!(recipe: recipe1, ingredient: butter, canonical_name: "butter")
      RecipeIngredient.create!(recipe: recipe1, ingredient: sugar, canonical_name: "sugar")

      # Recipe 2: User has 3 out of 5 ingredients (missing 2)
      tomato = Ingredient.create!(name: "tomato")
      recipe2 = Recipe.create!(name: "Recipe 2 - Missing 2")
      RecipeIngredient.create!(recipe: recipe2, ingredient: salt, canonical_name: "salt")
      RecipeIngredient.create!(recipe: recipe2, ingredient: pepper, canonical_name: "pepper")
      RecipeIngredient.create!(recipe: recipe2, ingredient: flour, canonical_name: "flour")
      RecipeIngredient.create!(recipe: recipe2, ingredient: tomato, canonical_name: "tomato")
      RecipeIngredient.create!(recipe: recipe2, ingredient: butter, canonical_name: "butter")

      # Recipe 3: User has 4 out of 7 ingredients (missing 3)
      onion = Ingredient.create!(name: "onion")
      garlic = Ingredient.create!(name: "garlic")
      recipe3 = Recipe.create!(name: "Recipe 3 - Missing 3")
      RecipeIngredient.create!(recipe: recipe3, ingredient: salt, canonical_name: "salt")
      RecipeIngredient.create!(recipe: recipe3, ingredient: pepper, canonical_name: "pepper")
      RecipeIngredient.create!(recipe: recipe3, ingredient: flour, canonical_name: "flour")
      RecipeIngredient.create!(recipe: recipe3, ingredient: egg, canonical_name: "egg")
      RecipeIngredient.create!(recipe: recipe3, ingredient: onion, canonical_name: "onion")
      RecipeIngredient.create!(recipe: recipe3, ingredient: garlic, canonical_name: "garlic")
      RecipeIngredient.create!(recipe: recipe3, ingredient: butter, canonical_name: "butter")

      # Recipe 4: User has 2 out of 6 ingredients (missing 4)
      recipe4 = Recipe.create!(name: "Recipe 4 - Missing 4")
      RecipeIngredient.create!(recipe: recipe4, ingredient: salt, canonical_name: "salt")
      RecipeIngredient.create!(recipe: recipe4, ingredient: pepper, canonical_name: "pepper")
      RecipeIngredient.create!(recipe: recipe4, ingredient: tomato, canonical_name: "tomato")
      RecipeIngredient.create!(recipe: recipe4, ingredient: onion, canonical_name: "onion")
      RecipeIngredient.create!(recipe: recipe4, ingredient: garlic, canonical_name: "garlic")
      RecipeIngredient.create!(recipe: recipe4, ingredient: butter, canonical_name: "butter")

      get "/users/#{user.id}/recipes/recommended-recipes", headers: { "Accept" => "application/json" }

      expect(response).to have_http_status(:ok)
      recommendations = json_response["recommendations"]

      most_relevant_recipes = recommendations.map { |r| r["id"] }

      # Recipe 1 (missing 2, has 4/6) should come before Recipe 2 (missing 2, has 3/5)
      expect(most_relevant_recipes[0]).to eq(recipe1.id)
      expect(most_relevant_recipes[1]).to eq(recipe2.id)
      expect(most_relevant_recipes[2]).to eq(recipe3.id)
      expect(most_relevant_recipes[3]).to eq(recipe4.id)
    end

    it "returns no recommendations when there are no ingredients in users pantry that can make any recipes in the database" do
      # Create user with ingredients that don't match any recipe
      chocolate = Ingredient.create!(name: "chocolate")
      vanilla = Ingredient.create!(name: "vanilla")

      UserIngredient.create!(user: user, ingredient: chocolate)
      UserIngredient.create!(user: user, ingredient: vanilla)

      # Create recipes with completely different ingredients
      salt = Ingredient.create!(name: "salt")
      pepper = Ingredient.create!(name: "pepper")
      flour = Ingredient.create!(name: "flour")

      recipe1 = Recipe.create!(name: "Recipe 1")
      RecipeIngredient.create!(recipe: recipe1, ingredient: salt, canonical_name: "salt")
      RecipeIngredient.create!(recipe: recipe1, ingredient: pepper, canonical_name: "pepper")

      recipe2 = Recipe.create!(name: "Recipe 2")
      RecipeIngredient.create!(recipe: recipe2, ingredient: flour, canonical_name: "flour")
      RecipeIngredient.create!(recipe: recipe2, ingredient: salt, canonical_name: "salt")

      get "/users/#{user.id}/recipes/recommended-recipes", headers: { "Accept" => "application/json" }

      expect(response).to have_http_status(:ok)
      recommendations = json_response["recommendations"]

      expect(recommendations).to be_empty
    end

    it "returns recommendations when user has multiple pantry entries mapping to the same ingredient" do
      # Create a single ingredient (water)
      water = Ingredient.create!(name: "water")

      # User has multiple pantry entries with different names but all map to the same ingredient
      UserIngredient.create!(user: user, ingredient: water)
      UserIngredient.create!(user: user, ingredient: water)
      UserIngredient.create!(user: user, ingredient: water)

      # Create a recipe that needs water
      salt = Ingredient.create!(name: "salt")
      recipe = Recipe.create!(name: "Recipe with Water")
      RecipeIngredient.create!(recipe: recipe, ingredient: water, canonical_name: "water")
      RecipeIngredient.create!(recipe: recipe, ingredient: salt, canonical_name: "salt")

      get "/users/#{user.id}/recipes/recommended-recipes", headers: { "Accept" => "application/json" }

      expect(response).to have_http_status(:ok)
      recommendations = json_response["recommendations"]

      expect(recommendations).not_to be_empty
      expect(recommendations.first["id"]).to eq(recipe.id)
    end

    it "filters recommendations by category_id" do
      # Create categories
      dessert_category = Category.create!(name: "Dessert")
      main_category = Category.create!(name: "Main Course")

      # Create user with ingredients
      salt = Ingredient.create!(name: "salt")
      sugar = Ingredient.create!(name: "sugar")
      flour = Ingredient.create!(name: "flour")

      UserIngredient.create!(user: user, ingredient: salt)
      UserIngredient.create!(user: user, ingredient: sugar)
      UserIngredient.create!(user: user, ingredient: flour)

      # Create recipes in different categories
      dessert_recipe = Recipe.create!(name: "Dessert Recipe", category: dessert_category)
      RecipeIngredient.create!(recipe: dessert_recipe, ingredient: sugar, canonical_name: "sugar")
      RecipeIngredient.create!(recipe: dessert_recipe, ingredient: flour, canonical_name: "flour")

      main_recipe = Recipe.create!(name: "Main Recipe", category: main_category)
      RecipeIngredient.create!(recipe: main_recipe, ingredient: salt, canonical_name: "salt")
      RecipeIngredient.create!(recipe: main_recipe, ingredient: flour, canonical_name: "flour")

      get "/users/#{user.id}/recipes/recommended-recipes", params: { category_id: dessert_category.id }, headers: { "Accept" => "application/json" }

      expect(response).to have_http_status(:ok)
      recommendations = json_response["recommendations"]

      expect(recommendations.length).to eq(1)
      expect(recommendations.first["id"]).to eq(dessert_recipe.id)
      expect(recommendations.first["category_id"]).to eq(dessert_category.id)
    end

    it "filters recommendations by cuisine_id" do
      # Create cuisines
      italian_cuisine = Cuisine.create!(name: "Italian")
      chinese_cuisine = Cuisine.create!(name: "Chinese")

      # Create user with ingredients
      salt = Ingredient.create!(name: "salt")
      pepper = Ingredient.create!(name: "pepper")
      flour = Ingredient.create!(name: "flour")

      UserIngredient.create!(user: user, ingredient: salt)
      UserIngredient.create!(user: user, ingredient: pepper)
      UserIngredient.create!(user: user, ingredient: flour)

      # Create recipes in different cuisines
      italian_recipe = Recipe.create!(name: "Italian Recipe", cuisine: italian_cuisine)
      RecipeIngredient.create!(recipe: italian_recipe, ingredient: salt, canonical_name: "salt")
      RecipeIngredient.create!(recipe: italian_recipe, ingredient: pepper, canonical_name: "pepper")

      chinese_recipe = Recipe.create!(name: "Chinese Recipe", cuisine: chinese_cuisine)
      RecipeIngredient.create!(recipe: chinese_recipe, ingredient: salt, canonical_name: "salt")
      RecipeIngredient.create!(recipe: chinese_recipe, ingredient: flour, canonical_name: "flour")

      get "/users/#{user.id}/recipes/recommended-recipes", params: { cuisine_id: italian_cuisine.id }, headers: { "Accept" => "application/json" }

      expect(response).to have_http_status(:ok)
      recommendations = json_response["recommendations"]

      expect(recommendations.length).to eq(1)
      expect(recommendations.first["id"]).to eq(italian_recipe.id)
      expect(recommendations.first["cuisine_id"]).to eq(italian_cuisine.id)
    end

    it "filters recommendations by both category_id and cuisine_id" do
      # Create categories and cuisines
      dessert_category = Category.create!(name: "Dessert")
      main_category = Category.create!(name: "Main Course")
      italian_cuisine = Cuisine.create!(name: "Italian")
      chinese_cuisine = Cuisine.create!(name: "Chinese")

      # Create user with ingredients
      salt = Ingredient.create!(name: "salt")
      sugar = Ingredient.create!(name: "sugar")
      flour = Ingredient.create!(name: "flour")

      UserIngredient.create!(user: user, ingredient: salt)
      UserIngredient.create!(user: user, ingredient: sugar)
      UserIngredient.create!(user: user, ingredient: flour)

      # Create recipes with different combinations
      dessert_italian_recipe = Recipe.create!(name: "Dessert Italian", category: dessert_category, cuisine: italian_cuisine)
      RecipeIngredient.create!(recipe: dessert_italian_recipe, ingredient: sugar, canonical_name: "sugar")
      RecipeIngredient.create!(recipe: dessert_italian_recipe, ingredient: flour, canonical_name: "flour")

      dessert_chinese_recipe = Recipe.create!(name: "Dessert Chinese", category: dessert_category, cuisine: chinese_cuisine)
      RecipeIngredient.create!(recipe: dessert_chinese_recipe, ingredient: sugar, canonical_name: "sugar")
      RecipeIngredient.create!(recipe: dessert_chinese_recipe, ingredient: flour, canonical_name: "flour")

      main_italian_recipe = Recipe.create!(name: "Main Italian", category: main_category, cuisine: italian_cuisine)
      RecipeIngredient.create!(recipe: main_italian_recipe, ingredient: salt, canonical_name: "salt")
      RecipeIngredient.create!(recipe: main_italian_recipe, ingredient: flour, canonical_name: "flour")

      get "/users/#{user.id}/recipes/recommended-recipes", params: { category_id: dessert_category.id, cuisine_id: italian_cuisine.id }, headers: { "Accept" => "application/json" }

      expect(response).to have_http_status(:ok)
      recommendations = json_response["recommendations"]

      expect(recommendations.length).to eq(1)
      expect(recommendations.first["id"]).to eq(dessert_italian_recipe.id)
      expect(recommendations.first["category_id"]).to eq(dessert_category.id)
      expect(recommendations.first["cuisine_id"]).to eq(italian_cuisine.id)
    end
  end
end

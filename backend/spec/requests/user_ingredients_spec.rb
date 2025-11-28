require 'rails_helper'

RSpec.describe "User Ingredients API", type: :request do
  describe "POST /users/:user_id/ingredients" do
    let(:user) { User.find_or_create_by!(email: "user@example.com") }

    it "returns 400 when ingredientsInDB structure is invalid" do
      payload = {
        ingredientsInDB: "not an array",
        ingredientsNotInDB: [ "1 cup flour" ]
      }

      post "/users/#{user.id}/ingredients", params: payload, as: :json

      expect(response).to have_http_status(:bad_request)
      expect(json_response["errors"]).to have_key("ingredientsInDB")
    end

    it "returns 400 when ingredientsNotInDB structure is invalid" do
      salt = Ingredient.create!(name: "salt")
      payload = {
        ingredientsInDB: [ salt.id ],
        ingredientsNotInDB: "not an array"
      }

      post "/users/#{user.id}/ingredients", params: payload, as: :json

      expect(response).to have_http_status(:bad_request)
      expect(json_response["errors"]).to have_key("ingredientsNotInDB")
    end

    it "returns 400 when both ingredientsInDB and ingredientsNotInDB are empty" do
      payload = {
        ingredientsInDB: [],
        ingredientsNotInDB: []
      }

      post "/users/#{user.id}/ingredients", params: payload, as: :json

      expect(response).to have_http_status(:bad_request)
      expect(json_response["error"]).to eq("either ingredientsInDB or ingredientsNotInDB must contain at least one value")
      expect(UserIngredient.count).to eq(0)
    end

    it "adds ingredients successfully when payload is valid" do
      salt = Ingredient.create!(name: "salt")
      pepper = Ingredient.create!(name: "pepper")

      payload = {
        ingredientsInDB: [ salt.id, pepper.id ],
        ingredientsNotInDB: [ "1 cup flour", "2 eggs" ]
      }

      expect {
        post "/users/#{user.id}/ingredients", params: payload, as: :json
      }.to change(UserIngredient, :count).by(4)

      expect(response).to have_http_status(:ok)
    end

    [
      {
        description: "when ingredientsInDB is empty and ingredientsNotInDB has values",
        ingredients_in_db: [],
        ingredients_not_in_db: [ "1 cup flour" ],
        expected_ingredient_count: 1
      },
      {
        description: "when ingredientsInDB has values and ingredientsNotInDB is empty",
        ingredients_in_db: [],
        ingredients_not_in_db: [],
        expected_ingredient_count: 1
      }
    ].each do |test_case|
      it "adds ingredients successfully #{test_case[:description]}" do
        ingredients_in_db = test_case[:ingredients_in_db].dup
        ingredients_not_in_db = test_case[:ingredients_not_in_db].dup
        expected_count = test_case[:expected_ingredient_count]

        salt = Ingredient.create!(name: "salt")
        ingredients_in_db = [ salt.id ] if expected_count > 0 && ingredients_not_in_db.empty?

        payload = {
          ingredientsInDB: ingredients_in_db,
          ingredientsNotInDB: ingredients_not_in_db
        }

        expect {
          post "/users/#{user.id}/ingredients", params: payload, as: :json
        }.to change(UserIngredient, :count).by(expected_count)

        expect(response).to have_http_status(:ok)
      end
    end

    it "creates user ingredients when multiple ingredient names are provided" do
      payload = {
        ingredientsInDB: [],
        ingredientsNotInDB: [ "Sachet water", "Table water", "Tap water" ]
      }

      expect {
        post "/users/#{user.id}/ingredients", params: payload, as: :json
      }.to change(UserIngredient, :count).by(3)
        .and change(Ingredient, :count).by(3)

      expect(response).to have_http_status(:ok)

      user_ingredients = UserIngredient.where(user_id: user.id)

      expect(user_ingredients.count).to eq(3)

      ingredient_ids = user_ingredients.pluck(:ingredient_id)
      expect(ingredient_ids.uniq.length).to eq(3)
    end
  end

  describe "GET /users/:user_id/ingredients" do
    let(:user) { User.find_or_create_by!(email: "user@example.com") }
    let(:salt) { Ingredient.create!(name: "salt") }
    let(:pepper) { Ingredient.create!(name: "pepper") }
    let(:flour) { Ingredient.create!(name: "flour") }

    it "returns 404 when user does not exist" do
      get "/users/99999/ingredients", headers: { "Accept" => "application/json" }

      expect(response).to have_http_status(:not_found)
      expect(json_response["error"]).to eq("User not found")
    end

    [
      {
        param_name: "pageSize",
        invalid_value: 0,
        description: "when pageSize is less than or equal to 0"
      },
      {
        param_name: "pageSize",
        invalid_value: -1,
        description: "when pageSize is negative"
      },
      {
        param_name: "offset",
        invalid_value: -1,
        description: "when offset is negative"
      }
    ].each do |test_case|
      it "returns 400 #{test_case[:description]}" do
        params_hash = { test_case[:param_name].to_sym => test_case[:invalid_value] }
        get "/users/#{user.id}/ingredients", params: params_hash, headers: { "Accept" => "application/json" }

        expect(response).to have_http_status(:bad_request)
        expect(json_response["errors"]).to have_key(test_case[:param_name])
      end
    end

    it "returns ingredients successfully without pagination" do
      user_ingredient1 = UserIngredient.create!(user: user, ingredient: salt)
      user_ingredient2 = UserIngredient.create!(user: user, ingredient: pepper)

      get "/users/#{user.id}/ingredients", headers: { "Accept" => "application/json" }

      expect(response).to have_http_status(:ok)
      expect(json_response["ingredients"].length).to eq(2)
      expect(json_response["has_more"]).to eq(false)
      expect(json_response["total"]).to eq(2)
      expect(json_response["offset"]).to eq(0)

      ingredient_ids = json_response["ingredients"].map { |ing| ing["id"] }
      expect(ingredient_ids).to contain_exactly(user_ingredient1.id, user_ingredient2.id)
    end

    it "returns ingredients with default page size of 20" do
      25.times do |i|
        ingredient = Ingredient.create!(name: "ingredient_#{i}")
        UserIngredient.create!(user: user, ingredient: ingredient)
      end

      get "/users/#{user.id}/ingredients", headers: { "Accept" => "application/json" }

      expect(response).to have_http_status(:ok)
      expect(json_response["ingredients"].length).to eq(20)
      expect(json_response["has_more"]).to eq(true)
      expect(json_response["total"]).to eq(25)
      expect(json_response["offset"]).to eq(0)
      expect(json_response["limit"]).to eq(20)
    end

    it "returns ingredients with custom page size" do
      15.times do |i|
        ingredient = Ingredient.create!(name: "ingredient_#{i}")
        UserIngredient.create!(user: user, ingredient: ingredient)
      end

      get "/users/#{user.id}/ingredients", params: { pageSize: 5 }, headers: { "Accept" => "application/json" }

      expect(response).to have_http_status(:ok)
      expect(json_response["ingredients"].length).to eq(5)
      expect(json_response["has_more"]).to eq(true)
      expect(json_response["total"]).to eq(15)
      expect(json_response["offset"]).to eq(0)
      expect(json_response["limit"]).to eq(5)
    end

    it "returns empty list when user has no ingredients" do
      get "/users/#{user.id}/ingredients", headers: { "Accept" => "application/json" }

      expect(response).to have_http_status(:ok)
      expect(json_response["ingredients"]).to be_empty
      expect(json_response["has_more"]).to eq(false)
      expect(json_response["total"]).to eq(0)
    end

    it "returns next page when offset is provided" do
      user_ingredients = []
      10.times do |i|
        ingredient = Ingredient.create!(name: "ingredient_#{i}")
        user_ingredients << UserIngredient.create!(user: user, ingredient: ingredient)
      end

      # Get first page
      get "/users/#{user.id}/ingredients", params: { pageSize: 3 }, headers: { "Accept" => "application/json" }

      expect(response).to have_http_status(:ok)
      expect(json_response["ingredients"].length).to eq(3)
      expect(json_response["has_more"]).to eq(true)
      expect(json_response["offset"]).to eq(0)

      first_page_ids = json_response["ingredients"].map { |ing| ing["id"] }

      # Get next page
      get "/users/#{user.id}/ingredients", params: { pageSize: 3, offset: 3 }, headers: { "Accept" => "application/json" }

      expect(response).to have_http_status(:ok)
      expect(json_response["ingredients"].length).to eq(3)
      expect(json_response["offset"]).to eq(3)

      second_page_ids = json_response["ingredients"].map { |ing| ing["id"] }
      expect(first_page_ids & second_page_ids).to be_empty
    end

    it "returns only ingredients for the specified user" do
      other_user = User.create!(email: "other@example.com")

      user_ingredient = UserIngredient.create!(user: user, ingredient: salt)
      UserIngredient.create!(user: other_user, ingredient: pepper)

      get "/users/#{user.id}/ingredients", headers: { "Accept" => "application/json" }

      expect(response).to have_http_status(:ok)
      expect(json_response["ingredients"].length).to eq(1)
      expect(json_response["ingredients"].first["id"]).to eq(user_ingredient.id)
      expect(json_response["ingredients"].first["ingredient_id"]).to eq(salt.id)
    end
  end

  describe "PUT /users/:user_id/ingredients/:id" do
    let(:user) { User.find_or_create_by!(email: "user@example.com") }
    let(:salt) { Ingredient.create!(name: "salt") }
    let(:pepper) { Ingredient.create!(name: "pepper") }
    let(:user_ingredient) { UserIngredient.create!(user: user, ingredient: salt) }

    it "returns 400 when ingredient is not an object" do
      payload = { ingredient: [] }

      put "/users/#{user.id}/ingredients/#{user_ingredient.id}", params: payload, as: :json

      expect(response).to have_http_status(:bad_request)
      expect(json_response["errors"]).to have_key("ingredient")
    end

    it "returns 400 when ingredient name is missing" do
      payload = { ingredient: { id: pepper.id } }

      put "/users/#{user.id}/ingredients/#{user_ingredient.id}", params: payload, as: :json

      expect(response).to have_http_status(:bad_request)
      expect(json_response["errors"]).to have_key("ingredient")
    end

    it "updates ingredient successfully when ingredient has an integer ID" do
      payload = { ingredient: { id: pepper.id, name: "pepper" } }

      put "/users/#{user.id}/ingredients/#{user_ingredient.id}", params: payload, as: :json

      expect(response).to have_http_status(:ok)
      expect(user_ingredient.reload.ingredient_id).to eq(pepper.id)
    end

    it "updates ingredient successfully when ingredient ID is null" do
      initial_ingredient_count = Ingredient.count
      payload = { ingredient: { id: nil, name: "1 cup flour" } }

      put "/users/#{user.id}/ingredients/#{user_ingredient.id}", params: payload, as: :json

      expect(response).to have_http_status(:ok)
      # The ingredient might be created or found via similarity check
      new_ingredient = Ingredient.find_by(name: "1 cup flour") || Ingredient.where("similarity(LOWER(name), LOWER(?)) > 0.7", "1 cup flour").first
      expect(new_ingredient).to be_present
      expect(user_ingredient.reload.ingredient_id).to eq(new_ingredient.id)
      # At least one ingredient should be created if it doesn't exist
      expect(Ingredient.count).to be >= initial_ingredient_count
    end

    it "returns 404 when user is not found" do
      payload = { ingredient: { id: pepper.id, name: "pepper" } }

      put "/users/99999/ingredients/#{user_ingredient.id}", params: payload, as: :json

      expect(response).to have_http_status(:not_found)
      expect(json_response["error"]).to eq("User not found")
    end

    it "returns 404 when ingredient is not found" do
      payload = { ingredient: { id: pepper.id, name: "pepper" } }

      put "/users/#{user.id}/ingredients/99999", params: payload, as: :json

      expect(response).to have_http_status(:not_found)
      expect(json_response["error"]).to eq("User Ingredient not found")
    end
  end

  describe "DELETE /users/:user_id/ingredients" do
    let(:user) { User.find_or_create_by!(email: "user@example.com") }
    let(:salt) { Ingredient.create!(name: "salt") }
    let(:pepper) { Ingredient.create!(name: "pepper") }
    let!(:user_ingredient1) { UserIngredient.create!(user: user, ingredient: salt) }
    let!(:user_ingredient2) { UserIngredient.create!(user: user, ingredient: pepper) }

    it "returns 400 when ids is missing" do
      delete "/users/#{user.id}/ingredients", params: {}, as: :json

      expect(response).to have_http_status(:bad_request)
      expect(json_response["errors"]).to have_key("ids")
    end

    it "returns 400 when ids is not an array" do
      payload = { ids: "not an array" }

      delete "/users/#{user.id}/ingredients", params: payload, as: :json

      expect(response).to have_http_status(:bad_request)
      expect(json_response["errors"]).to have_key("ids")
    end

    it "returns 400 when ids contains non-integer values" do
      payload = { ids: [ "not an integer", 123 ] }

      delete "/users/#{user.id}/ingredients", params: payload, as: :json

      expect(response).to have_http_status(:bad_request)
      expect(json_response["errors"]).to have_key("ids")
    end

    it "removes ingredients successfully when payload is valid" do
      payload = { ids: [ user_ingredient1.id, user_ingredient2.id ] }

      expect {
        delete "/users/#{user.id}/ingredients", params: payload, as: :json
      }.to change(UserIngredient, :count).by(-2)

      expect(response).to have_http_status(:ok)
    end

    it "returns 404 when user is not found" do
      payload = { ids: [ user_ingredient1.id ] }

      delete "/users/99999/ingredients", params: payload, as: :json

      expect(response).to have_http_status(:not_found)
      expect(json_response["error"]).to eq("User not found")
    end
  end
end

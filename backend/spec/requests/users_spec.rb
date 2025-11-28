require 'rails_helper'

RSpec.describe "Users API", type: :request do
  describe "POST /users" do
    it "returns 400 when userEmail is missing" do
      salt = Ingredient.create!(name: "salt")
      payload = {
        ingredients: {
          ingredientsInDB: [ salt.id ],
          ingredientsNotInDB: [ "1 cup flour" ]
        }
      }

      post "/users", params: payload, as: :json

      expect(response).to have_http_status(:bad_request)
      expect(json_response["errors"]).to have_key("userEmail")
    end

    it "returns 400 when ingredients structure is invalid" do
      payload = {
        userEmail: "user@example.com",
        ingredients: {
          ingredientsInDB: "not an array",
          ingredientsNotInDB: [ "1 cup flour" ]
        }
      }

      post "/users", params: payload, as: :json

      expect(response).to have_http_status(:bad_request)
      expect(json_response["errors"]).to have_key("ingredients")
    end

    it "returns 400 when both ingredientsInDB and ingredientsNotInDB are empty" do
      payload = {
        userEmail: "newuser#{SecureRandom.hex(4)}@example.com",
        ingredients: {
          ingredientsInDB: [],
          ingredientsNotInDB: []
        }
      }

      post "/users", params: payload, as: :json

      expect(response).to have_http_status(:bad_request)
      expect(json_response["error"]).to eq("either ingredientsInDB or ingredientsNotInDB must contain at least one value")
    end

    it "returns 400 when email already exists" do
      existing_user = User.create!(email: "existing@example.com")
      salt = Ingredient.find_or_create_by!(name: "salt")

      payload = {
        userEmail: "existing@example.com",
        ingredients: {
          ingredientsInDB: [ salt.id ],
          ingredientsNotInDB: []
        }
      }

      post "/users", params: payload, as: :json

      expect(response).to have_http_status(:bad_request)
      expect(json_response["error"]).to eq("This email already exists")
      expect(User.count).to eq(1)
    end

    it "creates a user successfully with  when payload is valid" do
      salt = Ingredient.create!(name: "salt")
      pepper = Ingredient.create!(name: "pepper")

      payload = {
        userEmail: "user@example.com",
        ingredients: {
          ingredientsInDB: [ salt.id, pepper.id ],
          ingredientsNotInDB: [ "1 cup flour", "2 eggs" ]
        }
      }

      expect {
        post "/users", params: payload, as: :json
      }.to change(User, :count).by(1)
        .and change(UserIngredient, :count).by(4)

      expect(response).to have_http_status(:ok)
      expect(json_response["id"]).to eq(User.last.id)
      expect(User.last.email).to eq("user@example.com")
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
      it "creates a user successfully #{test_case[:description]}" do
        ingredients_in_db = test_case[:ingredients_in_db].dup
        ingredients_not_in_db = test_case[:ingredients_not_in_db].dup
        expected_count = test_case[:expected_ingredient_count]

        salt = Ingredient.create!(name: "salt")
        ingredients_in_db = [ salt.id ] if expected_count > 0 && ingredients_not_in_db.empty?

        payload = {
          userEmail: "user#{SecureRandom.hex(4)}@example.com",
          ingredients: {
            ingredientsInDB: ingredients_in_db,
            ingredientsNotInDB: ingredients_not_in_db
          }
        }

        expect {
          post "/users", params: payload, as: :json
        }.to change(User, :count).by(1)
          .and change(UserIngredient, :count).by(expected_count)

        expect(response).to have_http_status(:ok)
        expect(json_response["id"]).to eq(User.last.id)
      end
    end
  end

  describe "GET /users" do
    it "returns 400 when email is missing" do
      get "/users", headers: { "Accept" => "application/json" }

      expect(response).to have_http_status(:bad_request)
      expect(json_response["errors"]).to have_key("email")
    end

    it "returns 400 when email format is invalid" do
      get "/users", params: { email: "invalid-email" }, headers: { "Accept" => "application/json" }

      expect(response).to have_http_status(:bad_request)
      expect(json_response["errors"]).to have_key("email")
    end

    it "returns 404 when user does not exist" do
      get "/users", params: { email: "nonexistent@example.com" }, headers: { "Accept" => "application/json" }

      expect(response).to have_http_status(:not_found)
      expect(json_response["error"]).to eq("User not found")
    end

    it "returns user details when user exists" do
      user = User.create!(email: "user@example.com")

      get "/users", params: { email: "user@example.com" }, headers: { "Accept" => "application/json" }

      expect(response).to have_http_status(:ok)
      expect(json_response["id"]).to eq(user.id)
      expect(json_response["email"]).to eq("user@example.com")
    end
  end
end

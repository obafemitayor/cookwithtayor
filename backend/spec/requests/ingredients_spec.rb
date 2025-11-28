require 'rails_helper'

RSpec.describe "Ingredients API", type: :request do
  describe "GET /ingredients" do
    [
      {
        param_name: "pageSize",
        invalid_value: "not an integer",
        description: "when pageSize is not an integer"
      },
      {
        param_name: "pageSize",
        invalid_value: 0,
        description: "when pageSize is less than or equal to 0"
      },
      {
        param_name: "offset",
        invalid_value: -1,
        description: "when offset is negative"
      }
    ].each do |test_case|
      it "returns 400 #{test_case[:description]}" do
        params_hash = { test_case[:param_name].to_sym => test_case[:invalid_value] }
        get "/ingredients", params: params_hash, headers: { "Accept" => "application/json" }

        expect(response).to have_http_status(:bad_request)
        expect(json_response["errors"]).to have_key(test_case[:param_name])
      end
    end

    it "returns ingredients successfully without pagination" do
      salt = Ingredient.create!(name: "salt")
      pepper = Ingredient.create!(name: "pepper")

      get "/ingredients", headers: { "Accept" => "application/json" }

      expect(response).to have_http_status(:ok)
      expect(json_response["ingredients"].length).to eq(2)
      expect(json_response["has_more"]).to eq(false)
      expect(json_response["total"]).to eq(2)
      expect(json_response["offset"]).to eq(0)
      expect(json_response["limit"]).to eq(20)

      ingredient_ids = json_response["ingredients"].map { |ing| ing["id"] }
      expect(ingredient_ids).to contain_exactly(salt.id, pepper.id)
    end

    it "returns ingredients with default page size of 20" do
      25.times do |i|
        Ingredient.create!(name: "ingredient_#{i}")
      end

      get "/ingredients", headers: { "Accept" => "application/json" }

      expect(response).to have_http_status(:ok)
      expect(json_response["ingredients"].length).to eq(20)
      expect(json_response["has_more"]).to eq(true)
      expect(json_response["total"]).to eq(25)
      expect(json_response["offset"]).to eq(0)
      expect(json_response["limit"]).to eq(20)
    end

    it "returns ingredients with custom page size" do
      15.times do |i|
        Ingredient.create!(name: "ingredient_#{i}")
      end

      get "/ingredients", params: { pageSize: 5 }, headers: { "Accept" => "application/json" }

      expect(response).to have_http_status(:ok)
      expect(json_response["ingredients"].length).to eq(5)
      expect(json_response["has_more"]).to eq(true)
      expect(json_response["total"]).to eq(15)
      expect(json_response["offset"]).to eq(0)
      expect(json_response["limit"]).to eq(5)
    end

    it "returns empty list when no ingredients exist" do
      get "/ingredients", headers: { "Accept" => "application/json" }

      expect(response).to have_http_status(:ok)
      expect(json_response["ingredients"]).to be_empty
      expect(json_response["has_more"]).to eq(false)
      expect(json_response["total"]).to eq(0)
      expect(json_response["offset"]).to eq(0)
      expect(json_response["limit"]).to eq(20)
    end

    it "returns next page when offset is provided" do
      ingredients = []
      10.times do |i|
        ingredients << Ingredient.create!(name: "ingredient_#{i}")
      end

      # Get first page
      get "/ingredients", params: { pageSize: 3 }, headers: { "Accept" => "application/json" }

      expect(response).to have_http_status(:ok)
      expect(json_response["ingredients"].length).to eq(3)
      expect(json_response["has_more"]).to eq(true)
      expect(json_response["offset"]).to eq(0)

      # Get next page
      get "/ingredients", params: { pageSize: 3, offset: 3 }, headers: { "Accept" => "application/json" }

      expect(response).to have_http_status(:ok)
      expect(json_response["ingredients"].length).to eq(3)
      expect(json_response["ingredients"].first["id"]).to eq(ingredients[3].id)
      expect(json_response["offset"]).to eq(3)
    end

    it "returns previous page when offset is decreased" do
      ingredients = []
      10.times do |i|
        ingredients << Ingredient.create!(name: "ingredient_#{i}")
      end

      # Get first page
      get "/ingredients", params: { pageSize: 3 }, headers: { "Accept" => "application/json" }
      first_page_ids = json_response["ingredients"].map { |ing| ing["id"] }

      # Get second page
      get "/ingredients", params: { pageSize: 3, offset: 3 }, headers: { "Accept" => "application/json" }

      # Go back to first page using offset
      get "/ingredients", params: { pageSize: 3, offset: 0 }, headers: { "Accept" => "application/json" }

      expect(response).to have_http_status(:ok)
      expect(json_response["ingredients"].length).to eq(3)
      expect(json_response["ingredients"].map { |ing| ing["id"] }).to eq(first_page_ids)
    end

    it "returns correct has_more flag when in the middle of pagination" do
      ingredients = []
      10.times do |i|
        ingredients << Ingredient.create!(name: "ingredient_#{i}")
      end

      # Get middle page - offset 3
      get "/ingredients", params: { pageSize: 3, offset: 3 }, headers: { "Accept" => "application/json" }

      expect(response).to have_http_status(:ok)
      expect(json_response["ingredients"].length).to eq(3)
      expect(json_response["has_more"]).to eq(true)
      expect(json_response["total"]).to eq(10)
      expect(json_response["offset"]).to eq(3)
    end

    it "returns ingredient when query matches exactly" do
      salt = Ingredient.create!(name: "salt")
      Ingredient.create!(name: "pepper")

      get "/ingredients", params: { query: "salt" }, headers: { "Accept" => "application/json" }

      expect(response).to have_http_status(:ok)
      expect(json_response["ingredients"].length).to eq(1)
      expect(json_response["ingredients"].first["id"]).to eq(salt.id)
      expect(json_response["ingredients"].first["name"]).to eq("salt")
    end

    it "returns ingredient when query matches case-insensitively" do
      salt = Ingredient.create!(name: "Salt")
      Ingredient.create!(name: "pepper")

      get "/ingredients", params: { query: "SALT" }, headers: { "Accept" => "application/json" }

      expect(response).to have_http_status(:ok)
      expect(json_response["ingredients"].length).to eq(1)
      expect(json_response["ingredients"].first["id"]).to eq(salt.id)
    end

    it "returns empty list when query does not match" do
      Ingredient.create!(name: "salt")
      Ingredient.create!(name: "pepper")

      get "/ingredients", params: { query: "flour" }, headers: { "Accept" => "application/json" }

      expect(response).to have_http_status(:ok)
      expect(json_response["ingredients"]).to be_empty
    end

    it "returns paginated results when query is provided" do
      # Create multiple ingredients that match the query pattern
      salt = Ingredient.create!(name: "salt")
      Ingredient.create!(name: "pepper")
      Ingredient.create!(name: "flour")

      # Since we can only have one ingredient with name "salt" (unique constraint),
      # we'll test that pagination works with query by using a different approach
      # Create ingredients that will be filtered, then verify pagination structure
      get "/ingredients", params: { query: "salt", pageSize: 1 }, headers: { "Accept" => "application/json" }

      expect(response).to have_http_status(:ok)
      expect(json_response["ingredients"].length).to eq(1)
      expect(json_response["ingredients"].first["id"]).to eq(salt.id)
      expect(json_response["ingredients"].first["name"]).to eq("salt")
      expect(json_response["has_more"]).to eq(false)
      expect(json_response["total"]).to eq(1)
    end
  end
end

require 'rails_helper'

RSpec.describe "Categories API", type: :request do
  describe "GET /categories" do
    it "returns all categories successfully without pagination" do
      category1 = Category.create!(name: "Desserts")
      category2 = Category.create!(name: "Appetizers")
      category3 = Category.create!(name: "Main Dishes")

      get "/categories", headers: { "Accept" => "application/json" }

      expect(response).to have_http_status(:ok)
      expect(json_response["categories"].length).to eq(3)
      expect(json_response["has_more"]).to eq(false)
      expect(json_response["total"]).to eq(3)
      expect(json_response["offset"]).to eq(0)

      category_ids = json_response["categories"].map { |cat| cat["id"] }
      expect(category_ids).to contain_exactly(category1.id, category2.id, category3.id)
    end

    it "returns categories with pagination when pageSize is provided" do
      25.times do |i|
        Category.create!(name: "Category #{i}")
      end

      get "/categories", params: { pageSize: 10 }, headers: { "Accept" => "application/json" }

      expect(response).to have_http_status(:ok)
      expect(json_response["categories"].length).to eq(10)
      expect(json_response["has_more"]).to eq(true)
      expect(json_response["total"]).to eq(25)
      expect(json_response["offset"]).to eq(0)
      expect(json_response["limit"]).to eq(10)
    end

    it "filters categories by query parameter" do
      Category.create!(name: "Desserts")
      Category.create!(name: "Appetizers")
      Category.create!(name: "Main Dishes")
      Category.create!(name: "Dessert Specials")

      get "/categories", params: { query: "dessert" }, headers: { "Accept" => "application/json" }

      expect(response).to have_http_status(:ok)
      category_names = json_response["categories"].map { |cat| cat["name"] }
      expect(category_names).to contain_exactly("Desserts", "Dessert Specials")
    end

    it "returns empty list when query matches no categories" do
      Category.create!(name: "Desserts")

      get "/categories", params: { query: "nonexistent" }, headers: { "Accept" => "application/json" }

      expect(response).to have_http_status(:ok)
      expect(json_response["categories"]).to be_empty
    end

    it "returns empty list when no categories exist" do
      get "/categories", headers: { "Accept" => "application/json" }

      expect(response).to have_http_status(:ok)
      expect(json_response["categories"]).to be_empty
      expect(json_response["has_more"]).to eq(false)
      expect(json_response["total"]).to eq(0)
    end

    it "returns categories with correct structure" do
      category = Category.create!(name: "Desserts")

      get "/categories", headers: { "Accept" => "application/json" }

      expect(response).to have_http_status(:ok)
      expect(json_response["categories"].first).to have_key("id")
      expect(json_response["categories"].first).to have_key("name")
      expect(json_response["categories"].first["id"]).to eq(category.id)
      expect(json_response["categories"].first["name"]).to eq("Desserts")
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
        get "/categories", params: params_hash, headers: { "Accept" => "application/json" }

        expect(response).to have_http_status(:bad_request)
        expect(json_response["errors"]).to have_key(test_case[:param_name])
      end
    end

    it "returns next page when offset is provided" do
      categories = []
      10.times do |i|
        categories << Category.create!(name: "Category #{i}")
      end

      get "/categories", params: { pageSize: 3 }, headers: { "Accept" => "application/json" }

      expect(response).to have_http_status(:ok)
      expect(json_response["categories"].length).to eq(3)
      expect(json_response["has_more"]).to eq(true)
      expect(json_response["offset"]).to eq(0)

      first_page_ids = json_response["categories"].map { |cat| cat["id"] }

      get "/categories", params: { pageSize: 3, offset: 3 }, headers: { "Accept" => "application/json" }

      expect(response).to have_http_status(:ok)
      expect(json_response["categories"].length).to eq(3)
      expect(json_response["offset"]).to eq(3)

      second_page_ids = json_response["categories"].map { |cat| cat["id"] }
      expect(first_page_ids & second_page_ids).to be_empty
    end
  end
end

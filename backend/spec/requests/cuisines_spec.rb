require 'rails_helper'

RSpec.describe "Cuisines API", type: :request do
  describe "GET /cuisines" do
    it "returns all cuisines successfully" do
      cuisine1 = Cuisine.create!(name: "Italian")
      cuisine2 = Cuisine.create!(name: "Mexican")
      cuisine3 = Cuisine.create!(name: "Asian")

      get "/cuisines", headers: { "Accept" => "application/json" }

      expect(response).to have_http_status(:ok)
      expect(json_response["cuisines"].length).to eq(3)

      cuisine_ids = json_response["cuisines"].map { |cuisine| cuisine["id"] }
      expect(cuisine_ids).to contain_exactly(cuisine1.id, cuisine2.id, cuisine3.id)

      cuisine_names = json_response["cuisines"].map { |cuisine| cuisine["name"] }
      expect(cuisine_names).to eq([ "Asian", "Italian", "Mexican" ])
    end

    it "returns cuisines ordered by name" do
      Cuisine.create!(name: "Zimbabwean")
      Cuisine.create!(name: "American")
      Cuisine.create!(name: "Brazilian")

      get "/cuisines", headers: { "Accept" => "application/json" }

      expect(response).to have_http_status(:ok)
      cuisine_names = json_response["cuisines"].map { |cuisine| cuisine["name"] }
      expect(cuisine_names).to eq([ "American", "Brazilian", "Zimbabwean" ])
    end

    it "returns empty list when no cuisines exist" do
      get "/cuisines", headers: { "Accept" => "application/json" }

      expect(response).to have_http_status(:ok)
      expect(json_response["cuisines"]).to be_empty
    end

    it "returns cuisines with correct structure" do
      cuisine = Cuisine.create!(name: "Italian")

      get "/cuisines", headers: { "Accept" => "application/json" }

      expect(response).to have_http_status(:ok)
      expect(json_response["cuisines"].first).to have_key("id")
      expect(json_response["cuisines"].first).to have_key("name")
      expect(json_response["cuisines"].first["id"]).to eq(cuisine.id)
      expect(json_response["cuisines"].first["name"]).to eq("Italian")
    end
  end
end

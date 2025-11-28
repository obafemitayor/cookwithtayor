# frozen_string_literal: true

module RecipeValidationSchema
  class RecommendationsQuerySchema < Dry::Validation::Contract
    params do
      optional(:category_id).filled(:integer, gt?: 0)
      optional(:cuisine_id).filled(:integer, gt?: 0)
    end
  end
end

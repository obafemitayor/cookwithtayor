# frozen_string_literal: true

module CategoryValidationSchema
  class ListCategoriesSchema < Dry::Validation::Contract
    params do
      optional(:query).filled(:string)
      optional(:pageSize).filled(:integer, gt?: 0)
      optional(:offset).filled(:integer, gteq?: 0)
    end
  end
end

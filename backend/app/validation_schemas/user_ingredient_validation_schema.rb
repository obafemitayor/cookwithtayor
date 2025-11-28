# frozen_string_literal: true

module UserIngredientValidationSchema
  class AddIngredientsSchema < Dry::Validation::Contract
    params do
      optional(:ingredientsInDB).array(:integer)
      optional(:ingredientsNotInDB).array(:string)
    end

    rule(:ingredientsInDB, :ingredientsNotInDB) do
      ingredients_in_db = values[:ingredientsInDB] || []
      ingredients_not_in_db = values[:ingredientsNotInDB] || []

      if ingredients_in_db.empty? && ingredients_not_in_db.empty?
        base.failure("either ingredientsInDB or ingredientsNotInDB must contain at least one value")
      end
    end
  end

  class UpdateIngredientSchema < Dry::Validation::Contract
    params do
      required(:ingredient).hash do
        optional(:id).maybe(:integer)
        required(:name).filled(:string)
      end
    end
  end

  class RemoveIngredientsSchema < Dry::Validation::Contract
    params do
      required(:ids).array(:integer)
    end
  end

  class ListIngredientsSchema < Dry::Validation::Contract
    params do
      optional(:pageSize).filled(:integer, gt?: 0)
      optional(:offset).filled(:integer, gteq?: 0)
    end
  end
end

# frozen_string_literal: true

module UserValidationSchema
  class AddUserSchema < Dry::Validation::Contract
    params do
      required(:userEmail).filled(:string, format?: URI::MailTo::EMAIL_REGEXP)

      required(:ingredients).hash do
        optional(:ingredientsInDB).array(:integer)
        optional(:ingredientsNotInDB).array(:string)
      end
    end

    rule(:ingredients) do
      ingredients_in_db = values[:ingredients][:ingredientsInDB] || []
      ingredients_not_in_db = values[:ingredients][:ingredientsNotInDB] || []

      if ingredients_in_db.empty? && ingredients_not_in_db.empty?
        base.failure("either ingredientsInDB or ingredientsNotInDB must contain at least one value")
      end
    end
  end

  class GetUserByEmailSchema < Dry::Validation::Contract
    params do
      required(:email).filled(:string, format?: URI::MailTo::EMAIL_REGEXP)
    end
  end
end

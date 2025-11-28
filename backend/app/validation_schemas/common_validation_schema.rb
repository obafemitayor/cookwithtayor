# frozen_string_literal: true

module CommonValidationSchema
  class UserIdValidationSchema < Dry::Validation::Contract
    params do
      required(:user_id).filled(:integer, gt?: 0)
    end
  end
end

# frozen_string_literal: true

module ValidatesPayload
  extend ActiveSupport::Concern

  private

  def validate_payload(contract_class_or_instance, params_to_validate = nil)
    contract = contract_class_or_instance.is_a?(Class) ? contract_class_or_instance.new : contract_class_or_instance
    params_hash = params_to_validate || request_parameters
    validation = contract.call(params_hash)

    if validation.failure?
      errors_hash = validation.errors.to_h
      if errors_hash.key?(nil) && errors_hash[nil].any?
        render json: { error: errors_hash[nil].first }, status: :bad_request
      else
        render json: { errors: errors_hash }, status: :bad_request
      end
      return {}
    end

    validation.to_h
  end
end

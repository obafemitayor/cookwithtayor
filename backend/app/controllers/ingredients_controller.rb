class IngredientsController < ApplicationController
  def index
    payload = validate_payload(IngredientValidationSchema::ListIngredientsSchema)
    return if performed?

    result = ingredient_service.list_ingredients(
      query: payload[:query],
      offset: payload[:offset] || 0,
      page_size: payload[:pageSize] || 20
    )

    render json: result, status: :ok
  end

  private
  def ingredient_service
    @ingredient_service ||= IngredientService.new
  end

  def request_parameters
    params.permit!.to_h.deep_symbolize_keys
  end
end

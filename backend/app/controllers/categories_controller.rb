class CategoriesController < ApplicationController
  def index
    payload = validate_payload(CategoryValidationSchema::ListCategoriesSchema)
    return if performed?

    result = category_service.list_categories(
      query: payload[:query],
      offset: payload[:offset] || 0,
      page_size: payload[:pageSize] || 20
    )

    render json: result, status: :ok
  end

  private
  def category_service
    @category_service ||= CategoryService.new
  end

  def request_parameters
    params.permit!.to_h.deep_symbolize_keys
  end
end

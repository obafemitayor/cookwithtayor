class ApplicationController < ActionController::Base
  include ValidatesPayload

  # Skip CSRF protection for API requests
  skip_before_action :verify_authenticity_token

  # Validate user_id route parameter is an integer
  before_action :validate_user_id, if: -> { params[:user_id].present? }

  # Only allow modern browsers supporting webp images, web push, badges, import maps, CSS nesting, and CSS :has.
  allow_browser versions: :modern

  # Changes to the importmap will invalidate the etag for HTML responses
  stale_when_importmap_changes

  # Global error handler for unhandled exceptions
  rescue_from StandardError, with: :handle_internal_server_error

  private

  def validate_user_id
    route_params = params.permit(:user_id).to_h.deep_symbolize_keys
    validate_payload(CommonValidationSchema::UserIdValidationSchema, route_params)
    nil
  end

  def handle_internal_server_error(exception)
    render json: { error: "Something went wrong" }, status: :internal_server_error
  end
end

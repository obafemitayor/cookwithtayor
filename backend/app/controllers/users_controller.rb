class UsersController < ApplicationController
  def create
    payload = validate_payload(UserValidationSchema::AddUserSchema)
    return if performed?

    if user_service.user_exists?(payload[:userEmail])
      render json: { error: "This email already exists" }, status: :bad_request
      return
    end

    ingredients_in_db = payload[:ingredients][:ingredientsInDB].present? ? payload[:ingredients][:ingredientsInDB] : []
    ingredients_not_in_db = payload[:ingredients][:ingredientsNotInDB].present? ? payload[:ingredients][:ingredientsNotInDB] : []

    created_user = nil
    ActiveRecord::Base.transaction do
      created_user = user_service.create_user(email: payload[:userEmail])
      user_ingredient_service.create_user_ingredients(
        user_id: created_user.id,
        ingredients_in_db: ingredients_in_db,
        ingredients_not_in_db: ingredients_not_in_db
      )
    end

    render json: { id: created_user.id }, status: :ok
  end

  def index
    payload = validate_payload(UserValidationSchema::GetUserByEmailSchema)
    return if performed?

    user = user_service.find_by_email(payload[:email])
    render json: { id: user.id, email: user.email }, status: :ok
  rescue ActiveRecord::RecordNotFound
    render json: { error: "User not found" }, status: :not_found
  end

  private

  def user_service
    @user_service ||= UserService.new
  end

  def user_ingredient_service
    @user_ingredient_service ||= UserIngredientService.new
  end

  def request_parameters
    params.permit!.to_h.deep_symbolize_keys
  end
end

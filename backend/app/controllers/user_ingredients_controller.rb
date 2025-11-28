class UserIngredientsController < ApplicationController
  def add_ingredients
    payload = validate_payload(UserIngredientValidationSchema::AddIngredientsSchema)
    return if performed?

    user = find_user(params[:user_id])
    return unless user

    ingredients_in_db = payload[:ingredientsInDB].present? ? payload[:ingredientsInDB] : []
    ingredients_not_in_db = payload[:ingredientsNotInDB].present? ? payload[:ingredientsNotInDB] : []

    ActiveRecord::Base.transaction do
      user_ingredient_service.create_user_ingredients(
        user_id: user.id,
        ingredients_in_db: ingredients_in_db,
        ingredients_not_in_db: ingredients_not_in_db
      )
    end

    head :ok
  end

  def list_ingredients
    payload = validate_payload(UserIngredientValidationSchema::ListIngredientsSchema)
    return if performed?

    user = find_user(params[:user_id])
    return unless user

    result = user_ingredient_service.get_user_ingredients(
      user_id: user.id,
      offset: payload[:offset] || 0,
      page_size: payload[:pageSize] || 20
    )

    render json: result, status: :ok
  end

  def update_ingredient
    payload = validate_payload(UserIngredientValidationSchema::UpdateIngredientSchema)
    return if performed?

    user = find_user(params[:user_id])
    return unless user

    user_ingredient = find_user_ingredient(params[:id])
    return unless user_ingredient

    ingredient_data = payload[:ingredient]
    new_ingredient_id = ingredient_data[:id]
    new_ingredient_name = ingredient_data[:name]

    user_ingredient_service.replace_ingredient(
      current_ingredient_id: user_ingredient.id,
      new_ingredient_id: new_ingredient_id,
      new_ingredient_name: new_ingredient_name
    )

    head :ok
  end

  def remove_ingredients
    payload = validate_payload(UserIngredientValidationSchema::RemoveIngredientsSchema)
    return if performed?

    return unless find_user(params[:user_id])

    user_ingredient_service.remove_ingredient(
      user_ingredient_ids: payload[:ids]
    )

    head :ok
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

  def find_user(user_id)
    user_service.find(user_id)
  rescue ActiveRecord::RecordNotFound
    render json: { error: "User not found" }, status: :not_found
    nil
  end

  def find_user_ingredient(user_ingredient_id)
    user_ingredient_service.find(user_ingredient_id: user_ingredient_id)
  rescue ActiveRecord::RecordNotFound
    render json: { error: "User Ingredient not found" }, status: :not_found
    nil
  end
end

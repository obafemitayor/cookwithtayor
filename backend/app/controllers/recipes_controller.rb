class RecipesController < ApplicationController
  def recommendations
    payload = validate_payload(RecipeValidationSchema::RecommendationsQuerySchema)
    return if performed?

    user = find_user(params[:user_id])
    return unless user

    recommendations = recipe_service.find_most_relevant_recipes(
      user_id: user.id,
      category_id: payload[:category_id],
      cuisine_id: payload[:cuisine_id]
    )

    render json: { recommendations: recommendations }, status: :ok
  end

  def recipe_details
    user = find_user(params[:user_id])
    return unless user

    recipe = recipe_service.get_recipe_details(user_id: user.id, recipe_id: params[:recipeId])
    unless recipe
      render json: { error: "Recipe not found" }, status: :not_found
      return
    end

    render json: recipe, status: :ok
  end

  private

  def user_service
    @user_service ||= UserService.new
  end

  def recipe_service
    @recipe_service ||= RecipeService.new
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
end

class UserIngredientService
  def initialize(
    user_ingredient_model: UserIngredient,
    ingredient_service: IngredientService.new
  )
    @user_ingredient_model = user_ingredient_model
    @ingredient_service = ingredient_service
  end

  def find(user_ingredient_id:)
    user_ingredient_model.find_by!(id: user_ingredient_id)
  end

  def create_user_ingredients(user_id:, ingredients_in_db: [], ingredients_not_in_db: [])
    all_ingredient_ids = []
    all_ingredient_ids.concat(Array(ingredients_in_db).map(&:to_i)) if ingredients_in_db.present?
    if ingredients_not_in_db.present?
      created_ingredient_ids = ingredient_service.create(ingredients_not_in_db)
      all_ingredient_ids.concat(created_ingredient_ids)
    end
    return if all_ingredient_ids.empty?

    timestamp = Time.current
    rows = all_ingredient_ids.map do |ingredient_id|
      {
        user_id: user_id,
        ingredient_id: ingredient_id,
        created_at: timestamp,
        updated_at: timestamp
      }
    end
    user_ingredient_model.insert_all(rows)
  end

  def replace_ingredient(current_ingredient_id:, new_ingredient_id:, new_ingredient_name:)
    new_ingredient_id = new_ingredient_id.nil? ?
                          ingredient_service.create([ new_ingredient_name ]).first :
                          new_ingredient_id
    return unless new_ingredient_id

    user_ingredient_model.find_by!(id: current_ingredient_id)
                        .update!(ingredient_id: new_ingredient_id)
  end

  def remove_ingredient(user_ingredient_ids: [])
    ids = Array(user_ingredient_ids).map(&:to_i).uniq
    return if ids.empty?

    user_ingredient_model.where(id: ids).delete_all
  end

  def get_user_ingredients(user_id:, offset: 0, page_size: 20)
    scope = user_ingredient_model.includes(:ingredient).where(user_id: user_id)
    total_count = scope.count
    records = scope.order(:id).offset(offset).limit(page_size).to_a
    has_more = (offset + page_size) < total_count
    formatted_ingredients = records.map do |user_ingredient|
      {
        id: user_ingredient.id,
        ingredient_id: user_ingredient.ingredient_id,
        ingredient: {
          id: user_ingredient.ingredient.id,
          name: user_ingredient.ingredient.name
        }
      }
    end

    {
      ingredients: formatted_ingredients,
      total: total_count,
      offset: offset,
      limit: page_size,
      has_more: has_more
    }
  end

  private
  attr_reader :user_ingredient_model, :ingredient_service
end

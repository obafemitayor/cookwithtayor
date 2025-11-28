class IngredientService
  def initialize(ingredient_model: Ingredient)
    @ingredient_model = ingredient_model
  end

  def create(ingredient_names)
    names_list = Array(ingredient_names)
    names_list.map { |ingredient_name| create_ingredient(ingredient_name) }
  end

  def list_ingredients(query: nil, offset: 0, page_size: 20)
    scope = ingredient_model.all

    if query.present?
      sanitized_query = ActiveRecord::Base.connection.quote(query.downcase)
      scope = scope.where("similarity(LOWER(name), LOWER(?)) > 0.3", query)
                   .order(Arel.sql("similarity(LOWER(name), #{sanitized_query}) DESC"), :id)
    else
      scope = scope.order(:id)
    end

    total_count = scope.count
    records = scope.offset(offset).limit(page_size).to_a
    has_more = (offset + page_size) < total_count

    {
      ingredients: records,
      total: total_count,
      offset: offset,
      limit: page_size,
      has_more: has_more
    }
  end

  private
  attr_reader :ingredient_model

  def create_ingredient(ingredient_name)
    existing = ingredient_exists(ingredient_name)
    record = existing || ingredient_model.create!(name: ingredient_name)
    record.id
  end

  def ingredient_exists(ingredient_name)
    sanitized_query = ActiveRecord::Base.connection.quote(ingredient_name.downcase)
    ingredient_model
      .select("ingredients.*, similarity(LOWER(ingredients.name), #{sanitized_query}) AS score")
      .where("similarity(LOWER(ingredients.name), LOWER(?)) > 0.7", ingredient_name)
      .order(Arel.sql("score DESC"))
      .first
  end
end

class RecipeService
  PAGE_SIZE = 100

  def find_most_relevant_recipes(user_id:, category_id: nil, cuisine_id: nil)
    recipes = get_most_relevant_recipes(user_id: user_id, category_id: category_id, cuisine_id: cuisine_id)
    recipes.each { |recipe| recipe.image_url = parse_image_url(recipe.image_url) if recipe.image_url.present? }
    recipes
  end

  def get_recipe_details(user_id:, recipe_id:)
    recipe = Recipe.includes(:recipe_ingredients).find_by(id: recipe_id)
    return if recipe.blank?

    recipe_ingredients = recipe.recipe_ingredients
                               .pluck(:canonical_name)
                               .compact
                               .uniq

    missing_ingredients = get_missing_ingredients_needed_to_make_recipe(recipe, user_id)

    {
      id: recipe.id,
      name: recipe.name,
      image_url: parse_image_url(recipe.image_url),
      category_id: recipe.category_id,
      cuisine_id: recipe.cuisine_id,
      cook_time: recipe.cook_time,
      prep_time: recipe.prep_time,
      ratings: recipe.ratings,
      ingredients: recipe_ingredients,
      missing_ingredients: missing_ingredients
    }
  end

  private

  def parse_image_url(image_url)
    return image_url if image_url.blank?

    uri = URI.parse(image_url)
    return image_url unless uri.query

    params = URI.decode_www_form(uri.query).to_h
    decoded_url = params["url"]
    return image_url unless decoded_url

    decoded_url
  rescue URI::InvalidURIError, ArgumentError
    image_url
  end

  def get_missing_ingredients_needed_to_make_recipe(recipe, user_id)
    user_ingredients_table = UserIngredient.arel_table
    recipe_ingredients_table = RecipeIngredient.arel_table

    exists_subquery = user_ingredients_table
      .project(1)
      .where(
        user_ingredients_table[:user_id].eq(user_id)
        .and(user_ingredients_table[:ingredient_id].eq(recipe_ingredients_table[:ingredient_id]))
      )
      .exists

    recipe.recipe_ingredients
      .joins(:ingredient)
      .where.not(exists_subquery)
      .pluck("#{Ingredient.table_name}.name")
      .compact
      .uniq
  end

  def get_most_relevant_recipes(user_id:, category_id:, cuisine_id:)
    recipes_query = Recipe.all
    recipes_query = recipes_query.where(category_id: category_id) if category_id.present?
    recipes_query = recipes_query.where(cuisine_id: cuisine_id) if cuisine_id.present?

    recipes_query = recipes_query
      .joins(:recipe_ingredients)
      .joins(
        <<~SQL.squish
          LEFT JOIN user_ingredients
            ON recipe_ingredients.ingredient_id = user_ingredients.ingredient_id
            AND user_ingredients.user_id = #{ActiveRecord::Base.connection.quote(user_id)}
        SQL
      )

    recipes_query = recipes_query
      .select(
        "recipes.*",
        "COUNT(DISTINCT recipe_ingredients.ingredient_id) AS total_ingredients_needed_for_recipe",
        "COUNT(DISTINCT user_ingredients.ingredient_id) AS total_ingredients_user_has_for_recipe",
        "(COUNT(DISTINCT recipe_ingredients.ingredient_id) - COUNT(DISTINCT user_ingredients.ingredient_id)) AS total_ingredients_missing_for_recipe"
      )
      .group("recipes.id")
    recipes_query = recipes_query.having("COUNT(DISTINCT user_ingredients.ingredient_id) > 0")
    recipes_query = recipes_query.order(
      Arel.sql("(COUNT(DISTINCT recipe_ingredients.ingredient_id) - COUNT(DISTINCT user_ingredients.ingredient_id)) ASC"),
      Arel.sql("COUNT(DISTINCT user_ingredients.ingredient_id) DESC"),
      Arel.sql("COUNT(DISTINCT recipe_ingredients.ingredient_id) ASC"),
      "recipes.id ASC"
    )
    recipes_query.limit(PAGE_SIZE)
  end
end

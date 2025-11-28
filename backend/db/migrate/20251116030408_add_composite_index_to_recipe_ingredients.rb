class AddCompositeIndexToRecipeIngredients < ActiveRecord::Migration[8.1]
  def change
    add_index :recipe_ingredients, [ :recipe_id, :ingredient_id ], name: 'index_recipe_ingredients_on_recipe_id_and_ingredient_id'
  end
end

class AddCompositeIndexToUserIngredients < ActiveRecord::Migration[8.1]
  def change
    add_index :user_ingredients, [ :user_id, :ingredient_id ], name: 'index_user_ingredients_on_user_id_and_ingredient_id'
  end
end

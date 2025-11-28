class AddNotNullConstraintsToForeignKeys < ActiveRecord::Migration[8.1]
  def change
    # Ensure user_ingredients table has NOT NULL constraints
    change_column_null :user_ingredients, :user_id, false
    change_column_null :user_ingredients, :ingredient_id, false

    # Ensure recipe_ingredients table has NOT NULL constraints
    change_column_null :recipe_ingredients, :recipe_id, false
    change_column_null :recipe_ingredients, :ingredient_id, false
  end
end

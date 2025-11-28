class RemoveCanonicalNameFromUserIngredients < ActiveRecord::Migration[8.1]
  def change
    remove_column :user_ingredients, :canonical_name, :string
  end
end

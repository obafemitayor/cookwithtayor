class CreateUserIngredients < ActiveRecord::Migration[8.1]
  def change
    create_table :user_ingredients do |t|
      t.references :user, null: false, foreign_key: true
      t.references :ingredient, null: false, foreign_key: true
      t.string :canonical_name
      t.timestamps
    end
  end
end

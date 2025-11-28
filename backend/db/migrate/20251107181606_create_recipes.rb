class CreateRecipes < ActiveRecord::Migration[8.1]
  def change
    create_table :recipes do |t|
      t.string :name, null: false
      t.references :category, null: true, foreign_key: true
      t.references :cuisine, null: true, foreign_key: true
      t.integer :cook_time
      t.integer :prep_time
      t.decimal :ratings, precision: 3, scale: 2
      t.string :image_url
      t.timestamps
    end

    add_index :recipes, [ :cuisine_id, :category_id ]
  end
end

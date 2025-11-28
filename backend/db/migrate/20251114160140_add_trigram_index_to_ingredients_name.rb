class AddTrigramIndexToIngredientsName < ActiveRecord::Migration[8.1]
  def up
    execute <<~SQL
      CREATE INDEX index_ingredients_on_lower_name_trgm
      ON ingredients USING gin (LOWER(name) gin_trgm_ops);
    SQL
  end

  def down
    execute <<~SQL
      DROP INDEX IF EXISTS index_ingredients_on_lower_name_trgm;
    SQL
  end
end

namespace :db do
  desc "Seed recipes from normalized JSON file"
  task seed_recipes: :environment do
    STDOUT.sync = true
    start_time = Time.current

    json_file = Rails.root.join("db", "recipes_seed_data", "normalized-recipe-seed-data.json")
    recipes = JSON.parse(File.read(json_file))

    puts "Starting recipe seeding: #{recipes.length} recipes"

    ingredient_service = IngredientService.new
    processed = 0
    errors = 0

    recipes.each_with_index do |recipe, index|
      begin
        # Find or create category
        category_id = recipe["category"].present? ? Category.find_or_create_by!(name: recipe["category"]).id : nil

        # Find or create cuisine
        cuisine_id = recipe["cuisine"].present? ? Cuisine.find_or_create_by!(name: recipe["cuisine"]).id : nil

        # Create recipe
        created_recipe = Recipe.create!(
          name: recipe["title"],
          category_id: category_id,
          cuisine_id: cuisine_id,
          cook_time: recipe["cook_time"],
          prep_time: recipe["prep_time"],
          ratings: recipe["ratings"],
          image_url: recipe["image"]
        )

        # Bulk create recipe ingredients
        if recipe["ingredients"].present?
          # Extract ingredient names (use parsed name if available, otherwise original)
          ingredient_names = recipe["ingredients"].map do |ing|
            ing["parsed_ingredient_name"].present? ? ing["parsed_ingredient_name"] : ing["original_ingredient_name"]
          end

          # Create ingredients and get IDs (returns array of IDs in same order)
          ingredient_ids = ingredient_service.create(ingredient_names)

          # Zip ingredient names with their IDs to create a map
          ingredient_id_map = ingredient_names.zip(ingredient_ids).to_h

          recipe_ingredient_records = recipe["ingredients"].filter_map do |ingredient|
            ingredient_name = ingredient["parsed_ingredient_name"].present? ? ingredient["parsed_ingredient_name"] : ingredient["original_ingredient_name"]
            ingredient_id = ingredient_id_map[ingredient_name]
            next unless ingredient_id

            {
              recipe_id: created_recipe.id,
              ingredient_id: ingredient_id,
              canonical_name: ingredient["original_ingredient_name"],
              created_at: Time.current,
              updated_at: Time.current
            }
          end

          RecipeIngredient.insert_all(recipe_ingredient_records) if recipe_ingredient_records.any?
        end

        processed += 1
        puts "[#{index + 1}/#{recipes.length}] ✓ #{recipe['title']} (#{recipe['ingredients']&.length || 0} ingredients)"
      rescue => e
        errors += 1
        puts "[#{index + 1}/#{recipes.length}] ✗ ERROR: #{recipe['title']} - #{e.message}"
      end
    end

    elapsed = Time.current - start_time
    puts "\nCompleted: #{processed} processed, #{errors} errors in #{elapsed.round(2)}s"
  end
end

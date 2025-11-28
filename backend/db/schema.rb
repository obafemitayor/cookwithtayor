# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.1].define(version: 2025_11_16_030408) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "pg_catalog.plpgsql"
  enable_extension "pg_trgm"

  create_table "categories", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.string "name", null: false
    t.datetime "updated_at", null: false
    t.index ["name"], name: "index_categories_on_name", unique: true
  end

  create_table "cuisines", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.string "name", null: false
    t.datetime "updated_at", null: false
    t.index ["name"], name: "index_cuisines_on_name", unique: true
  end

  create_table "ingredients", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.string "name", null: false
    t.datetime "updated_at", null: false
    t.index "lower((name)::text) gin_trgm_ops", name: "index_ingredients_on_lower_name_trgm", using: :gin
    t.index ["name"], name: "index_ingredients_on_name", unique: true
  end

  create_table "recipe_ingredients", force: :cascade do |t|
    t.string "canonical_name"
    t.datetime "created_at", null: false
    t.bigint "ingredient_id", null: false
    t.bigint "recipe_id", null: false
    t.datetime "updated_at", null: false
    t.index ["ingredient_id"], name: "index_recipe_ingredients_on_ingredient_id"
    t.index ["recipe_id", "ingredient_id"], name: "index_recipe_ingredients_on_recipe_id_and_ingredient_id"
    t.index ["recipe_id"], name: "index_recipe_ingredients_on_recipe_id"
  end

  create_table "recipes", force: :cascade do |t|
    t.bigint "category_id"
    t.integer "cook_time"
    t.datetime "created_at", null: false
    t.bigint "cuisine_id"
    t.string "image_url"
    t.string "name", null: false
    t.integer "prep_time"
    t.decimal "ratings", precision: 3, scale: 2
    t.datetime "updated_at", null: false
    t.index ["category_id"], name: "index_recipes_on_category_id"
    t.index ["cuisine_id", "category_id"], name: "index_recipes_on_cuisine_id_and_category_id"
    t.index ["cuisine_id"], name: "index_recipes_on_cuisine_id"
  end

  create_table "user_ingredients", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.bigint "ingredient_id", null: false
    t.datetime "updated_at", null: false
    t.bigint "user_id", null: false
    t.index ["ingredient_id"], name: "index_user_ingredients_on_ingredient_id"
    t.index ["user_id", "ingredient_id"], name: "index_user_ingredients_on_user_id_and_ingredient_id"
    t.index ["user_id"], name: "index_user_ingredients_on_user_id"
  end

  create_table "users", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.string "email", null: false
    t.datetime "updated_at", null: false
    t.index ["email"], name: "index_users_on_email", unique: true
  end

  add_foreign_key "recipe_ingredients", "ingredients"
  add_foreign_key "recipe_ingredients", "recipes"
  add_foreign_key "recipes", "categories"
  add_foreign_key "recipes", "cuisines"
  add_foreign_key "user_ingredients", "ingredients"
  add_foreign_key "user_ingredients", "users"
end

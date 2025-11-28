Rails.application.routes.draw do
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check

  # Render dynamic PWA files from app/views/pwa/* (remember to link manifest in application.html.erb)
  # get "manifest" => "rails/pwa#manifest", as: :pwa_manifest
  # get "service-worker" => "rails/pwa#service_worker", as: :pwa_service_worker

  get "ingredients", to: "ingredients#index"
  get "categories", to: "categories#index"
  get "cuisines", to: "cuisines#index"

  resources :users, only: [ :create, :index ] do
    post :ingredients, to: "user_ingredients#add_ingredients"
    get :ingredients, to: "user_ingredients#list_ingredients"
    put "ingredients/:id", to: "user_ingredients#update_ingredient"
    delete :ingredients, to: "user_ingredients#remove_ingredients"
    get "recipes/recommended-recipes", to: "recipes#recommendations"
    get "recipes/recommended-recipes/:recipeId", to: "recipes#recipe_details"
  end

  # Defines the root path route ("/")
  # root "posts#index"
end

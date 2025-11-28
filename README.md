# CookWithTayor 👨‍🍳🍳

## Table of Contents

1. [Introduction](#introduction)
2. [User Stories](#user-stories)
3. [Repository Structure](#repository-structure)
4. [Technical Decisions and Trade-offs](#technical-decisions-and-trade-offs)
5. [How to Launch the App](#how-to-Launch-the-App)
   - [Online](#online)
   - [Locally](#locally)
6. [How to Run the Tests](#how-to-run-the-tests)
   - [Backend Tests](#backend-tests)
   - [Frontend Tests](#frontend-tests)

---

## Introduction

**CookWithTayor** is a web application that helps users discover the most relevant recipes they can prepare with the ingredients they already have at home. The app provides a personalized recipe recommendation system that prioritizes recipes based on ingredient availability, recommending up to 100 of the most relevant recipes, making meal planning easier and more efficient.

### How It Works

The application follows a simple two-step onboarding process:

1. **Email Registration**: New users start by providing their email address. This serves as their unique identifier and allows the app to remember their ingredient preferences across sessions.

2. **Ingredient Selection**: After providing their email, users are prompted to add ingredients from their pantry. Users can search for and select ingredients, or add custom ingredients if needed. At least one ingredient must be added to proceed.

Once onboarding is complete, users can immediately see the most relevant recipes they can prepare. On subsequent visits, users who have already onboarded are automatically redirected to their recipe results, creating a smoother and more seamless experience.

You can launch the app by visiting the [Online](#online) part in the [How to Launch the App](#how-to-launch-the-app) section.

---

## User Stories

### User Story 1 — Ingredient Entry  
**As a user, I want to provide the ingredients I have at home so that I can receive recipe suggestions that match my pantry.**

**Acceptance Criteria:**
- User can type or search for ingredients.
- User can add custom ingredients if they are not found.
- User must add at least one ingredient before continuing.

---

### User Story 2 — Most Relevant Recipes  
**As a user, I want recipes to be sorted by how many ingredients I’m missing so that I can quickly find what I can cook right now.**

**Acceptance Criteria:**
- Recipes are ordered by missing ingredients (fewest missing first).
- Each recipe clearly displays how many ingredients are missing.
- Recipe cards show key information (title, image, preparation time, rating).

---

### User Story 3 — Ingredient Management  
**As a user, I want to update the ingredients in my pantry so that my recipe suggestions stay accurate.**

**Acceptance Criteria:**
- User can add new ingredients.
- User can update existing ingredients.
- User can remove ingredients.
- Recipe suggestions update immediately after changes.


## Repository Structure

```
obafemitayor/
├── backend/                          # Ruby on Rails API
│   ├── app/
│   │   ├── controllers/              # API controllers
│   │   │   ├── concerns/
│   │   │   │   └── validates_payload.rb
│   │   │   ├── application_controller.rb
│   │   │   ├── categories_controller.rb
│   │   │   ├── cuisines_controller.rb
│   │   │   ├── ingredients_controller.rb
│   │   │   ├── recipes_controller.rb
│   │   │   ├── user_ingredients_controller.rb
│   │   │   └── users_controller.rb
│   │   ├── models/                   # ActiveRecord models
│   │   │   ├── category.rb
│   │   │   ├── cuisine.rb
│   │   │   ├── ingredient.rb
│   │   │   ├── recipe.rb
│   │   │   ├── recipe_ingredient.rb
│   │   │   ├── user.rb
│   │   │   └── user_ingredient.rb
│   │   ├── services/                 # Business logic layer
│   │   │   ├── category_service.rb
│   │   │   ├── cuisine_service.rb
│   │   │   ├── ingredient_service.rb
│   │   │   ├── recipe_service.rb
│   │   │   ├── user_ingredient_service.rb
│   │   │   └── user_service.rb
│   │   └── validation_schemas/       # Dry-validation contracts
│   │       ├── category_validation_schema.rb
│   │       ├── common_validation_schema.rb
│   │       ├── ingredient_validation_schema.rb
│   │       ├── recipe_validation_schema.rb
│   │       ├── user_ingredient_validation_schema.rb
│   │       └── user_validation_schema.rb
│   ├── config/
│   │   ├── routes.rb                 # API routes
│   │   ├── database.yml
│   │   └── initializers/
│   │       ├── cors.rb               # CORS configuration
│   │       └── rack_attack.rb        # Rate limiting configuration
│   ├── db/
│   │   ├── migrate/                  # Database migrations
│   │   ├── recipes_seed_data/        # Recipe seed data
│   │   ├── schema.rb
│   │   └── seeds.rb
│   ├── lib/
│   │   └── tasks/
│   │       └── seed_recipes.rake     # Rake task for seeding recipes
│   ├── spec/                         # RSpec test suite
│   │   ├── requests/                 # Request specs
│   │   │   ├── categories_spec.rb
│   │   │   ├── cuisines_spec.rb
│   │   │   ├── ingredients_spec.rb
│   │   │   ├── recipes_spec.rb
│   │   │   ├── user_ingredients_spec.rb
│   │   │   └── users_spec.rb
│   │   ├── rails_helper.rb
│   │   └── spec_helper.rb
│   ├── docker-compose.yml            # Docker Compose configuration
│   ├── Dockerfile
│   ├── Gemfile
│   └── .rubocop.yml                  # RuboCop configuration
│
├── frontend/                         # React + TypeScript SPA
│   ├── src/
│   │   ├── components/               # Reusable components
│   │   │   └── userIngredientPicker/
│   │   │       ├── UserIngredientPicker.tsx
│   │   │       ├── UserIngredientPicker.test.tsx
│   │   │       └── messages.ts
│   │   ├── hooks/                    # Custom React hooks
│   │   │   ├── useCategories.ts
│   │   │   ├── useCuisines.ts
│   │   │   ├── useIngredients.ts
│   │   │   ├── useRecipeDetails.ts
│   │   │   ├── useRecipes.ts
│   │   │   ├── useUser.ts
│   │   │   └── useUserIngredients.ts
│   │   ├── pages/                    # Page components
│   │   │   ├── home/
│   │   │   │   ├── components/       # Home page sub-components
│   │   │   │   │   ├── CategoryFilter/
│   │   │   │   │   ├── CuisineFilter/
│   │   │   │   │   └── ViewUserIngredients/
│   │   │   │   ├── Home.tsx
│   │   │   │   ├── Home.test.tsx
│   │   │   │   └── messages.ts
│   │   │   ├── recipeDetails/
│   │   │   │   ├── RecipeDetails.tsx
│   │   │   │   ├── RecipeDetails.test.tsx
│   │   │   │   └── messages.ts
│   │   │   ├── register/
│   │   │   │   ├── steps/
│   │   │   │   │   └── AddEmailStep.tsx
│   │   │   │   ├── Register.tsx
│   │   │   │   ├── Register.test.tsx
│   │   │   │   └── messages.ts
│   │   │   └── userIngredients/
│   │   │       ├── components/
│   │   │       │   ├── AddIngredient/
│   │   │       │   ├── EditIngredientModal/
│   │   │       │   └── IngredientList/
│   │   │       ├── UserIngredients.tsx
│   │   │       ├── UserIngredients.test.tsx
│   │   │       └── messages.ts
│   │   ├── services/                 # API service layer
│   │   │   ├── api.ts                # Axios instance
│   │   │   ├── categoryService.ts
│   │   │   ├── cuisineService.ts
│   │   │   ├── ingredientService.ts
│   │   │   ├── recipeService.ts
│   │   │   ├── userIngredientService.ts
│   │   │   └── userService.ts
│   │   ├── types/                    # TypeScript type definitions
│   │   │   └── index.ts
│   │   ├── utils/                    # Utility functions
│   │   │   ├── constants.ts
│   │   │   └── localStorage.ts
│   │   ├── i18n/                     # Internationalization
│   │   │   └── messages.ts
│   │   ├── test/                     # Test utilities
│   │   │   ├── setup.ts
│   │   │   └── testUtils.tsx
│   │   ├── App.tsx                   # Main app component
│   │   └── main.tsx                  # Entry point
│   ├── package.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── eslint.config.js
│   ├── .prettierrc.json
│   └── vercel.json                   # Vercel deployment config
│
├── docker-compose.yml                # Docker Compose Config File For Running The Backend App
└── README.md                         # This file
```

---

## Technical Decisions and Trade-offs

- Before seeding the database with the provided data, I used a Rake script and OpenAI’s API to normalize all recipe ingredients and ensure consistent naming. I didn’t include the script in the repository because it depends on OpenAI’s API to run.

- I added a frontend guide that shows users how to enter ingredients, thereby allowing the app to rely on them for quality data. The trade-off is that bad user inputs can corrupt the normalized dataset I’ve already created, but this only affects newly added ingredients, and anyone who enters good data will still get accurate recommendations. This is acceptable for a prototype, but in a production system I would rely on either OpenAI, some NLP APIs, or a custom machine-learning model to properly normalize whatever ingredients users submit.

- I limited the most relevant recipe list that the API returns to 100 recipes. I assume that users will find something to prepare in that list. This avoids user fatigue from clicking through too many items.

- I limited ingredient search results to 200 items. I assume the ingredient users are looking for will be in the first 200 results. This keeps things simple by avoiding pagination in the user ingredient picker which I feel should be sufficient for this prototype.

- I allow duplicates in the user_ingredients table because users can’t be trusted to enter unique ingredients—for example, they might type “Bottle Water,” “Tap Water,” or “Sachet Water” even though all mean water. Each entry is saved separately, but the system only counts the unique ingredient, so duplicates don’t affect recommendations.

---

## How to Launch the App

You can launch the app either locally, or by visiting the online url.

### Online

You can access the app by visting [https://cookwithtayor.vercel.app](https://cookwithtayor.vercel.app).
Here is a short [demo](https://www.loom.com/share/c3728deb5db94a69876faa7179333059) of how it works.

### Locally

#### Prerequisites

Before running the application locally, ensure you have the following installed:

- **Docker** and **Docker Compose** (for backend) - Download from [Docker](https://www.docker.com/products/docker-desktop/) or [OrbStack](https://orbstack.dev/) (OrbStack only works on Mac)
- **Node.js** (v18 or higher)

#### Backend Setup

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Build and start the database and web services using Docker Compose:**
   ```bash
   docker-compose build
   docker-compose up -d db
   docker-compose up -d web
   ```

   This will:
   - Build the Docker containers
   - Start the PostgreSQL database
   - Build and start the Rails API server
   - Run database migrations automatically
   - Make the API available at `http://localhost:3000`

3. **Seed the database with recipes:**
   ```bash
   docker-compose run --rm migrate rails db:seed_recipes
   ```
   NOTE: This process takes between 10-15 minutes to complete

#### Frontend Setup

1. **Navigate to the frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Create a `.env` file in the `frontend` directory (if needed):
   ```env
   VITE_API_URL=http://localhost:3000
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

   The frontend will be available at `http://localhost:5173` (or the port shown in the terminal).

5. **Configure CORS in the backend:**
   Add the frontend domain to the `ALLOWED_ORIGINS` environment variable in the `backend/docker-compose.yml` file. Update the `ALLOWED_ORIGINS` value to include your frontend URL (use the actual port shown in the terminal, e.g., `http://localhost:5173`):
   ```yaml
   ALLOWED_ORIGINS: http://localhost:5173,http://localhost:5173/
   ```
   
   After updating the docker-compose file, recreate and restart the web container using:
   ```bash
   cd backend
   docker-compose up -d --force-recreate web
   ```

6. **Access the application:**
   Open your browser and navigate to `http://localhost:5173` (or the port shown in the terminal).

---

## How to Run the Tests

### Backend Tests

Make sure you have followed the prerequisites in the [Backend Setup](#backend-setup) section before running tests.

**Run all backend tests:**
```bash
cd backend
docker-compose run --rm test
```

### Frontend Tests

Make sure you have followed the prerequisites in the [Frontend Setup](#frontend-setup) section before running tests.

**Run all frontend tests:**
```bash
cd frontend
npm test
```


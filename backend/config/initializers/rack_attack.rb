# Add Rack::Attack middleware
Rails.application.config.middleware.use Rack::Attack

class Rack::Attack
  # Configure cache store for rate limiting
  Rack::Attack.cache.store = ActiveSupport::Cache::MemoryStore.new

  # Allow all requests in development and test
  if Rails.env.development? || Rails.env.test?
    Rack::Attack.enabled = false
  end

  # Throttle all requests by IP (general rate limit)
  throttle("req/ip", limit: 300, period: 1.minute) do |req|
    req.ip unless req.path.start_with?("/up")
  end

  # Throttle user creation (POST /users)
  throttle("users/create", limit: 5, period: 1.hour) do |req|
    req.ip if req.post? && req.path == "/users"
  end

  # Throttle adding ingredients (POST /users/:user_id/ingredients)
  throttle("ingredients/add", limit: 30, period: 1.minute) do |req|
    if req.post? && req.path.match?(%r{/users/\d+/ingredients$})
      req.ip
    end
  end

  # Throttle listing ingredients (GET /users/:user_id/ingredients)
  throttle("ingredients/list", limit: 60, period: 1.minute) do |req|
    if req.get? && req.path.match?(%r{/users/\d+/ingredients$})
      req.ip
    end
  end

  # Throttle updating ingredient (PUT /users/:user_id/ingredients/:id)
  throttle("ingredients/update", limit: 30, period: 1.minute) do |req|
    if req.put? && req.path.match?(%r{/users/\d+/ingredients/\d+$})
      req.ip
    end
  end

  # Throttle deleting ingredients (DELETE /users/:user_id/ingredients)
  throttle("ingredients/delete", limit: 30, period: 1.minute) do |req|
    if req.delete? && req.path.match?(%r{/users/\d+/ingredients$})
      req.ip
    end
  end

  # Throttle recipe recommendations (GET /users/:user_id/recipes/recommended-recipes)
  throttle("recipes/recommendations", limit: 60, period: 1.minute) do |req|
    if req.get? && req.path.match?(%r{/users/\d+/recipes/recommended-recipes$})
      req.ip
    end
  end

  # Throttle recipe details (GET /users/:user_id/recipes/recommended-recipes/:recipeId)
  throttle("recipes/details", limit: 60, period: 1.minute) do |req|
    if req.get? && req.path.match?(%r{/users/\d+/recipes/recommended-recipes/\d+$})
      req.ip
    end
  end

  # Custom response for throttled requests
  self.throttled_response = lambda do |env|
    match_data = env["rack.attack.match_data"]
    now = match_data[:epoch_time]

    headers = {
      "Content-Type" => "application/json",
      "X-RateLimit-Limit" => match_data[:limit].to_s,
      "X-RateLimit-Remaining" => "0",
      "X-RateLimit-Reset" => (now + (match_data[:period] - now % match_data[:period])).to_s
    }

    body = {
      error: "Too many requests",
      message: "Rate limit exceeded. Please try again later."
    }.to_json

    [ 429, headers, [ body ] ]
  end
end

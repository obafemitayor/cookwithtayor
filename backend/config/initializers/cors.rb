# Be sure to restart your server when you modify this file.

Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    allowed_origins = ENV.fetch("ALLOWED_ORIGINS", "")
                        .split(",")
                        .map(&:strip)
                        .reject(&:empty?)

    origins(*allowed_origins)

    resource "*",
      headers: :any,
      methods: [ :get, :post, :put, :patch, :delete, :options, :head ]
  end
end

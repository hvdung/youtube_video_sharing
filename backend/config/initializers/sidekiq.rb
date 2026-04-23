require 'sidekiq'

# Redis URL
redis_url = ENV.fetch('REDIS_URL', 'redis://localhost:6379/0')

# Configure Sidekiq server
Sidekiq.configure_server do |config|
  config.redis = { url: redis_url, size: 10 }
end

# Configure Sidekiq client
Sidekiq.configure_client do |config|
  config.redis = { url: redis_url, size: 2 }
end

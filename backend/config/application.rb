require_relative "boot"

require "rails"
require "active_model/railtie"
require "active_job/railtie"
require "active_record/railtie"
require "active_storage/engine"
require "action_controller/railtie"
require "action_mailer/railtie"
require "action_mailbox/engine"
require "action_text/engine"
require "action_view/railtie"
require "action_cable/engine"

Bundler.require(*Rails.groups)

module Backend
  class Application < Rails::Application
    config.load_defaults 7.1

    config.api_only = true

    config.filter_parameters += %i[password password_confirmation]

    config.middleware.use ActionDispatch::Session::CookieStore
    config.session_store :cookie_store, key: "_session"
    config.middleware.insert_before 0, Rack::Cors do
      allow do
        origins ENV.fetch("FRONTEND_URL", "http://localhost:4000")
        resource "*",
          headers: :any,
          methods: %i[get post put patch delete options head],
          expose: %w[Authorization Refresh-Token],
          max_age: 600
      end
    end
  end
end

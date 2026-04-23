Rails.application.config.action_cable.url = "/cable"
Rails.application.config.action_cable.allowed_request_origins = [
  ENV.fetch("FRONTEND_URL", "http://localhost:4000"),
  /http:\/\/localhost:.*/
]

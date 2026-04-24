module AuthHelpers
  def jwt_token_for(user)
    Warden::JWTAuth::UserEncoder.new.call(user, :user, nil).first
  end

  def auth_headers(user)
    { "Authorization" => "Bearer #{jwt_token_for(user)}" }
  end
end

RSpec.configure do |config|
  config.include AuthHelpers, type: :request
end

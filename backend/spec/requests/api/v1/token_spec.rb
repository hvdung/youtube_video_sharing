require "rails_helper"

RSpec.describe "POST /api/v1/auth/refresh", type: :request do
  let!(:user) { create(:user) }
  let!(:refresh_token) do
    user.refresh_tokens.create!(
      token: SecureRandom.hex(64),
      expires_at: 30.days.from_now
    )
  end

  describe "with a valid refresh token" do
    it "returns 200 OK" do
      post "/api/v1/auth/refresh", params: { refresh_token: refresh_token.token }, as: :json
      expect(response).to have_http_status(:ok)
    end

    it "returns success message" do
      post "/api/v1/auth/refresh", params: { refresh_token: refresh_token.token }, as: :json
      expect(response.parsed_body["message"]).to eq("Token refreshed successfully")
    end

    it "returns a new refresh_token" do
      post "/api/v1/auth/refresh", params: { refresh_token: refresh_token.token }, as: :json
      expect(response.parsed_body["refresh_token"]).to be_present
      expect(response.parsed_body["refresh_token"]).not_to eq(refresh_token.token)
    end

    it "returns user data" do
      post "/api/v1/auth/refresh", params: { refresh_token: refresh_token.token }, as: :json
      expect(response.parsed_body["user"]["id"]).to eq(user.id)
    end

    it "sets Authorization header with new JWT" do
      post "/api/v1/auth/refresh", params: { refresh_token: refresh_token.token }, as: :json
      expect(response.headers["Authorization"]).to start_with("Bearer ")
    end

    it "rotates the token (old one is destroyed)" do
      post "/api/v1/auth/refresh", params: { refresh_token: refresh_token.token }, as: :json
      expect(RefreshToken.find_by(id: refresh_token.id)).to be_nil
    end

    it "keeps the total refresh token count the same (rotate, not add)" do
      expect {
        post "/api/v1/auth/refresh", params: { refresh_token: refresh_token.token }, as: :json
      }.not_to change(RefreshToken, :count)
    end
  end

  describe "with an expired refresh token" do
    let!(:expired_token) do
      user.refresh_tokens.create!(
        token: SecureRandom.hex(64),
        expires_at: 1.day.ago
      )
    end

    it "returns 401 Unauthorized" do
      post "/api/v1/auth/refresh", params: { refresh_token: expired_token.token }, as: :json
      expect(response).to have_http_status(:unauthorized)
    end

    it "returns error message" do
      post "/api/v1/auth/refresh", params: { refresh_token: expired_token.token }, as: :json
      expect(response.parsed_body["error"]).to eq("Invalid or expired refresh token")
    end
  end

  describe "with an invalid token" do
    it "returns 401 Unauthorized" do
      post "/api/v1/auth/refresh", params: { refresh_token: "not_a_real_token" }, as: :json
      expect(response).to have_http_status(:unauthorized)
    end
  end

  describe "with no token provided" do
    it "returns 400 Bad Request" do
      post "/api/v1/auth/refresh", params: {}, as: :json
      expect(response).to have_http_status(:bad_request)
    end

    it "returns error message" do
      post "/api/v1/auth/refresh", params: {}, as: :json
      expect(response.parsed_body["error"]).to eq("Refresh token is required")
    end
  end
end

require "rails_helper"

RSpec.describe "GET /api/v1/me", type: :request do
  let!(:user) { create(:user) }

  context "when authenticated" do
    it "returns 200 OK" do
      get "/api/v1/me", headers: auth_headers(user)
      expect(response).to have_http_status(:ok)
    end

    it "returns current user data" do
      get "/api/v1/me", headers: auth_headers(user)
      body = response.parsed_body
      expect(body["user"]["id"]).to eq(user.id)
      expect(body["user"]["email"]).to eq(user.email)
      expect(body["user"]["name"]).to eq(user.name)
    end

    it "does not expose sensitive fields like password" do
      get "/api/v1/me", headers: auth_headers(user)
      expect(response.parsed_body["user"].keys).not_to include("encrypted_password", "password")
    end
  end

  context "when not authenticated" do
    it "returns 401 Unauthorized" do
      get "/api/v1/me"
      expect(response).to have_http_status(:unauthorized)
    end

    it "returns error message" do
      get "/api/v1/me"
      expect(response.parsed_body["error"]).to eq("Unauthorized")
    end
  end

  context "with an invalid/expired JWT token" do
    it "returns 401 Unauthorized" do
      get "/api/v1/me", headers: { "Authorization" => "Bearer invalid.token.here" }
      expect(response).to have_http_status(:unauthorized)
    end
  end
end

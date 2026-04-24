require "rails_helper"

RSpec.describe "Sessions", type: :request do
  let!(:user) { create(:user, email: "user@example.com", password: "password123") }

  describe "POST /api/v1/login" do
    context "with valid credentials" do
      let(:params) { { user: { email: "user@example.com", password: "password123" } } }

      it "returns 200 OK" do
        post "/api/v1/login", params: params, as: :json
        expect(response).to have_http_status(:ok)
      end

      it "returns success message" do
        post "/api/v1/login", params: params, as: :json
        expect(response.parsed_body["message"]).to eq("Logged in successfully")
      end

      it "returns user data" do
        post "/api/v1/login", params: params, as: :json
        expect(response.parsed_body["user"]["email"]).to eq("user@example.com")
      end

      it "returns a refresh_token" do
        post "/api/v1/login", params: params, as: :json
        expect(response.parsed_body["refresh_token"]).to be_present
      end

      it "sets Authorization header" do
        post "/api/v1/login", params: params, as: :json
        expect(response.headers["Authorization"]).to start_with("Bearer ")
      end

      it "creates a refresh token in the database" do
        expect {
          post "/api/v1/login", params: params, as: :json
        }.to change(RefreshToken, :count).by(1)
      end
    end

    context "with invalid password" do
      let(:params) { { user: { email: "user@example.com", password: "wrong" } } }

      it "returns 401 Unauthorized" do
        post "/api/v1/login", params: params, as: :json
        expect(response).to have_http_status(:unauthorized)
      end

      it "returns error message" do
        post "/api/v1/login", params: params, as: :json
        expect(response.parsed_body["error"]).to eq("Invalid email or password")
      end
    end

    context "with non-existent email" do
      let(:params) { { user: { email: "nobody@example.com", password: "password123" } } }

      it "returns 401 Unauthorized" do
        post "/api/v1/login", params: params, as: :json
        expect(response).to have_http_status(:unauthorized)
      end
    end

    context "with missing user param" do
      it "returns 400 Bad Request" do
        post "/api/v1/login", params: {}, as: :json
        expect(response).to have_http_status(:bad_request)
      end
    end
  end
end

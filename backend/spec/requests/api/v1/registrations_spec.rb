require "rails_helper"

RSpec.describe "POST /api/v1/signup", type: :request do
  let(:valid_params) do
    {
      user: {
        name: "Test User",
        email: "test@example.com",
        password: "password123",
        password_confirmation: "password123"
      }
    }
  end

  describe "with valid params" do
    it "returns 201 Created" do
      post "/api/v1/signup", params: valid_params, as: :json
      expect(response).to have_http_status(:created)
    end

    it "returns success message" do
      post "/api/v1/signup", params: valid_params, as: :json
      expect(response.parsed_body["message"]).to eq("Registered successfully")
    end

    it "returns user data" do
      post "/api/v1/signup", params: valid_params, as: :json
      user = response.parsed_body["user"]
      expect(user["email"]).to eq("test@example.com")
      expect(user["name"]).to eq("Test User")
    end

    it "creates a new user in the database" do
      expect {
        post "/api/v1/signup", params: valid_params, as: :json
      }.to change(User, :count).by(1)
    end
  end

  describe "with missing name" do
    it "returns 422 Unprocessable Content" do
      params = valid_params.deep_merge(user: { name: nil })
      post "/api/v1/signup", params: params, as: :json
      expect(response).to have_http_status(:unprocessable_content)
    end

    it "returns validation errors" do
      params = valid_params.deep_merge(user: { name: nil })
      post "/api/v1/signup", params: params, as: :json
      expect(response.parsed_body["errors"]).to be_present
    end
  end

  describe "with duplicate email" do
    before { create(:user, email: "test@example.com") }

    it "returns 422 Unprocessable Content" do
      post "/api/v1/signup", params: valid_params, as: :json
      expect(response).to have_http_status(:unprocessable_content)
    end

    it "includes email error message" do
      post "/api/v1/signup", params: valid_params, as: :json
      expect(response.parsed_body["errors"].join).to match(/email/i)
    end
  end

  describe "with mismatched password confirmation" do
    it "returns 422 Unprocessable Content" do
      params = valid_params.deep_merge(user: { password_confirmation: "wrong" })
      post "/api/v1/signup", params: params, as: :json
      expect(response).to have_http_status(:unprocessable_content)
    end
  end
end

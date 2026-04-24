require "rails_helper"

RSpec.describe Api::V1::Videos::DestroyService, type: :service do
  let(:owner)      { create(:user) }
  let(:other_user) { create(:user) }
  # Use let! so the video exists in DB before any example runs
  let!(:video)     { create(:video, user: owner) }

  describe "when the video does not exist" do
    subject(:result) { described_class.new(owner, -1).call }

    it "returns success: false" do
      expect(result[:success]).to be false
    end

    it "returns 'Video not found' message" do
      expect(result[:message]).to eq("Video not found")
    end

    it "returns :not_found status" do
      expect(result[:status]).to eq(:not_found)
    end
  end

  describe "when the current_user is not the owner" do
    subject(:result) { described_class.new(other_user, video.id).call }

    it "returns success: false" do
      expect(result[:success]).to be false
    end

    it "returns an authorization error message" do
      expect(result[:message]).to eq("You are not authorized to delete this video")
    end

    it "returns :forbidden status" do
      expect(result[:status]).to eq(:forbidden)
    end

    it "does not delete the video" do
      expect { result }.not_to change(Video, :count)
    end
  end

  describe "when current_user is nil" do
    subject(:result) { described_class.new(nil, video.id).call }

    it "returns :forbidden status" do
      expect(result[:status]).to eq(:forbidden)
    end

    it "does not delete the video" do
      expect { result }.not_to change(Video, :count)
    end
  end

  describe "when the owner deletes their own video" do
    subject(:result) { described_class.new(owner, video.id).call }

    it "returns success: true" do
      expect(result[:success]).to be true
    end

    it "returns the success message" do
      expect(result[:message]).to eq("Video deleted successfully")
    end

    it "removes the video from the database" do
      expect { result }.to change(Video, :count).by(-1)
    end

    it "does not return a status key" do
      expect(result.key?(:status)).to be false
    end
  end

  describe "when destroy fails" do
    subject(:result) { described_class.new(owner, video.id).call }

    before do
      allow_any_instance_of(Video).to receive(:destroy).and_return(false)
    end

    it "returns success: false" do
      expect(result[:success]).to be false
    end

    it "returns the failure message" do
      expect(result[:message]).to eq("Failed to delete video")
    end

    it "returns :unprocessable_entity status" do
      expect(result[:status]).to eq(:unprocessable_entity)
    end
  end
end

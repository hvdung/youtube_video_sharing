require "rails_helper"

RSpec.describe Api::V1::Videos::CreateService, type: :service do
  subject(:result) { described_class.new(current_user, video_params).call }

  let(:current_user) { create(:user) }
  let(:valid_url)    { "https://www.youtube.com/watch?v=dQw4w9WgXcQ" }
  let(:video_params) { { "url" => valid_url } }

  describe "when the YouTube URL is invalid" do
    let(:video_params) { { "url" => "https://not-youtube.com/watch?v=abc" } }

    it "returns success: false" do
      expect(result[:success]).to be false
    end

    it "returns an error message" do
      expect(result[:message]).to eq("Invalid YouTube URL")
    end

    it "does not enqueue a worker" do
      expect(ShareVideoWorker).not_to receive(:perform_async)
      result
    end
  end

  describe "when the video has already been shared by this user" do
    before do
      create(:video, user: current_user, youtube_id: "dQw4w9WgXcQ")
    end

    it "returns success: false" do
      expect(result[:success]).to be false
    end

    it "sets duplicate: true" do
      expect(result[:duplicate]).to be true
    end

    it "returns the duplicate message" do
      expect(result[:message]).to eq("The video has been shared.")
    end

    it "does not enqueue a worker" do
      expect(ShareVideoWorker).not_to receive(:perform_async)
      result
    end
  end

  describe "when the same video was shared by a different user" do
    before do
      other = create(:user)
      create(:video, user: other, youtube_id: "dQw4w9WgXcQ")
    end

    it "is not treated as a duplicate" do
      allow(ShareVideoWorker).to receive(:perform_async)
      expect(result[:duplicate]).to be_nil
    end

    it "enqueues the worker" do
      expect(ShareVideoWorker).to receive(:perform_async).with(current_user.id, valid_url)
      result
    end
  end

  describe "when the URL is valid and not a duplicate" do
    before { allow(ShareVideoWorker).to receive(:perform_async) }

    it "returns success: true" do
      expect(result[:success]).to be true
    end

    it "returns the processing message" do
      expect(result[:message]).to eq("Video is being processed")
    end

    it "enqueues ShareVideoWorker with correct arguments" do
      expect(ShareVideoWorker).to receive(:perform_async).with(current_user.id, valid_url)
      result
    end
  end

  describe "when the url param is missing" do
    let(:video_params) { {} }

    it "returns success: false" do
      expect(result[:success]).to be false
    end

    it "returns invalid URL message" do
      expect(result[:message]).to eq("Invalid YouTube URL")
    end
  end
end

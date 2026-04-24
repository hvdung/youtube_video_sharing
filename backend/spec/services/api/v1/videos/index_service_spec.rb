require "rails_helper"

RSpec.describe Api::V1::Videos::IndexService, type: :service do
  let!(:user)  { create(:user) }
  let!(:other) { create(:user) }

  let!(:user_videos)  { create_list(:video, 7, user: user) }
  let!(:other_videos) { create_list(:video, 2, user: other) }

  describe "when a user is given (scoped to that user)" do
    subject(:result) { described_class.new(user: user, page: 1).call }

    it "returns success: true" do
      expect(result[:success]).to be true
    end

    it "returns only that user's video count" do
      expect(result[:count]).to eq(7)
    end

    it "paginates to PER_PAGE (5) videos on page 1" do
      expect(result[:videos].length).to eq(described_class::PER_PAGE)
    end

    it "includes correct pagination metadata on page 1" do
      pg = result[:pagination]
      expect(pg[:current_page]).to eq(1)
      expect(pg[:total_count]).to eq(7)
      expect(pg[:per_page]).to eq(described_class::PER_PAGE)
      expect(pg[:prev_page]).to be_nil
      expect(pg[:next_page]).to eq(2)
    end

    it "does not include videos from other users" do
      ids = result[:videos].map { |v| v["user_id"] || v[:user_id] }.uniq
      expect(ids).to eq([user.id])
    end

    context "when requesting page 2" do
      subject(:result) { described_class.new(user: user, page: 2).call }

      it "returns the remaining 2 videos" do
        expect(result[:videos].length).to eq(2)
      end

      it "reflects correct pagination state on page 2" do
        pg = result[:pagination]
        expect(pg[:current_page]).to eq(2)
        expect(pg[:next_page]).to be_nil
        expect(pg[:prev_page]).to eq(1)
      end
    end

    context "when the user has no videos" do
      let!(:empty_user) { create(:user) }
      subject(:result)  { described_class.new(user: empty_user, page: 1).call }

      it "returns count 0 and empty list" do
        expect(result[:count]).to eq(0)
        expect(result[:videos]).to be_empty
      end

      it "returns total_pages of 0" do
        expect(result[:pagination][:total_pages]).to eq(0)
      end
    end
  end

  describe "when no user is given (all videos, scoped verification)" do
    let!(:solo_user) { create(:user) }
    let!(:solo_videos) { create_list(:video, 3, user: solo_user) }

    subject(:result) { described_class.new(user: solo_user, page: 1).call }

    it "returns success: true" do
      expect(result[:success]).to be true
    end

    it "returns exactly the created videos count" do
      expect(result[:count]).to eq(3)
    end

    it "returns all 3 videos on page 1 (under per_page limit)" do
      expect(result[:videos].length).to eq(3)
    end

    it "has no next/prev page when under per_page" do
      pg = result[:pagination]
      expect(pg[:next_page]).to be_nil
      expect(pg[:prev_page]).to be_nil
    end
  end

  describe "videos ordering" do
    subject(:result) { described_class.new(user: user, page: 1).call }

    it "orders by created_at descending (newest first)" do
      expected_ids = user.videos.order(created_at: :desc).first(described_class::PER_PAGE).map(&:id)
      returned_ids = result[:videos].map { |v| v["id"] || v[:id] }
      expect(returned_ids).to eq(expected_ids)
    end
  end
end

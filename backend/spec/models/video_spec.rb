require "rails_helper"

RSpec.describe Video, type: :model do
  describe "associations" do
    it { is_expected.to belong_to(:user) }
  end

  describe "validations" do
    subject { build(:video) }

    it { is_expected.to validate_presence_of(:url) }
    it { is_expected.to validate_presence_of(:youtube_id) }
    it { is_expected.to validate_presence_of(:title) }

    it "validates uniqueness of youtube_id scoped to user_id" do
      is_expected.to validate_uniqueness_of(:youtube_id)
        .scoped_to(:user_id)
        .with_message("You have already shared this video.")
        .ignoring_case_sensitivity
    end
  end

  describe "factory" do
    it "creates a valid video" do
      expect(build(:video)).to be_valid
    end

    it "is invalid without a url" do
      expect(build(:video, url: nil)).not_to be_valid
    end

    it "is invalid without a youtube_id" do
      expect(build(:video, youtube_id: nil)).not_to be_valid
    end

    it "is invalid without a title" do
      expect(build(:video, title: nil)).not_to be_valid
    end
  end

  describe "youtube_id uniqueness scoped to user" do
    let(:user)  { create(:user) }
    let(:other) { create(:user) }
    let!(:existing) { create(:video, user: user, youtube_id: "abc12345678") }

    it "is invalid when the same user shares the same youtube_id again" do
      duplicate = build(:video, user: user, youtube_id: "abc12345678")
      expect(duplicate).not_to be_valid
      expect(duplicate.errors[:youtube_id]).to include("You have already shared this video.")
    end

    it "is valid when a different user shares the same youtube_id" do
      other_video = build(:video, user: other, youtube_id: "abc12345678")
      expect(other_video).to be_valid
    end
  end

  describe "destroyed with its user" do
    it "is removed when the owning user is destroyed" do
      user = create(:user)
      create(:video, user: user)

      expect { user.destroy }.to change(Video, :count).by(-1)
    end
  end
end

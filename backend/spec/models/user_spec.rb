require "rails_helper"

RSpec.describe User, type: :model do
  describe "associations" do
    it { is_expected.to have_many(:videos).dependent(:destroy) }
    it { is_expected.to have_many(:refresh_tokens).dependent(:destroy) }
  end

  describe "validations" do
    subject { build(:user) }

    it { is_expected.to validate_presence_of(:email) }
    it { is_expected.to validate_uniqueness_of(:email).case_insensitive }

    it { is_expected.to validate_presence_of(:name) }
    it { is_expected.to validate_length_of(:name).is_at_most(100) }

    it { is_expected.to validate_presence_of(:password) }
  end

  describe "factory" do
    it "creates a valid user" do
      expect(build(:user)).to be_valid
    end

    it "is invalid without an email" do
      expect(build(:user, email: nil)).not_to be_valid
    end

    it "is invalid without a name" do
      expect(build(:user, name: nil)).not_to be_valid
    end

    it "is invalid when name exceeds 100 characters" do
      expect(build(:user, name: "a" * 101)).not_to be_valid
    end

    it "is invalid with a duplicate email" do
      create(:user, email: "same@example.com")
      expect(build(:user, email: "same@example.com")).not_to be_valid
    end
  end

  describe "dependent: :destroy on videos" do
    it "deletes associated videos when user is destroyed" do
      user = create(:user)
      create_list(:video, 3, user: user)

      expect { user.destroy }.to change(Video, :count).by(-3)
    end
  end
end

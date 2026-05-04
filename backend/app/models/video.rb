class Video < ApplicationRecord
  belongs_to :user
  validates :url, presence: true
  validates :youtube_id, presence: true,
                         uniqueness: {
                           scope: :user_id,
                           message: "You have already shared this video."
                         }
  validates :title, presence: true

  has_many :bookmarks, dependent: :destroy

  def self.ransackable_attributes(_auth_object = nil)
    %w[created_at description id thumbnail_url title updated_at url user_id youtube_id]
  end

  def self.ransackable_associations(_auth_object = nil)
    %w[bookmarks user]
  end
end

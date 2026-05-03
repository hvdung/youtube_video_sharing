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
end

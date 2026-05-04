class Bookmark < ApplicationRecord
  belongs_to :user
  belongs_to :video

  validates :user_id, uniqueness: { scope: :video_id }

  def self.ransackable_attributes(_auth_object = nil)
    %w[created_at id noted updated_at user_id video_id]
  end

  def self.ransackable_associations(_auth_object = nil)
    %w[user video]
  end
end

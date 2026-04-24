class VideoSerializer < ActiveModel::Serializer
  attributes :id, :url, :youtube_id, :title, :thumbnail_url, :description, :user_email, :user_id

  def user_email
    object.user&.email
  end

  delegate :user_id, to: :object
end

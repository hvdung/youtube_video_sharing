class VideoSerializer < ActiveModel::Serializer
  attributes :id, :url, :youtube_id, :title, :thumbnail_url, :description, :user_email, :user_id

  def user_email
    object.user&.email
  end

  def user_id
    object.user_id
  end
end

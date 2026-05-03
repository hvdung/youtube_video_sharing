class BookmarkSerializer < ActiveModel::Serializer
  attributes :id, :user_id, :video_id, :noted

  belongs_to :user
  belongs_to :video, serializer: VideoSerializer
end

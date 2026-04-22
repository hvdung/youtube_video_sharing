class VideoSerializer < ActiveModel::Serializer
  attributes :id, :url, :youtube_id, :title, :thumbnail_url, :description
end

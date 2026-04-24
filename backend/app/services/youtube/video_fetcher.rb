module Youtube
  class VideoFetcher
    class VideoNotFound < StandardError; end
    class ApiError < StandardError; end

    attr_reader :youtube_id

    def self.call(youtube_id)
      new(youtube_id).call
    end

    def initialize(youtube_id)
      @youtube_id = youtube_id
    end

    def call
      video = Yt::Video.new(id: youtube_id)

      raise VideoNotFound, "Video not found" if video.title.blank?

      {
        youtube_id: youtube_id,
        title: video.title,
        description: video.description,
        thumbnail_url: video.thumbnail_url(:high),
        channel_title: video.channel_title
      }
    rescue Yt::Errors::NoItems
      raise VideoNotFound, "Video not found or is private"
    rescue Yt::Errors::RequestError => e
      raise ApiError, "YouTube API error: #{e.message}"
    end
  end
end
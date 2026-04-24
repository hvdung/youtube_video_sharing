module Youtube
  class IdParser
    # Parse YouTube video ID from various URL formats
    # Supported formats:
    #   - https://www.youtube.com/watch?v=VIDEO_ID
    #   - https://youtu.be/VIDEO_ID
    #   - https://www.youtube.com/embed/VIDEO_ID
    #   - https://www.youtube.com/v/VIDEO_ID

    YOUTUBE_REGEX = %r{
      (?:https?://)?
      (?:www\.)?
      (?:
        youtube\.com/(?:watch\?v=|embed/|v/) |
        youtu\.be/
      )
      ([\w-]{11})  # YouTube video IDs are always 11 characters
    }xi.freeze

    attr_reader :url

    def self.call(url)
      new(url).call
    end

    def initialize(url)
      @url = url
    end

    def call
      return nil if url.blank?

      match = url.match(YOUTUBE_REGEX)
      match ? match[1] : nil
    end
  end
end

class VideosChannel < ApplicationCable::Channel
  def subscribed
    stream_from "videos_feed"
  end

  def unsubscribed
    stop_all_streams
  end
end

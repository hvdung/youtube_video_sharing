class ShareVideoWorker
  include Sidekiq::Worker
  sidekiq_options queue: :default, retry: 3

  def perform(user_id, video_url)
    user = User.find_by(id: user_id)
    return logger.warn "User #{user_id} not found" unless user

    youtube_id = Youtube::IdParser.call(video_url)
    return logger.warn "Invalid YouTube URL: #{video_url}" if youtube_id.nil?

    video_info = Youtube::VideoFetcher.call(youtube_id)

    video = user.videos.create!(
      url:           video_url,
      youtube_id:    video_info[:youtube_id],
      title:         video_info[:title],
      description:   video_info[:description],
      thumbnail_url: video_info[:thumbnail_url]
    )

    logger.info "Video created successfully: #{video.title} (ID: #{video.id})"

    # Broadcast notification
    # ActionCable.server.broadcast("notifications", {
    #   type:      "new_video",
    #   video_id:  video.id,
    #   title:     video.title,
    #   shared_by: user.email
    # })

  rescue Youtube::VideoFetcher::VideoNotFound => e
    logger.error "Video not found: #{e.message}"

  rescue Youtube::VideoFetcher::ApiError => e
    logger.error "YouTube API error: #{e.message}"
    raise e # Sidekiq tự retry
  end
end

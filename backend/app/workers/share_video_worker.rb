class ShareVideoWorker
  include Sidekiq::Worker

  sidekiq_options queue: :default, retry: 3

  def perform(user_id, video_url)
    user = find_user!(user_id)
    video = create_video!(user, video_url)
    broadcast(video)
  rescue ActiveRecord::RecordNotFound
    logger.warn "User #{user_id} not found"
  rescue ActiveRecord::RecordNotUnique
    logger.warn "Duplicate video for user #{user_id}, skipping"
  rescue Youtube::VideoFetcher::VideoNotFound => e
    logger.error "Video not found: #{e.message}"
  rescue Youtube::VideoFetcher::ApiError => e
    logger.error "YouTube API error: #{e.message}"
    raise e
  end

  private

  def find_user!(user_id)
    User.find(user_id)
  end

  def create_video!(user, video_url)
    youtube_id = Youtube::IdParser.call(video_url)
    return if youtube_id.nil?

    video_info = Youtube::VideoFetcher.call(youtube_id)
    user.videos.create!(
      url: video_url,
      youtube_id: video_info[:youtube_id],
      title: video_info[:title],
      description: video_info[:description],
      thumbnail_url: video_info[:thumbnail_url]
    )
  end

  def broadcast(video)
    ActionCable.server.broadcast("videos_feed", broadcast_payload(video))
  end

  def broadcast_payload(video)
    {
      type: "new_video",
      user_id: video.user_id,
      video_id: video.id,
      title: video.title,
      shared_by: video.user.email
    }
  end
end
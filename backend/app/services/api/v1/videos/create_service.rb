module Api
  module V1
    module Videos
      class CreateService
        attr_reader :current_user, :video_params

        def initialize(current_user, video_params)
          @current_user = current_user
          @video_params = video_params
        end

        def call
          url = share_video_url
          youtube_id = Youtube::IdParser.call(url)

          return { success: false, message: "Invalid YouTube URL" } if youtube_id.nil?

          if current_user.videos.exists?(youtube_id: youtube_id)
            return { success: false, duplicate: true, message: "The video has been shared." }
          end

          ::ShareVideoWorker.perform_async(current_user.id, url)
          { success: true, message: "Video is being processed" }
        end

        private

        def share_video_url
          video_params["url"]
        end
      end
    end
  end
end

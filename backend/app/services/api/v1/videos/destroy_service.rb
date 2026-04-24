module Api
  module V1
    module Videos
      class DestroyService
        attr_reader :current_user, :video_id

        def initialize(current_user, video_id)
          @current_user = current_user
          @video_id = video_id
        end

        def call
          return error_response("Video not found", :not_found) unless video

          unless video.user_id == current_user&.id
            return error_response("You are not authorized to delete this video", :forbidden)
          end

          if video.destroy
            success_response
          else
            error_response("Failed to delete video", :unprocessable_entity)
          end
        end

        private

        def video
          return @video if defined?(@video)

          @video = Video.find_by(id: video_id)
        end

        def success_response
          {
            success: true,
            message: "Video deleted successfully"
          }
        end

        def error_response(message, status)
          {
            success: false,
            message: message,
            status: status
          }
        end
      end
    end
  end
end

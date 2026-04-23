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
          ::ShareVideoWorker.perform_async(current_user.id, share_video_url)
        end

        private

        def share_video_url
          video_params["url"]
        end
      end
    end
  end
end

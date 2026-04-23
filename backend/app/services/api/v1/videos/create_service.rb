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
          {
            success: true,
            message: 'Video created successfully',
          }
        end
      end
    end
  end
end

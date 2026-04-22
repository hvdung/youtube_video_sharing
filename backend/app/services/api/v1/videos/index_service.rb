module Api
  module V1
    module Videos
      class IndexService
        attr_reader :user

        def initialize(user: nil)
          @user = user
        end

        def call
          scope = user ? user.videos : Video.all
          videos = scope.includes(:user).order(created_at: :desc)
          
          {
            success: true,
            videos: videos.map { |video| VideoSerializer.new(video).as_json },
            count: videos.count
          }
        end
      end
    end
  end
end

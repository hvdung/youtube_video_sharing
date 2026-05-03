module Api
  module V1
    module Bookmarks
      class CreateService
        attr_reader :current_user, :bookmark_params

        def initialize(current_user, bookmark_params)
          @current_user = current_user
          @bookmark_params = bookmark_params
        end

        def call
          video = Video.find_by(id: bookmark_params[:video_id])
          return { success: false, message: "Video not found" } unless video

          bookmark = current_user.bookmarks.new(video: video, noted: bookmark_params[:noted])

          if bookmark.save
            { success: true, bookmark: BookmarkSerializer.new(bookmark).as_json }
          else
            if bookmark.errors.details[:user_id]&.any? { |error| error[:error] == :taken }
              { success: false, duplicate: true, message: "You have already bookmarked this video." }
            else
              { success: false, message: bookmark.errors.full_messages.join(", ") }
            end
          end
        end
      end
    end
  end
end

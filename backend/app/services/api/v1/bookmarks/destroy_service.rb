module Api
  module V1
    module Bookmarks
      class DestroyService
        attr_reader :current_user, :bookmark_id

        def initialize(current_user, bookmark_id)
          @current_user = current_user
          @bookmark_id = bookmark_id
        end

        def call
          bookmark = Bookmark.find_by(id: bookmark_id)
          return { success: false, message: "Bookmark not found", status: :not_found } unless bookmark

          unless bookmark.user_id == current_user&.id
            return { success: false, message: "You are not authorized to delete this bookmark", status: :forbidden }
          end

          if bookmark.destroy
            { success: true, message: "Bookmark deleted successfully" }
          else
            { success: false, message: "Failed to delete bookmark", status: :unprocessable_entity }
          end
        end
      end
    end
  end
end

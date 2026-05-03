module Api
  module V1
    module Bookmarks
      class IndexService
        PER_PAGE = 5

        attr_reader :user, :page

        def initialize(user: nil, page: 1)
          @user = user
          @page = page.to_i
        end

        def call
          return { success: false, error: "User not found" } unless user

          scope = user.bookmarks
          base   = scope.includes(:video).order(created_at: :desc)
          paged  = base.page(@page).per(PER_PAGE)

          {
            success: true,
            bookmarks: paged.map { |bookmark| BookmarkSerializer.new(bookmark).as_json },
            count: base.count,
            pagination: {
              current_page: paged.current_page,
              total_pages: paged.total_pages,
              total_count: paged.total_count,
              per_page: PER_PAGE,
              next_page: paged.next_page,
              prev_page: paged.prev_page
            }
          }
        end
      end
    end
  end
end

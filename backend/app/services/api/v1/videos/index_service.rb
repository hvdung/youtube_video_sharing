module Api
  module V1
    module Videos
      class IndexService
        PER_PAGE = 5

        attr_reader :user, :page

        def initialize(user: nil, page: 1)
          @user = user
          @page = page.to_i
        end

        def call
          scope = user ? user.videos : Video.all
          base   = scope.includes(:user).order(created_at: :desc)
          paged  = base.page(@page).per(PER_PAGE)

          {
            success: true,
            videos: paged.map { |video| VideoSerializer.new(video).as_json },
            count: base.count,
            pagination: {
              current_page:  paged.current_page,
              total_pages:   paged.total_pages,
              total_count:   paged.total_count,
              per_page:      PER_PAGE,
              next_page:     paged.next_page,
              prev_page:     paged.prev_page
            }
          }
        end
      end
    end
  end
end

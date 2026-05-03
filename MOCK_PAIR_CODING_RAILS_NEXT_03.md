# Mock Pair Coding 3 - Rails + Next.js (System Design Lite + Execution)

## 1) Context bai toan

Ban dang join 1 team co app chia se video (Rails API + Next.js).
He thong da chay production, nhung gap van de:
1. Feed cham khi luong user tang.
2. Search title khong on dinh khi du lieu lon.
3. Notification realtime bi drop hoac den cham.
4. Khi deploy version moi, user thinh thoang bi logout.

Interviewer muon ban vua code duoc, vua ra quyet dinh architecture hop ly trong 90-120 phut.

---

## 2) De bai mock 3

### Muc tieu
Implement va present 1 giai phap "Trending Feed" co kha nang scale co ban:
1. Endpoint feed tra ve danh sach video trend (score dua tren likes + recency).
2. Co filter theo keyword va category.
3. Co cache de giam tai DB.
4. Co co che graceful fallback neu Redis loi.
5. Frontend dung TanStack Query + stale-while-revalidate UX.

### Functional requirements
1. API: `GET /api/v1/videos/trending`
2. Query params:
- `page` default 1
- `q` optional
- `category` optional
- `window` in `[24h, 7d]` default `24h`
3. Response:
- `videos`
- `count`
- `pagination`
- `meta` (cache_hit, generated_at)
4. Frontend:
- search input
- category dropdown
- window switch
- pagination
- loading / error / empty states

### Non-functional requirements
1. p95 endpoint < 300ms voi du lieu tam 100k videos.
2. Neu Redis down, API van tra ket qua tu DB (co cham hon).
3. Tranh N+1 query.
4. Co test cho cache hit/miss va fallback.

---

## 3) Scope theo phase (90-120 phut)

### Phase A - Clarify (10 phut)
Hoi nhanh interviewer:
1. Cong thuc trending score co fix hay duoc tinh don gian?
2. Category la string hay enum?
3. Search uu tien exact hay contains?
4. Cache TTL mong muon bao lau?
5. Co chap nhan eventual consistency khong?

### Phase B - Backend execution (35-45 phut)
1. Tao endpoint trending trong Rails.
2. Implement query object/service `TrendingVideosQuery`.
3. Them cache key theo params (`page,q,category,window`).
4. Neu cache read/write fail -> rescue va fallback query DB.
5. Request spec cho:
- default case
- with filters
- cache miss -> hit
- Redis error fallback

### Phase C - Frontend execution (30-40 phut)
1. Tao query keys chuan hoa:
- `['videos', 'trending', page, q, category, window]`
2. Tao hook dung chung:
- `useTrendingVideosQuery(...)`
3. UI controls: search + category + window.
4. Debounce search 300ms.
5. Keep previous data khi doi page/filter.

### Phase D - Wrap-up (10-20 phut)
1. Explain bottleneck va cach toi uu tiep theo.
2. Neu con thoi gian: prefetch page ke tiep.
3. Neu con thoi gian: add simple telemetry log.

---

## 4) Mock interviewer script

### Opening
"Hay giup team them Trending Feed co cache va fallback khi Redis co van de. Em duoc uu tien cach nghi va kha nang chia nho task."

### Cau hoi trong luc code
1. "Tai sao em dat cache key nhu vay?"
2. "Neu cache stampede xay ra thi xu ly sao?"
3. "Neu score can update lien tuc, cache co stale qua khong?"
4. "Tai sao em chon debounce 300ms, khong phai 100ms/500ms?"
5. "Neu user doi filter lien tuc, request nao duoc giu lai?"

### Follow-up
1. "Lam sao tich hop ranking tu Sidekiq precompute?"
2. "Neu can multi-region, cache strategy doi the nao?"
3. "Lam sao test ActionCable event voi trending feed?"

---

## 5) Suggested implementation notes

## Backend (Rails)

### Query object pseudo
```rb
class TrendingVideosQuery
  def initialize(scope: Video.all, q: nil, category: nil, window: '24h')
    @scope = scope
    @q = q.to_s.strip
    @category = category.to_s.strip
    @window = %w[24h 7d].include?(window) ? window : '24h'
  end

  def call
    s = @scope.includes(:user)
    s = s.where('title LIKE ?', "%#{@q}%") if @q.present?
    s = s.where(category: @category) if @category.present?
    from_time = @window == '7d' ? 7.days.ago : 24.hours.ago
    s = s.where('created_at >= ?', from_time)

    # score don gian: likes_count * 2 + comments_count - age_hours * 0.1
    s.select('videos.*, (likes_count * 2 + comments_count) AS trend_score')
     .order('trend_score DESC, created_at DESC')
  end
end
```

### Controller pseudo voi cache fallback
```rb
def trending
  page = [params[:page].to_i, 1].max
  q = params[:q]
  category = params[:category]
  window = params[:window]

  cache_key = [
    'trending_v1', page, q.to_s.downcase, category.to_s.downcase, window.to_s
  ].join(':')

  payload = nil
  cache_hit = false

  begin
    payload = Rails.cache.read(cache_key)
    cache_hit = payload.present?
  rescue => e
    Rails.logger.warn("cache_read_failed key=#{cache_key} err=#{e.class}")
  end

  unless payload
    scope = TrendingVideosQuery.new(q: q, category: category, window: window).call
    videos = scope.page(page).per(10)

    payload = {
      success: true,
      videos: VideoSerializer.render_as_hash(videos),
      count: scope.count,
      pagination: {
        current_page: videos.current_page,
        total_pages: videos.total_pages,
        total_count: videos.total_count,
        per_page: videos.limit_value,
        next_page: videos.next_page,
        prev_page: videos.prev_page
      }
    }

    begin
      Rails.cache.write(cache_key, payload, expires_in: 60.seconds)
    rescue => e
      Rails.logger.warn("cache_write_failed key=#{cache_key} err=#{e.class}")
    end
  end

  render json: payload.merge(meta: { cache_hit: cache_hit, generated_at: Time.current.iso8601 })
end
```

### Test checklist
1. Co tra `meta.cache_hit` dung hanh vi.
2. Invalid `window` fallback `24h`.
3. Redis error khong lam endpoint 500.
4. Query includes user, tranh N+1.

## Frontend (Next.js + TanStack Query)

### Query key + hook pseudo
```ts
const queryKey = ['videos', 'trending', page, debouncedQ, category, window]

const query = useQuery({
  queryKey,
  queryFn: () => videoService.getTrending({ page, q: debouncedQ, category, window }),
  placeholderData: keepPreviousData,
  staleTime: 30_000,
})
```

### UX checklist
1. Doi search/category/window -> reset page ve 1.
2. Debounce search de giam request.
3. Hien thi "updating" khi isFetching = true va da co data cu.
4. Error state co nut retry.

---

## 6) Rubric cham diem (10 diem)

1. Requirement clarification: 1.5
2. API design + fallback robustness: 2.5
3. Data/query performance thinking: 2.0
4. Frontend data fetching architecture: 2.0
5. Communication + trade-off: 2.0

Moc danh gia:
- 8.5-10: Strong hire
- 7.0-8.0: Hire
- 6.0-6.5: Lean no hire
- <6.0: No hire

---

## 7) Cac diem interviewer rat de danh gia cao

1. Ban noi ro assumptions truoc khi code.
2. Ban uu tien API contract va error handling.
3. Ban chu dong xu ly fallback thay vi de crash.
4. Ban giai thich vi sao query key gom day du params.
5. Ban ket thuc bang list rui ro + next optimization.

---

## 8) Mini self-review sau buoi mock

1. Ban co clarify du 5 cau hoi dau buoi khong?
2. Ban co bo sot edge case nao quan trong khong?
3. Ban co giai thich duoc tai sao chon TTL cache do khong?
4. Ban co timeline ro rang (A/B/C/D phases) khong?
5. Neu lam lai, ban se toi uu dau tien o dau?

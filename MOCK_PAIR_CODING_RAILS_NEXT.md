# Mock Pair Coding Rails + Next.js (Phong cách phỏng vấn)

## 1) Mục tiêu buổi mock

Bạn sẽ luyện 1 bài pair coding bám sát stack hiện tại:
- Backend: Rails API
- Frontend: Next.js
- Auth: JWT (Bearer)
- Luồng dữ liệu: list + create + realtime refresh

Mục tiêu đánh giá:
1. Làm rõ yêu cầu (clarify requirement)
2. Chia nhỏ task và triển khai nhanh
3. Viết code sạch, dễ mở rộng
4. Debug và giải thích trade-off
5. Giao tiếp trong lúc pair coding

---

## 2) Đề bài mock

### Bài toán
Thêm tính năng "Saved Videos + Personal Notes" cho user đã đăng nhập:
1. User có thể save (bookmark) video vào danh sách cá nhân.
2. User có thể unsave video khỏi danh sách cá nhân.
3. User có thể thêm/sửa ghi chú riêng cho từng video đã save (private note).
4. Trang saved videos hỗ trợ search, sort, pagination.

### Functional requirements
1. API saved videos trả về:
- `videos`
- `count`
- `pagination`
2. Hỗ trợ query params cho saved videos:
- `page` (mặc định 1)
- `q` (optional, lọc theo title)
- `sort` trong `[recently_saved, title_asc]` (mặc định `recently_saved`)
3. API save/unsave:
- `POST /api/v1/videos/:id/save`
- `DELETE /api/v1/videos/:id/save`
4. API note:
- `PATCH /api/v1/videos/:id/save_note`
- body: `{ note: string }`
5. Frontend có:
- nút bookmark/unbookmark trên video card
- ở saved list có form edit note inline
- trang saved videos có search + sort + pagination
- loading, empty, error state
6. Note có giới hạn độ dài (ví dụ 280 ký tự) và có validate backend.

### Non-functional requirements
1. Validate params backend, không crash.
2. Response shape ổn định.
3. Frontend tránh duplicate mutation khi user click nhanh.
4. Code dễ test.

---

## 3) Scope implementation trong buổi mock (60-90 phút)

### Phase A - Clarify (5-10 phút)
Hỏi interviewer:
1. Bookmark là toggle endpoint hay tách add/remove?
2. Note là private hoàn toàn hay owner của video cũng thấy?
3. Giới hạn note length và ký tự đặc biệt là gì?
4. Sort `title_asc` có cần locale-aware sort không?
5. Có cần realtime sync saved list giữa nhiều tab không?

### Phase B - Backend (20-30 phút)
Làm endpoint saved videos + save/unsave + update note.

Checklist:
1. Controller parse params an toàn
2. Query object/scope rõ ràng cho saved list
3. Serializer giữ schema nhất quán
4. Có request test cho 4 case:
- bookmark video
- unbookmark video
- update note valid/invalid
- list saved videos with sort + q

### Phase C - Frontend (20-30 phút)
Cập nhật màn saved videos:
1. Dùng TanStack Query để fetch theo key:
- `['savedVideos', page, q, sort]`
2. Tạo mutation bookmark/unbookmark có optimistic update
3. Search input + debounce 300ms
4. Sort select + reset page về 1 khi đổi q/sort
5. Update note inline, disable nút Save khi không thay đổi nội dung

### Phase D - Wrap-up (10-15 phút)
1. Chạy qua edge cases
2. Giải thích trade-offs
3. Nếu còn thời gian: add prefetch page kế tiếp

---

## 4) Mock interviewer script (để bạn tự luyện)

### Opening
"Hãy implement Saved Videos + Personal Notes cho user. Bạn có thể bắt đầu bằng clarify requirement và đưa ra implementation plan ngắn."

### Trong lúc code
Interviewer có thể hỏi:
1. "Tại sao em chọn query key này?"
2. "Nếu user click bookmark liên tục thì tránh double write thế nào?"
3. "Nếu user sửa note liên tục thì tránh spam API ra sao?"
4. "Nếu backend trả lời chậm, optimistic update rollback như nào?"
5. "Nếu số lượng saved videos rất lớn thì query DB tối ưu sao?"

### Follow-up
1. "Nếu bỏ pagination, dùng infinite scroll được không?"
2. "Làm sao đồng bộ note khi user mở 2 tab?"
3. "Nếu cần offline support tạm thời thì làm thế nào?"

---

## 5) Gợi ý hướng triển khai

## Backend (Rails)

### Controller pseudo
```rb
# GET /api/v1/saved_videos?page=1&q=abc&sort=recently_saved
page = [params[:page].to_i, 1].max
q = params[:q].to_s.strip
sort = params[:sort].in?(%w[recently_saved title_asc]) ? params[:sort] : 'recently_saved'

scope = current_user.saved_videos.includes(:user)
scope = scope.where('videos.title LIKE ?', "%#{q}%") if q.present?
scope = if sort == 'title_asc'
  scope.order('videos.title ASC')
else
  scope.order('saved_videos.created_at DESC')
end

videos = scope.page(page).per(10)
render json: {
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
```

### Request specs nên có
1. bookmark video success
2. unbookmark video success
3. update note valid/invalid
4. invalid sort -> fallback recently_saved

## Frontend (Next.js + TanStack Query)

### Query key
```ts
['savedVideos', page, debouncedQ, sort]
```

### Hook pseudo
```ts
const { data, isLoading, error, refetch } = useQuery({
  queryKey: ['savedVideos', page, debouncedQ, sort],
  queryFn: () => videoService.getSavedVideos({ page, q: debouncedQ, sort }),
  keepPreviousData: true,
})
```

### UX checklist
1. typing search -> debounce 300ms
2. đổi sort -> reset page = 1
3. đổi q -> reset page = 1
4. bookmark/unbookmark optimistic update + rollback
5. note edit inline + debounce save hoặc explicit save button

---

## 6) Rubric chấm điểm (10 điểm)

1. Requirement clarification: 2.0
2. Correctness end-to-end: 3.0
3. Code structure & readability: 2.0
4. Testing mindset: 1.5
5. Communication & trade-off: 1.5

Mốc đánh giá:
- 8.5-10: Strong hire
- 7.0-8.0: Hire
- 6.0-6.5: Lean no hire (cần coaching)
- <6.0: No hire

---

## 7) Các lỗi thường gặp trong pair coding

1. Nhảy vào code ngay, không clarify.
2. Query key thiếu param -> cache sai.
3. Không reset pagination khi filter thay đổi.
4. Optimistic update không rollback khi mutation fail.
5. Save note mỗi ký tự 1 request gây tốn tài nguyên.

---

## 8) Mẫu cách nói khi pair coding (bạn có thể luyện đọc)

"Em sẽ chốt requirement trong 1 phút: saved videos có search/sort/page, có bookmark toggle và personal note. Em chia 3 bước: API contract, query+mutation hooks, sau đó tối ưu UX và xử lý note update."

"Em chọn TanStack Query key gồm page, q, sort để cache đúng theo từng bộ lọc. Em thêm optimistic update cho bookmark và rollback nếu server fail."

"Nếu được em sẽ thêm request spec cho note validation và invalid sort fallback recently_saved, vì đây là edge case production dễ gặp."

---

## 9) Bài tập mở rộng nếu còn thời gian

1. Add server-side validation + standardized error JSON.
2. Add optimistic update cho inline note.
3. Add integration test frontend cho saved videos + bookmark toggle.
4. Add cache headers cho saved videos endpoint.

---

## 10) Cách dùng file này để luyện

1. Set timer 75 phút.
2. Đọc đề bài trong 2 phút.
3. Tự nói phần clarify trong 5 phút.
4. Code backend + frontend theo phase.
5. Tự đánh giá theo rubric.
6. Note 3 điểm cần cải thiện cho lần sau.

---

## 11) Mock 2 (Hard) - Auth Refresh Rotation + Idempotent Share + Realtime Consistency

### Bài toán
Nâng cấp hệ thống auth + share video để xử lý được case production khó:
1. Access token hết hạn -> tự động refresh và retry request 1 lần.
2. Refresh token phải rotation (mỗi lần refresh cấp refresh token mới, token cũ bị revoke).
3. Share video phải idempotent theo request key để tránh duplicate khi user bấm nhiều lần.
4. UI feed phải nhất quán khi vừa share xong và cùng lúc nhận ActionCable event.

### Functional requirements
1. Thêm endpoint `POST /api/v1/refresh`:
- Nhận refresh token hợp lệ
- Trả về access token mới + refresh token mới
- Revoke refresh token cũ
2. Frontend interceptor:
- Khi 401 thì xếp hàng request đang lỗi
- Chỉ cho 1 refresh call đang chạy
- Refresh thành công thì replay queue
- Refresh thất bại thì logout
3. Share video API:
- Nhận `Idempotency-Key` header
- Cùng key trong 5 phút -> trả kết quả đã có, không tạo bản ghi mới
4. Feed consistency:
- Sau create success, invalidate query feed
- Nếu ActionCable cùng đến, không duplicate item trên UI

### Non-functional requirements
1. Không race condition khi 5 request cùng 401.
2. Log có correlation id để trace request refresh/share.
3. Không lộ token qua log.
4. Có test cho token replay và idempotency.

---

## 12) Scope implementation Mock 2 (90-120 phút)

### Phase A - Clarify (10 phút)
1. Refresh token lưu DB hay stateless?
2. Rotation cho phép lệch thời gian bao lâu?
3. Idempotency key do client tạo hay server tạo?
4. Duplicate definition: duplicate theo user + youtube_id hay key?
5. Nếu refresh fail do revoked thì UX mong muốn là gì?

### Phase B - Backend (35-45 phút)
1. `RefreshTokensController#create`
2. Service object: verify -> rotate -> issue jwt
3. Idempotency table hoặc cache layer cho share request
4. Request specs:
- refresh success
- refresh with revoked token
- concurrent refresh (1 success, 1 fail)
- share with same idempotency key does not duplicate

### Phase C - Frontend (35-45 phút)
1. Axios interceptor queue for 401
2. Add lock `isRefreshing`
3. Store pending requests and replay after refresh
4. Share mutation tạo `Idempotency-Key` (uuid)
5. Invalidate query keys sau share/delete

### Phase D - Wrap-up (10-20 phút)
1. Walk through race conditions
2. Explain security trade-off
3. Nếu còn thời gian: add basic metrics (refresh success rate)

---

## 13) Mock interviewer script (Hard)

### Opening
"Hệ thống của em bị duplicate share và user bị random logout khi token hết hạn đồng loạt. Em hãy fix theo hướng production-ready."

### Trong lúc code
1. "Nếu 10 request cùng 401 thì em tránh refresh storm bằng cách nào?"
2. "Refresh token rotation có lợi ích gì so với refresh token static?"
3. "Idempotency key nên lưu bao lâu?"
4. "Nếu user bấm F5 giữa lúc refresh đang chạy thì sao?"
5. "Làm sao prove là không duplicate UI item khi event + refetch cùng xảy ra?"

### Follow-up
1. "Làm sao scale idempotency khi có nhiều app server?"
2. "Nếu migrate sang http-only cookie thì đổi interceptor thế nào?"
3. "Cần bổ sung monitoring nào để bắt lỗi sớm?"

---

## 14) Suggested implementation notes (Hard)

## Backend (Rails)

### Refresh rotation flow pseudo
```rb
# POST /api/v1/refresh
token = params[:refresh_token].to_s
record = RefreshToken.active.find_by(token: Digest::SHA256.hexdigest(token))
return unauthorized unless record

ActiveRecord::Base.transaction do
  record.update!(revoked_at: Time.current)
  new_refresh_plain = SecureRandom.hex(64)
  RefreshToken.create!(
    user: record.user,
    token: Digest::SHA256.hexdigest(new_refresh_plain),
    expires_at: 30.days.from_now
  )
  access = JwtIssuer.issue(record.user_id)
  render json: { access_token: access, refresh_token: new_refresh_plain }
end
```

### Idempotent share pseudo
```rb
key = request.headers['Idempotency-Key'].to_s
return bad_request if key.blank?

cache_key = "share:#{current_user.id}:#{key}"
cached = Rails.cache.read(cache_key)
return render(json: cached, status: :ok) if cached

result = ShareVideoService.call(user: current_user, url: params[:url])
Rails.cache.write(cache_key, result.as_json, expires_in: 5.minutes)
render json: result
```

## Frontend (Next.js)

### Interceptor strategy
1. Request 401 -> push to queue
2. Nếu chưa refresh -> trigger refresh
3. Refresh success -> update token -> replay queue
4. Refresh fail -> clear queue + logout + redirect login

### Share mutation strategy
```ts
const key = crypto.randomUUID()
await apiClient.post('/videos', { url }, {
  headers: { 'Idempotency-Key': key }
})
```

### Query consistency
1. Invalidate `['videos']` sau share/delete
2. Trong UI map by `video.id` để không render duplicate item

---

## 15) Rubric Mock 2 (10 điểm)

1. Race-condition handling: 2.5
2. Security mindset (token rotation/logging): 2.0
3. API design + idempotency correctness: 2.0
4. Frontend resilience + cache consistency: 2.0
5. Communication under pressure: 1.5

Mốc đánh giá:
- 8.5-10: Strong hire
- 7.0-8.0: Hire
- 6.0-6.5: Lean no hire
- <6.0: No hire

---

## 16) Danh sách edge cases bạn nên tự test

1. Access token hết hạn trong lúc đang paging feed.
2. 3 tab browser cùng refresh token cùng lúc.
3. Share cùng một youtube url với 2 idempotency key khác nhau.
4. ActionCable event đến trước response share.
5. Backend timeout ở refresh endpoint.
6. Clock skew giữa client và server.

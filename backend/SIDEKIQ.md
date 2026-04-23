# Sidekiq Configuration

## Overview
Sidekiq được cấu hình để xử lý background jobs với Redis làm message queue.

## Services
- **Redis**: Port 6379 - Message broker cho Sidekiq
- **Sidekiq**: Worker process xử lý background jobs

## Configuration Files

### 1. config/sidekiq.yml
Cấu hình chính của Sidekiq:
- Concurrency: Số worker threads
- Queues: Danh sách các queue và priority
- Environment-specific settings

### 2. config/initializers/sidekiq.rb
Khởi tạo kết nối Redis cho Sidekiq client và server.

### 3. Procfile
Định nghĩa các process để chạy:
- `web`: Rails server
- `worker`: Sidekiq worker

### 4. Procfile.dev
Version development của Procfile với Rails server.

## Docker Compose

Khi chạy `docker-compose up`, các service sau sẽ được khởi động:
1. **db** - MySQL database
2. **redis** - Redis server
3. **backend** - Rails API server
4. **sidekiq** - Sidekiq worker process
5. **frontend** - Next.js frontend

## Usage

### Khởi động services
```bash
docker-compose up
```

### Chạy background job
Trong Rails console hoặc code:
```ruby
# Enqueue job
ExampleWorker.perform_async("John", 5)

# Enqueue với delay
ExampleWorker.perform_in(5.minutes, "Jane", 3)

# Enqueue at specific time
ExampleWorker.perform_at(1.hour.from_now, "Bob", 10)
```

### Kiểm tra Sidekiq Web UI
Thêm vào routes.rb để enable Web UI:
```ruby
require 'sidekiq/web'
mount Sidekiq::Web => '/sidekiq'
```

### Monitor logs
```bash
# Backend logs
docker-compose logs -f backend

# Sidekiq logs
docker-compose logs -f sidekiq

# Redis logs
docker-compose logs -f redis
```

## Queues
Các queue được định nghĩa (theo priority):
1. **default** - General purpose jobs
2. **mailers** - Email sending jobs
3. **video_processing** - Video processing jobs

## Environment Variables
- `REDIS_URL`: Redis connection URL (default: redis://redis:6379/0)

## Creating New Workers

1. Tạo file trong `app/workers/`:
```ruby
class MyWorker
  include Sidekiq::Worker
  
  sidekiq_options queue: 'default', retry: 3
  
  def perform(arg1, arg2)
    # Your job logic here
  end
end
```

2. Enqueue job:
```ruby
MyWorker.perform_async(arg1, arg2)
```

## Troubleshooting

### Rebuild containers sau khi thêm gems
```bash
docker-compose down
docker-compose build backend sidekiq
docker-compose up
```

### Clear Redis
```bash
docker-compose exec redis redis-cli FLUSHALL
```

### Restart Sidekiq
```bash
docker-compose restart sidekiq
```

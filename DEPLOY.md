# Deploy lên AWS EC2 với Docker

> Stack: Rails API + Next.js + MySQL + Redis + Sidekiq + ActionCable  
> Yêu cầu EC2: chỉ cần cài Docker & Docker Compose

---

## Mục lục

1. [Chuẩn bị EC2](#1-chuẩn-bị-ec2)
2. [Cài Docker trên EC2](#2-cài-docker-trên-ec2)
3. [Chuẩn bị code để deploy](#3-chuẩn-bị-code-để-deploy)
4. [Tạo docker-compose.prod.yml](#4-tạo-docker-composeprodyml)
5. [Cấu hình biến môi trường Production](#5-cấu-hình-biến-môi-trường-production)
6. [Đẩy code lên EC2](#6-đẩy-code-lên-ec2)
7. [Khởi động ứng dụng](#7-khởi-động-ứng-dụng)
8. [Kiểm tra và theo dõi](#8-kiểm-tra-và-theo-dõi)
9. [Cấu hình Security Group AWS](#9-cấu-hình-security-group-aws)
10. [Cập nhật ứng dụng](#10-cập-nhật-ứng-dụng)

---

## 1. Chuẩn bị EC2

### Tạo EC2 Instance

| Mục | Giá trị khuyến nghị |
|-----|---------------------|
| AMI | **Ubuntu 24.04 LTS** |
| Instance type | `t3.small` (dev) / `t3.medium` (prod) |
| Storage | >= 20 GB (gp3) |
| Key pair | Tạo mới, lưu file `.pem` |

### Security Group — mở các port sau

| Port | Protocol | Source | Mục đích |
|------|----------|--------|----------|
| 22 | TCP | IP của bạn | SSH |
| 80 | TCP | 0.0.0.0/0 | HTTP Frontend |
| 3000 | TCP | 0.0.0.0/0 | Rails API |
| 4000 | TCP | 0.0.0.0/0 | Next.js Frontend |

> **Lưu ý bảo mật:** Không expose port `3306` (MySQL) và `6379` (Redis) ra ngoài internet.

---

## 2. Cài Docker trên EC2

SSH vào EC2:

```bash
ssh -i your-key.pem ubuntu@<EC2_PUBLIC_IP>
```

Cài Docker và Docker Compose plugin:

```bash
# Cập nhật package list
sudo apt-get update

# Cài các dependencies cần thiết
sudo apt-get install -y ca-certificates curl gnupg

# Thêm Docker GPG key
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | \
  sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

# Thêm Docker repository
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
  https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Cài Docker Engine + Compose plugin
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Cho phép user ubuntu chạy docker không cần sudo
sudo usermod -aG docker ubuntu

# Áp dụng ngay mà không cần logout
newgrp docker

# Kiểm tra
docker --version
docker compose version
```

---

## 3. Chuẩn bị code để deploy

### Tạo file `backend/.env.production` ở local

> KHÔNG commit file này lên git

```bash
# backend/.env.production

RAILS_ENV=production
RAILS_LOG_TO_STDOUT=true
RAILS_SERVE_STATIC_FILES=true

# Database
DATABASE_HOST=db
DATABASE_PORT=3306
DATABASE_NAME=app_production
DATABASE_USERNAME=app_user
DATABASE_PASSWORD=<MAT_KHAU_MANH>

# Redis
REDIS_URL=redis://redis:6379/0

# JWT — generate bằng: openssl rand -hex 64
JWT_SECRET_KEY=<RANDOM_64_CHARS>
DEVISE_JWT_SECRET_KEY=<RANDOM_64_CHARS>

# Rails master key
SECRET_KEY_BASE=<RANDOM_128_CHARS>

# URLs (thay bằng IP hoặc domain thực)
FRONTEND_URL=http://<EC2_PUBLIC_IP>:4000

# YouTube API
YOUTUBE_API_KEY=<YOUR_YOUTUBE_API_KEY>
```

> Tạo secret key nhanh:
> ```bash
> openssl rand -hex 64   # cho JWT keys
> openssl rand -hex 128  # cho SECRET_KEY_BASE
> ```

### Thêm vào `.gitignore`

```bash
echo ".env" >> .gitignore
echo "backend/.env.production" >> .gitignore
```

---

## 4. Tạo docker-compose.prod.yml

Tạo file `docker-compose.prod.yml` tại root dự án:

```yaml
services:
  db:
    image: mysql:8.0
    restart: always
    environment:
      MYSQL_ROOT_PASSWORD: ${MYSQL_ROOT_PASSWORD}
      MYSQL_DATABASE: app_production
      MYSQL_USER: app_user
      MYSQL_PASSWORD: ${DATABASE_PASSWORD}
    volumes:
      - mysql_data:/var/lib/mysql
      - ./backend/docker/mysql/init.sql:/docker-entrypoint-initdb.d/init.sql
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      timeout: 20s
      retries: 10

  redis:
    image: redis:7-alpine
    restart: always
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      timeout: 5s
      retries: 5

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    restart: always
    command: bash -c "rm -f tmp/pids/server.pid && bundle exec rails s -p 3000 -b '0.0.0.0'"
    ports:
      - "3000:3000"
    env_file:
      - ./backend/.env.production
    environment:
      RAILS_ENV: production
      DATABASE_HOST: db
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_healthy

  sidekiq:
    build:
      context: ./backend
      dockerfile: Dockerfile
    restart: always
    command: bundle exec sidekiq -C config/sidekiq.yml
    env_file:
      - ./backend/.env.production
    environment:
      RAILS_ENV: production
      DATABASE_HOST: db
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_healthy

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    restart: always
    ports:
      - "4000:4000"
    environment:
      NODE_ENV: production
      NEXT_PUBLIC_API_URL: http://<EC2_PUBLIC_IP>:3000
      INTERNAL_API_URL: http://backend:3000
    depends_on:
      - backend

volumes:
  mysql_data:
  redis_data:
```

> **Quan trọng:** Thay `<EC2_PUBLIC_IP>` bằng IP thực của EC2 instance.

---

## 5. Cấu hình biến môi trường Production

Tạo file `.env` tại root dự án (dùng trong docker-compose.prod.yml):

```bash
# .env (tại root, KHÔNG commit lên git)
MYSQL_ROOT_PASSWORD=<ROOT_PASSWORD_MANH>
DATABASE_PASSWORD=<APP_PASSWORD_MANH>
```

---

## 6. Đẩy code lên EC2

### Cách 1: Git clone (khuyến nghị)

```bash
# Trên EC2
git clone https://github.com/<username>/<repo>.git /home/ubuntu/app
cd /home/ubuntu/app

# Copy file env lên từ máy local
scp -i your-key.pem backend/.env.production ubuntu@<EC2_IP>:/home/ubuntu/app/backend/
scp -i your-key.pem .env ubuntu@<EC2_IP>:/home/ubuntu/app/
scp -i your-key.pem docker-compose.prod.yml ubuntu@<EC2_IP>:/home/ubuntu/app/
```

### Cách 2: rsync (nhanh khi cần sync code)

```bash
# Từ máy local
rsync -avz --progress \
  --exclude='.git' \
  --exclude='node_modules' \
  --exclude='frontend/.next' \
  --exclude='backend/tmp' \
  --exclude='backend/.env*' \
  -e "ssh -i your-key.pem" \
  /path/to/demo/ \
  ubuntu@<EC2_IP>:/home/ubuntu/app/

# Sau đó copy riêng các file env
scp -i your-key.pem backend/.env.production ubuntu@<EC2_IP>:/home/ubuntu/app/backend/
scp -i your-key.pem .env ubuntu@<EC2_IP>:/home/ubuntu/app/
```

---

## 7. Khởi động ứng dụng

SSH vào EC2 và chạy:

```bash
cd /home/ubuntu/app

# Bước 1: Build images
docker compose -f docker-compose.prod.yml build

# Bước 2: Khởi động database và redis trước
docker compose -f docker-compose.prod.yml up -d db redis

# Bước 3: Đợi DB healthy, rồi migrate
sleep 30
docker compose -f docker-compose.prod.yml run --rm backend \
  bundle exec rails db:create db:migrate

# Bước 4: Khởi động toàn bộ services
docker compose -f docker-compose.prod.yml up -d

# Kiểm tra tất cả containers
docker compose -f docker-compose.prod.yml ps
```

### Kết quả mong đợi

```
NAME                STATUS
demo-db-1           Up (healthy)
demo-redis-1        Up (healthy)
demo-backend-1      Up
demo-sidekiq-1      Up
demo-frontend-1     Up
```

---

## 8. Kiểm tra và theo dõi

### Health check

```bash
# Rails API
curl http://localhost:3000/health
# Mong đợi: OK

# Frontend
curl -I http://localhost:4000

# ActionCable WebSocket endpoint
curl -I http://localhost:3000/cable
```

### Xem logs

```bash
# Tất cả services
docker compose -f docker-compose.prod.yml logs -f

# Từng service
docker compose -f docker-compose.prod.yml logs -f backend
docker compose -f docker-compose.prod.yml logs -f sidekiq
docker compose -f docker-compose.prod.yml logs -f frontend
```

### Kiểm tra Sidekiq queue

```bash
docker compose -f docker-compose.prod.yml exec backend \
  bundle exec rails runner "puts Sidekiq::Stats.new.to_h"
```

### Kiểm tra Redis

```bash
docker compose -f docker-compose.prod.yml exec redis redis-cli ping
# Mong đợi: PONG
```

### Kiểm tra MySQL

```bash
docker compose -f docker-compose.prod.yml exec db \
  mysql -u app_user -p app_production -e "SHOW TABLES;"
```

---

## 9. Cấu hình Security Group AWS

Vào **AWS Console → EC2 → Security Groups → Inbound Rules → Edit**:

| Type | Protocol | Port range | Source |
|------|----------|------------|--------|
| SSH | TCP | 22 | My IP (chỉ IP của bạn) |
| Custom TCP | TCP | 3000 | 0.0.0.0/0 |
| Custom TCP | TCP | 4000 | 0.0.0.0/0 |

> MySQL (3306) và Redis (6379) giao tiếp nội bộ qua Docker network, **không cần mở ra ngoài**.

---

## 10. Cập nhật ứng dụng

```bash
cd /home/ubuntu/app

# Pull code mới (nếu dùng git)
git pull origin main

# Rebuild service cần update
docker compose -f docker-compose.prod.yml build backend sidekiq frontend

# Restart với zero downtime (các service khác giữ nguyên)
docker compose -f docker-compose.prod.yml up -d

# Chạy migration nếu có thay đổi DB schema
docker compose -f docker-compose.prod.yml exec backend \
  bundle exec rails db:migrate

# Theo dõi logs sau deploy
docker compose -f docker-compose.prod.yml logs -f --tail=100
```

---

## Troubleshooting

### Container không start

```bash
docker compose -f docker-compose.prod.yml logs <service_name>
```

### Rails: could not connect to database

- Kiểm tra DB healthy: `docker compose -f docker-compose.prod.yml ps db`
- Kiểm tra `DATABASE_PASSWORD` trong `.env.production` khớp với `MYSQL_PASSWORD` trong `.env`
- Restart: `docker compose -f docker-compose.prod.yml restart db`

### Sidekiq không xử lý jobs

```bash
# Kiểm tra Redis kết nối được từ sidekiq
docker compose -f docker-compose.prod.yml exec sidekiq \
  bundle exec rails runner "puts Sidekiq.redis { |r| r.ping }"

# Restart sidekiq
docker compose -f docker-compose.prod.yml restart sidekiq
```

### ActionCable WebSocket lỗi kết nối

Kiểm tra `config/cable.yml` trong backend:

```yaml
production:
  adapter: redis
  url: <%= ENV.fetch("REDIS_URL") { "redis://localhost:6379/1" } %>
  channel_prefix: app_production
```

Và đảm bảo `FRONTEND_URL` trong `.env.production` trỏ đúng domain/IP.

### Hết dung lượng disk

```bash
# Xoá images/containers cũ không dùng
docker system prune -af --volumes
```

---

## Tóm tắt — Deploy lần đầu

```bash
# 1. SSH vào EC2
ssh -i your-key.pem ubuntu@<EC2_IP>

# 2. Clone code
git clone <repo_url> /home/ubuntu/app && cd /home/ubuntu/app

# 3. Copy .env files (từ local)
# scp -i your-key.pem ...

# 4. Build & run
docker compose -f docker-compose.prod.yml build
docker compose -f docker-compose.prod.yml up -d db redis
sleep 30
docker compose -f docker-compose.prod.yml run --rm backend bundle exec rails db:create db:migrate
docker compose -f docker-compose.prod.yml up -d

# 5. Kiểm tra
curl http://localhost:3000/health
docker compose -f docker-compose.prod.yml ps
```

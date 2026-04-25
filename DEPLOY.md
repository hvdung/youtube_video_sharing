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
9. [Cập nhật ứng dụng](#10-cập-nhật-ứng-dụng)

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
sudo apt-get update

sudo apt-get install -y ca-certificates curl gnupg

sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | \
  sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
  https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

sudo usermod -aG docker ubuntu

newgrp docker

docker --version
docker compose version
```

---

## 3. Chuẩn bị code để deploy

### Tạo file `backend/.env.production` ở local

> KHÔNG commit file này lên git

```bash

RAILS_ENV=production
RAILS_LOG_TO_STDOUT=true
RAILS_SERVE_STATIC_FILES=true

DATABASE_HOST=db
DATABASE_PORT=3306
DATABASE_NAME=app_production
DATABASE_USERNAME=app_user
DATABASE_PASSWORD=<MAT_KHAU_MANH>

REDIS_URL=redis://redis:6379/0

JWT_SECRET_KEY=<RANDOM_64_CHARS>
DEVISE_JWT_SECRET_KEY=<RANDOM_64_CHARS>

SECRET_KEY_BASE=<RANDOM_128_CHARS>

FRONTEND_URL=http://<EC2_PUBLIC_IP>:4000

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
      args:
        NEXT_PUBLIC_API_URL: http://<EC2_PUBLIC_IP>:3000
        NEXT_PUBLIC_CABLE_URL: ws://<EC2_PUBLIC_IP>:3000/cable
    restart: always
    ports:
      - "4000:4000"
    environment:
      NODE_ENV: production
      NEXT_PUBLIC_API_URL: http://<EC2_PUBLIC_IP>:3000
      NEXT_PUBLIC_CABLE_URL: ws://<EC2_PUBLIC_IP>:3000/cable
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
MYSQL_ROOT_PASSWORD=<ROOT_PASSWORD_MANH>
DATABASE_PASSWORD=<APP_PASSWORD_MANH>
```

---

## 6. Đẩy code lên EC2

### Cách 1: Git clone (khuyến nghị)

```bash
git clone https://github.com/<username>/<repo>.git /home/ubuntu/app
cd /home/ubuntu/app

scp -i your-key.pem backend/.env.production ubuntu@<EC2_IP>:/home/ubuntu/app/backend/
scp -i your-key.pem .env ubuntu@<EC2_IP>:/home/ubuntu/app/
scp -i your-key.pem docker-compose.prod.yml ubuntu@<EC2_IP>:/home/ubuntu/app/
```

## 7. Khởi động ứng dụng

SSH vào EC2 và chạy:

```bash
cd /home/ubuntu/app

docker compose -f docker-compose.prod.yml build

docker compose -f docker-compose.prod.yml up -d db redis

sleep 30
docker compose -f docker-compose.prod.yml run --rm backend \
  bundle exec rails db:create db:migrate

docker compose -f docker-compose.prod.yml up -d

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
curl http://localhost:3000/health

curl -I http://localhost:4000

```

### Xem logs

```bash
docker compose -f docker-compose.prod.yml logs -f

docker compose -f docker-compose.prod.yml logs -f backend
docker compose -f docker-compose.prod.yml logs -f sidekiq
docker compose -f docker-compose.prod.yml logs -f frontend
```

---

## 9. Cập nhật ứng dụng

```bash
cd /home/ubuntu/app

git pull

docker compose -f docker-compose.prod.yml build

docker compose -f docker-compose.prod.yml up -d

docker compose -f docker-compose.prod.yml exec backend \
  bundle exec rails db:migrate

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

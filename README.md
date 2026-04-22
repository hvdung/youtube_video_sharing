## Getting Started

### 1. Environment setup

```bash
cp backend/.env.example backend/.env
# Edit backend/.env with your secrets
```

### 2. Start with Docker Compose

```bash
docker-compose up --build
```

### 3. Setup database (first time only)

```bash
docker-compose exec backend bundle exec rails db:create db:migrate db:seed
```

### 4. Access

- **Frontend**: http://localhost:4000
- **Backend API**: http://localhost:3000
- **Health check**: http://localhost:3000/health

## Seed user (for testing)

```
Email: admin@example.com
Password: password123
```

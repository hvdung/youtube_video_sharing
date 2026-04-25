## Guidelines

### Introduction
The project is a YouTube video sharing application. It allows users to register for an account and share their favorite videos on the platform so others can discover them.

Key features include:

- Displaying a list of videos shared by all users.
- Displaying videos shared by each individual user.
- A feature to share YouTube videos.
- A real-time notification system that informs registered users whenever a new video is shared.

### Prerequisites
- Docker 24.x, Docker Compose 2.x
- [YouTube Data API v3](https://console.cloud.google.com)

### Installation & Configuration
1. git clone git@github.com:hvdung/youtube_video_sharing.git
2. cd backend && cp .env.example .env
3. cd frontend && cp .env.example .env.local
4. docker compose up --build -d

## Database Setup
1. docker compose exec backend rails db:create
2. docker compose exec backend rails db:migrate
3. docker compose exec backend rails db:seed
4. Go to: http://localhost:4000
User: admin@example.com
Password: password123

### Running the Application
1. Start server:
docker compose up -d
2. Access local: http://localhost:4000
Access on web: http://175.41.180.15:4000
3. Run test:
docker compose exec backend bundle exec rspec

### (BE/FS) Docker Deployment
Refer to DEPLOY.md

### Usage
Link video usage: https://drive.google.com/file/d/1A_8By8gDOlT0zAQh2oG5IV0WWGoOIJUL/view?usp=sharing

### Troubleshooting
N/A
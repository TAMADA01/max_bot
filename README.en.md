# MAX Bot - Certificate Request Management System

A comprehensive certificate request management system for educational institutions with MAX bot integration, web interface, and REST API.

[🇷🇺 Русская версия](README.md)

## 📋 Overview

MAX Bot is an integrated solution for automating the process of submitting and processing certificate requests in educational institutions. The system consists of three main components:

- **API Server** - Backend on Express.js with PostgreSQL for business logic processing
- **MAX Bot** - Telegram/MAX bot for user interaction
- **Web Interface** - React application for managing requests via web

## ✨ Key Features

- 🎓 **Student Portal** - Submit certificate requests through bot or web
- 👨‍💼 **Staff Dashboard** - Process requests, change statuses
- 🔐 **Role-based Access** - Student, Staff, Admin roles
- 📱 **MAX Bot Integration** - Seamless interaction via messenger
- 🌐 **Web Interface** - Modern responsive design
- 📄 **Multiple Certificate Types** - Academic, enrollment, attendance, etc.
- 🔔 **Status Tracking** - Real-time request status updates
- 📊 **Analytics** - Statistics and reports
- 🔒 **Secure** - JWT authentication, bcrypt password hashing
- 📚 **API Documentation** - Interactive Swagger UI

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Clients                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  MAX Bot     │  │ Web Interface│  │  Admin Panel │  │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  │
└─────────┼──────────────────┼──────────────────┼─────────┘
          │                  │                  │
          │                  ▼                  │
          │         ┌────────────────┐          │
          └────────►│   API Server   │◄─────────┘
                    │  (Express.js)  │
                    └────────┬───────┘
                             │
              ┌──────────────┴──────────────┐
              ▼                             ▼
    ┌─────────────────┐          ┌─────────────────┐
    │   PostgreSQL    │          │      Redis      │
    │   (Database)    │          │     (Cache)     │
    └─────────────────┘          └─────────────────┘
```

## 🛠️ Technology Stack

### Backend
- Node.js 18, Express.js, TypeScript
- PostgreSQL 15, Redis 7
- JWT Authentication, Bcrypt
- Swagger API Documentation

### Bot
- @maxhub/max-bot-api
- Express webhook server
- Multi-language support (RU, EN)

### Frontend
- React 18, Vite, TypeScript
- TailwindCSS 4
- @maxhub/max-ui components
- React Router DOM 7

### DevOps
- Docker & Docker Compose
- Nginx reverse proxy
- Automated migrations
- Health checks

## 🚀 Quick Start

### Prerequisites

- Docker 20.10+
- Docker Compose 2.0+
- Git

### Installation

```bash
# Clone repository
git clone <repository-url>
cd max_bot

# Create environment file
cp example-env .env

# Edit .env and set your values
nano .env

# Start all services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

### Access Services

- **Web Interface**: http://localhost:3000
- **API Server**: http://localhost:8080
- **Swagger Docs**: http://localhost:8080/api-docs
- **Admin Panel**: http://localhost:8080/admin

Default admin credentials:
- Email: `admin@test.com`
- Password: `admin123`

> ⚠️ **Important**: Change default passwords before production use!

## 📚 Documentation

- [Russian README](README.md) - Full documentation in Russian
- [Deployment Guide](DEPLOYMENT.md) - Detailed deployment instructions
- [API Reference](API_REFERENCE.md) - API documentation
- [Quick Start](QUICK_START.md) - Quick start guide
- [Contributing](CONTRIBUTING.md) - Development guidelines
- [FAQ](FAQ.md) - Frequently asked questions
- [Admin Guide](ADMIN_GUIDE.md) - Administrator's guide
- [Security Policy](SECURITY.md) - Security guidelines
- [Changelog](CHANGELOG.md) - Version history

## 🔧 Configuration

### Environment Variables

Key configuration in `.env`:

```env
# Database
POSTGRES_DB=bot_max
POSTGRES_USER=admin
POSTGRES_PASSWORD=your_secure_password

# JWT Secrets (change in production!)
JWT_SECRET=your_jwt_secret_64_chars_minimum
JWT_REFRESH_SECRET=your_refresh_secret_64_chars

# MAX Bot Token
MAX_BOT_TOKEN=your_max_bot_token
MAX_API_BASE=https://platform-api.max.ru

# Admin User
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=secure_admin_password
```

## 🎯 Main Features

### For Students
- Submit certificate requests via bot or web
- Track request status in real-time
- View history of all requests
- Upload additional documents

### For Staff
- View and process incoming requests
- Change request statuses
- Add notes and comments
- Upload certificate files
- View statistics

### For Administrators
- Manage users (students, staff)
- System configuration
- View analytics and reports
- Monitor system health
- Manage database

## 📊 Database Schema

- **users** - User accounts
- **students** - Student-specific data
- **staff** - Staff member data
- **certificates** - Certificate requests
- **certificate_files** - Attached files

### Certificate Types
- `enrollment` - Enrollment certificate
- `academic` - Academic certificate
- `attendance` - Attendance certificate
- `graduation` - Graduation certificate
- `other` - Other types

### Certificate Statuses
- `pending` - Awaiting processing
- `in_progress` - Being processed
- `ready` - Ready for pickup
- `issued` - Issued to student
- `rejected` - Rejected
- `approved` - Approved
- `completed` - Completed

## 🔐 Security

- JWT token authentication (access + refresh)
- Bcrypt password hashing
- CORS configuration
- Helmet.js security headers
- Input validation with Zod
- SQL injection prevention
- Rate limiting (planned)

## 🐛 Troubleshooting

```bash
# View logs
docker-compose logs -f

# Restart service
docker-compose restart api

# Check database connection
docker-compose exec postgres pg_isready

# Rebuild all services
docker-compose up -d --build --force-recreate

# Clean restart (removes all data!)
docker-compose down -v
docker-compose up -d --build
```

## 📈 Monitoring

```bash
# Resource usage
docker stats

# Service health
curl http://localhost:8080/health

# Database size
docker-compose exec postgres psql -U admin bot_max -c "SELECT pg_size_pretty(pg_database_size('bot_max'));"
```

## 🔄 Updates

```bash
# Backup database
docker-compose exec postgres pg_dump -U admin bot_max > backup.sql

# Update code
git pull origin main

# Rebuild and restart
docker-compose down
docker-compose up -d --build
```

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'feat: add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

[Specify your license]

## 🙏 Acknowledgments

- [MAX Platform](https://max.ru) - For providing the bot platform
- All contributors to the project

## 📞 Support

- **GitHub Issues**: Bug reports and feature requests
- **GitHub Discussions**: General questions
- **Email**: [your-email@example.com]

## 🌟 Star Us!

If you find this project useful, please give it a star on GitHub!

---

**Version**: 1.0.0  
**Last Updated**: November 15, 2025

Made with ❤️ by [Your Team Name]


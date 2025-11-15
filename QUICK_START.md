# ⚡ Быстрый старт MAX Bot

Минималистичное руководство для быстрого запуска проекта.

## 🚀 Запуск за 5 минут

### Шаг 1: Подготовка

```bash
# Клонируйте репозиторий
git clone <repository-url>
cd max_bot

# Создайте .env файл
cp example-env .env
```

### Шаг 2: Настройка .env

Обязательно измените следующие параметры в `.env`:

```env
# MAX Bot токен (получите на https://max.ru)
MAX_BOT_TOKEN=your_bot_token_here

# Пароли (в production используйте сложные!)
POSTGRES_PASSWORD=your_secure_password
JWT_SECRET=your_jwt_secret_min_32_chars
JWT_REFRESH_SECRET=your_refresh_secret_min_32_chars

# Админ (создается автоматически)
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=admin123
```

### Шаг 3: Запуск

```bash
# Запустить все сервисы
docker-compose up -d

# Проверить статус
docker-compose ps

# Посмотреть логи
docker-compose logs -f
```

### Шаг 4: Проверка

Откройте в браузере:

- **Web приложение**: http://localhost:3000
- **API документация**: http://localhost:8080/api-docs
- **Админ панель**: http://localhost:8080/admin

Проверьте API:
```bash
curl http://localhost:8080/health
```

## 📱 Доступы по умолчанию

| Сервис | URL | Логин | Пароль |
|--------|-----|-------|--------|
| Web | http://localhost:3000 | - | - |
| API | http://localhost:8080 | - | - |
| Swagger | http://localhost:8080/api-docs | - | - |
| Admin | http://localhost:8080/admin | admin@test.com | admin123 |
| PostgreSQL | localhost:5432 | admin | 190340 |
| Redis | localhost:6379 | - | - |

> ⚠️ **Важно**: Измените пароли перед использованием в production!

## 🛑 Остановка

```bash
# Остановить сервисы
docker-compose down

# Остановить и удалить данные БД
docker-compose down -v
```

## 🔄 Перезапуск после изменений

```bash
# Пересобрать и перезапустить
docker-compose up -d --build

# Перезапустить конкретный сервис
docker-compose restart api
```

## 🐛 Проблемы?

```bash
# Посмотреть логи всех сервисов
docker-compose logs -f

# Посмотреть логи конкретного сервиса
docker-compose logs -f api

# Проверить что все контейнеры запущены
docker-compose ps

# Полная переустановка (удалит все данные!)
docker-compose down -v
docker system prune -a
docker-compose up -d --build
```

## 📚 Дополнительная информация

- Полная документация: [README.md](README.md)
- Детальное развертывание: [DEPLOYMENT.md](DEPLOYMENT.md)
- Swagger API: http://localhost:8080/api-docs

## 🎯 Основные команды

```bash
# Запуск
docker-compose up -d

# Остановка
docker-compose down

# Логи
docker-compose logs -f

# Статус
docker-compose ps

# Перезапуск
docker-compose restart

# Обновление после изменений кода
docker-compose up -d --build

# Подключение к БД
docker-compose exec postgres psql -U admin -d bot_max

# Backup БД
docker-compose exec postgres pg_dump -U admin bot_max > backup.sql

# Восстановление БД
docker-compose exec -T postgres psql -U admin bot_max < backup.sql
```

## 🔐 Тестовый вход

После запуска автоматически создается администратор:

- **Email**: `admin@test.com`
- **Пароль**: `admin123`

Используйте эти данные для входа через API:

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@test.com",
    "password": "admin123"
  }'
```

## 🌐 Production развертывание

Для production окружения:

1. Измените все пароли и секреты в `.env`
2. Настройте SSL (Let's Encrypt)
3. Используйте `docker-compose.prod.yml`
4. Настройте мониторинг и backup

Подробнее: [DEPLOYMENT.md](DEPLOYMENT.md)

---

**Нужна помощь?** Читайте полную документацию в [README.md](README.md)


# 🚀 Инструкция по запуску MAX Bot

Пошаговое руководство для запуска проекта MAX Bot локально.

## 📋 Содержание

- [Системные требования](#системные-требования)
- [Быстрый старт с Docker](#быстрый-старт-с-docker)
- [Локальный запуск без Docker](#локальный-запуск-без-docker)
- [Команды для работы с контейнерами](#команды-для-работы-с-контейнерами)
- [Примеры использования](#примеры-использования)
- [Решение проблем](#решение-проблем)

---

## 📦 Системные требования

### Обязательно

- **Docker**: версия 20.10 или выше
- **Docker Compose**: версия 2.0 или выше
- **Git**: для клонирования репозитория

### Для локальной разработки (опционально)

- **Node.js**: версия 18.x или выше
- **npm**: версия 9.x или выше
- **PostgreSQL**: версия 15
- **Redis**: версия 7

### Проверка установки

```bash
# Проверить Docker
docker --version
# Ожидается: Docker version 20.10.x или выше

# Проверить Docker Compose
docker-compose --version
# Ожидается: Docker Compose version 2.x.x или выше

# Проверить Git
git --version
```

---

## 🐳 Быстрый старт с Docker (Рекомендуется)

### Шаг 1: Клонирование репозитория

```bash
# Клонировать репозиторий
git clone https://github.com/your-username/max_bot.git

# Перейти в директорию проекта
cd max_bot
```

### Шаг 2: Настройка переменных окружения

```bash
# Скопировать пример файла окружения
cp example-env .env

# Открыть для редактирования (Windows)
notepad .env

# Или (Linux/Mac)
nano .env
```

**Обязательно измените следующие параметры в `.env`:**

```env
# Токен MAX бота (получите на https://max.ru)
MAX_BOT_TOKEN=ваш_токен_бота

# Пароли (используйте сложные пароли!)
POSTGRES_PASSWORD=ваш_надежный_пароль_бд
JWT_SECRET=случайная_строка_минимум_64_символа
JWT_REFRESH_SECRET=другая_случайная_строка_64_символа

# Email администратора
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=надежный_пароль_администратора
```

### Шаг 3: Запуск всех сервисов

```bash
# Запустить все сервисы в фоновом режиме
docker-compose up -d

# Дождаться запуска (20-30 секунд)
# Проверить статус сервисов
docker-compose ps
```

**Ожидаемый вывод:**
```
NAME                  STATUS          PORTS
project_postgres      Up 30 seconds   0.0.0.0:5432->5432/tcp
project_redis         Up 30 seconds   0.0.0.0:6379->6379/tcp
project_api           Up 20 seconds   0.0.0.0:8080->8080/tcp
project_web           Up 15 seconds   0.0.0.0:3000->3000/tcp
project_bot           Up 10 seconds   0.0.0.0:3002->3002/tcp
```

### Шаг 4: Проверка работы

```bash
# Проверить API
curl http://localhost:8080/health

# Ожидается: {"status":"OK","service":"api","timestamp":"..."}
```

**Откройте в браузере:**

- **Web приложение**: http://localhost:3000
- **API Swagger документация**: http://localhost:8080/api-docs
- **Админ панель**: http://localhost:8080/admin

**Данные для входа (по умолчанию):**
- Email: `admin@test.com`
- Пароль: `admin123`

### Шаг 5: Просмотр логов

```bash
# Просмотр логов всех сервисов
docker-compose logs -f

# Просмотр логов конкретного сервиса
docker-compose logs -f api
docker-compose logs -f bot
docker-compose logs -f web
```

---

## 💻 Локальный запуск без Docker

### Шаг 1: Установка зависимостей

```bash
# Установить PostgreSQL 15
# Windows: скачайте с https://www.postgresql.org/download/windows/
# Linux: sudo apt install postgresql-15
# Mac: brew install postgresql@15

# Установить Redis 7
# Windows: скачайте с https://github.com/microsoftarchive/redis/releases
# Linux: sudo apt install redis-server
# Mac: brew install redis

# Установить Node.js 18
# Скачайте с https://nodejs.org/
```

### Шаг 2: Настройка базы данных

```bash
# Запустить PostgreSQL
# Linux/Mac:
sudo systemctl start postgresql

# Создать базу данных
sudo -u postgres psql
CREATE DATABASE bot_max;
CREATE USER admin WITH ENCRYPTED PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE bot_max TO admin;
\q

# Запустить Redis
# Linux/Mac:
sudo systemctl start redis-server
# Windows: redis-server.exe
```

### Шаг 3: Установка npm зависимостей

```bash
# API Server
cd api
npm install
cd ..

# Bot
cd bot
npm install
cd ..

# Web Interface
cd web
npm install
cd ..
```

### Шаг 4: Настройка .env для каждого сервиса

**Для API (`api/.env`):**
```env
DATABASE_URL=postgresql://admin:your_password@localhost:5432/bot_max
REDIS_URL=redis://localhost:6379
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret
PORT=8080
NODE_ENV=development
ADMIN_EMAIL=admin@test.com
ADMIN_PASSWORD=admin123
```

**Для Bot (`bot/.env`):**
```env
DATABASE_URL=postgresql://admin:your_password@localhost:5432/bot_max
API_URL=http://localhost:8080
MAX_BOT_TOKEN=your_bot_token
MAX_API_BASE=https://platform-api.max.ru
PORT=3002
```

**Для Web (`web/.env`):**
```env
VITE_API_URL=http://localhost:8080/api
```

### Шаг 5: Запуск сервисов

Откройте 3 терминала:

**Терминал 1 - API Server:**
```bash
cd api
npm run dev
```

**Терминал 2 - Bot:**
```bash
cd bot
npm run dev
```

**Терминал 3 - Web Interface:**
```bash
cd web
npm run dev
```

### Шаг 6: Проверка

- API: http://localhost:8080/health
- Web: http://localhost:3000
- Swagger: http://localhost:8080/api-docs

---

## 🔧 Команды для работы с контейнерами

### Основные команды

```bash
# Запустить все сервисы
docker-compose up -d

# Запустить с выводом логов (без фона)
docker-compose up

# Остановить все сервисы
docker-compose down

# Остановить и удалить volumes (БД будет очищена!)
docker-compose down -v

# Перезапустить все сервисы
docker-compose restart

# Перезапустить конкретный сервис
docker-compose restart api
```

### Сборка образов

```bash
# Собрать все образы
docker-compose build

# Собрать конкретный образ
docker-compose build api

# Пересобрать и запустить
docker-compose up -d --build

# Пересоздать контейнеры (если нужно)
docker-compose up -d --force-recreate
```

### Просмотр информации

```bash
# Статус всех сервисов
docker-compose ps

# Логи всех сервисов
docker-compose logs

# Логи с follow (в реальном времени)
docker-compose logs -f

# Последние 100 строк логов
docker-compose logs --tail=100

# Логи конкретного сервиса
docker-compose logs -f api

# Использование ресурсов
docker stats
```

### Работа с базой данных

```bash
# Подключиться к PostgreSQL
docker-compose exec postgres psql -U admin -d bot_max

# Создать backup базы данных
docker-compose exec postgres pg_dump -U admin bot_max > backup_$(date +%Y%m%d).sql

# Восстановить из backup
docker-compose exec -T postgres psql -U admin bot_max < backup.sql

# Проверить размер БД
docker-compose exec postgres psql -U admin bot_max -c "SELECT pg_size_pretty(pg_database_size('bot_max'));"
```

### Очистка

```bash
# Остановить и удалить контейнеры
docker-compose down

# Удалить неиспользуемые образы
docker image prune -a

# Удалить все неиспользуемые ресурсы
docker system prune -a --volumes

# ВНИМАНИЕ: Это удалит ВСЕ данные!
```

---

## 📝 Примеры использования

### Пример 1: Первый запуск проекта

```bash
# 1. Клонировать репозиторий
git clone https://github.com/your-username/max_bot.git
cd max_bot

# 2. Настроить окружение
cp example-env .env
# Отредактировать .env (установить MAX_BOT_TOKEN и пароли)

# 3. Запустить
docker-compose up -d

# 4. Проверить логи
docker-compose logs -f

# 5. Открыть в браузере
# http://localhost:3000
```

### Пример 2: Разработка с hot-reload

```bash
# 1. Запустить только инфраструктуру
docker-compose up -d postgres redis

# 2. Запустить API в dev режиме
cd api
npm install
npm run dev
# API запущен на http://localhost:8080

# 3. В новом терминале - Web
cd web
npm install
npm run dev
# Web запущен на http://localhost:3000

# 4. В новом терминале - Bot
cd bot
npm install
npm run dev
# Bot запущен на http://localhost:3002
```

### Пример 3: Тестирование API через командную строку

```bash
# 1. Вход в систему (получить токен)
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@test.com",
    "password": "admin123"
  }'

# Сохранить access_token из ответа

# 2. Получить информацию о текущем пользователе
curl -X GET http://localhost:8080/api/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# 3. Создать заявку на справку
curl -X POST http://localhost:8080/api/certificates \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "academic",
    "request_data": {
      "purpose": "Для военкомата",
      "copies": 2
    }
  }'

# 4. Получить список справок
curl -X GET "http://localhost:8080/api/certificates?status=pending" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Пример 4: Backup и восстановление

```bash
# Создать backup
docker-compose exec postgres pg_dump -U admin bot_max | gzip > backup_$(date +%Y%m%d_%H%M%S).sql.gz

# Восстановить из backup
gunzip -c backup_20250115_120000.sql.gz | \
  docker-compose exec -T postgres psql -U admin bot_max

# Или без сжатия
docker-compose exec postgres pg_dump -U admin bot_max > backup.sql
docker-compose exec -T postgres psql -U admin bot_max < backup.sql
```

### Пример 5: Обновление проекта

```bash
# 1. Остановить сервисы
docker-compose down

# 2. Создать backup базы данных
docker-compose up -d postgres
docker-compose exec postgres pg_dump -U admin bot_max > backup_before_update.sql
docker-compose down

# 3. Обновить код
git pull origin main

# 4. Пересобрать и запустить
docker-compose up -d --build

# 5. Проверить логи
docker-compose logs -f

# 6. Проверить работу
curl http://localhost:8080/health
```

---

## 🐛 Решение проблем

### Проблема: Контейнер не запускается

```bash
# 1. Проверить логи
docker-compose logs api

# 2. Проверить статус
docker-compose ps

# 3. Пересоздать контейнер
docker-compose up -d --force-recreate api

# 4. Если не помогло - полная переустановка
docker-compose down -v
docker-compose up -d --build
```

### Проблема: Порт уже занят

```bash
# Найти процесс, занимающий порт (Windows)
netstat -ano | findstr :8080

# Найти процесс (Linux/Mac)
lsof -i :8080

# Убить процесс (замените PID)
# Windows: taskkill /PID 1234 /F
# Linux/Mac: kill -9 1234

# Или изменить порт в docker-compose.yml
```

### Проблема: База данных не подключается

```bash
# 1. Проверить что PostgreSQL запущен
docker-compose ps postgres

# 2. Проверить готовность БД
docker-compose exec postgres pg_isready

# 3. Проверить логи PostgreSQL
docker-compose logs postgres

# 4. Подключиться вручную
docker-compose exec postgres psql -U admin -d bot_max

# 5. Пересоздать БД
docker-compose down -v
docker-compose up -d postgres
# Подождать 30 секунд
docker-compose up -d
```

### Проблема: Недостаточно места на диске

```bash
# Проверить использование
docker system df

# Очистить неиспользуемые ресурсы
docker system prune -a

# Удалить старые volumes
docker volume prune

# Удалить конкретный volume
docker volume rm max_bot_postgres_data
```

### Проблема: Медленная работа на Windows

```bash
# 1. Включить WSL 2
wsl --install

# 2. Установить Docker Desktop с WSL 2 backend

# 3. Переместить проект в WSL
# Откройте WSL terminal
cd ~
git clone <repository-url>
cd max_bot
docker-compose up -d
```

---

## 📞 Получение помощи

### Документация

- **Основная**: [README.md](README.md)
- **API**: [API_REFERENCE.md](API_REFERENCE.md)
- **Deployment**: [DEPLOYMENT.md](DEPLOYMENT.md)
- **FAQ**: [FAQ.md](FAQ.md)
- **Swagger UI**: http://localhost:8080/api-docs

### Поддержка

- **GitHub Issues**: Сообщить о проблеме
- **GitHub Discussions**: Задать вопрос
- **Email**: [указать email]

---

## ✅ Checklist успешного запуска

- [ ] Docker и Docker Compose установлены
- [ ] Репозиторий клонирован
- [ ] Файл .env создан и настроен
- [ ] `docker-compose up -d` выполнен успешно
- [ ] Все 5 контейнеров запущены (`docker-compose ps`)
- [ ] API отвечает: http://localhost:8080/health
- [ ] Web открывается: http://localhost:3000
- [ ] Swagger доступен: http://localhost:8080/api-docs
- [ ] Можно войти с учетными данными admin

---

**Успешного запуска!** 🚀

Если возникли проблемы, проверьте [FAQ.md](FAQ.md) или создайте issue на GitHub.

---

**Версия**: 1.0  
**Дата**: 15 ноября 2025


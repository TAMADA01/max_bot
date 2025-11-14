# Изменения в проекте

## Что было сделано

### 1. Обновление БД

#### Добавлена таблица для файлов справок (`certificate_files`)
- `id` - уникальный идентификатор файла
- `certificate_id` - связь со справкой
- `file_name` - оригинальное имя файла
- `file_path` - путь к файлу на сервере
- `file_size` - размер файла в байтах
- `mime_type` - тип файла
- `uploaded_by` - ID пользователя, загрузившего файл
- `uploaded_at` - дата и время загрузки

#### Обновлена таблица `certificates`
- Добавлено поле `notes` для заметок
- Добавлены новые статусы: `approved`, `completed`

**Миграции:**
- `api/src/database/migrations/001_initial_schema.sql` - обновлена
- `api/src/database/migrations/002_add_certificate_files.sql` - новая

### 2. Обновление API

#### Новые эндпоинты:

**Для работы с заявками (Applications):**
- `GET /api/applications` - получить все заявки пользователя
- `GET /api/applications/:id` - получить заявку по ID
- `POST /api/applications` - создать новую заявку
- `GET /api/applications/admin/all` - получить все заявки (staff/admin)

**Для работы с файлами:**
- `POST /api/applications/:id/upload` - загрузить файл справки (staff/admin)
- `GET /api/certificates/:id/file` - скачать файл справки
- `DELETE /api/certificates/files/:fileId` - удалить файл (admin)

#### Новые файлы API:

**Репозитории:**
- `api/src/repositories/certificate-file.repository.ts` - работа с файлами в БД

**Сервисы:**
- `api/src/services/certificate-file.service.ts` - логика работы с файлами
- Обновлен `api/src/services/certificate.service.ts` - добавлен маппинг в ApplicationDTO

**Контроллеры:**
- Обновлен `api/src/controllers/certificate.controller.ts` - добавлены методы для работы с файлами и applications

**Middleware:**
- `api/src/middleware/upload.middleware.ts` - настройка multer для загрузки файлов

**Роуты:**
- `api/src/routes/application.routes.ts` - новый роутер для applications
- Обновлен `api/src/routes/certificate.routes.ts` - добавлены роуты для файлов
- Обновлен `api/src/routes/index.ts` - подключен application роутер

**Типы:**
- Обновлен `api/src/types/index.ts` - добавлены типы для файлов и ApplicationDTO

### 3. Обновление веб-приложения

#### Новые сервисы:
- `web/src/services/api.ts` - API клиент для работы с бэкендом

#### Обновленные страницы:
- `web/src/pages/ApplicationsPage.tsx` - теперь загружает данные из API
- `web/src/pages/ApplicationFormPage.tsx` - отправляет данные на API
- `web/src/pages/ApplicationDetailsPage.tsx` - загружает/скачивает файлы через API

### 4. Зависимости

#### Добавлено в API:
- `multer` - для загрузки файлов
- `@types/multer` - типы для multer

## Как запустить

### 1. Установка зависимостей

```bash
# API
cd api
npm install

# Web
cd web
npm install
```

### 2. Настройка переменных окружения

#### API (.env)
```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/max_bot
POSTGRES_HOST=db
POSTGRES_PORT=5432
POSTGRES_USER=user
POSTGRES_PASSWORD=password
POSTGRES_DB=max_bot

# JWT
JWT_SECRET=your_jwt_secret_key_here
JWT_REFRESH_SECRET=your_jwt_refresh_secret_key_here

# Server
PORT=3000
NODE_ENV=development

# File Upload
UPLOAD_DIR=./uploads/certificates
API_BASE_URL=http://localhost:3000
```

#### Web (.env)
```env
VITE_API_BASE_URL=http://localhost:3000/api
```

### 3. Запуск миграций

Миграции запускаются автоматически при старте API сервера.

Или вручную:
```bash
cd api
npm run dev
```

### 4. Запуск приложения

```bash
# Docker Compose (рекомендуется)
docker-compose up -d

# Или по отдельности:

# API
cd api
npm run dev

# Web
cd web
npm run dev
```

## Структура файлов

```
api/
├── src/
│   ├── controllers/
│   │   └── certificate.controller.ts (обновлен)
│   ├── database/
│   │   ├── migrations/
│   │   │   ├── 001_initial_schema.sql (обновлен)
│   │   │   └── 002_add_certificate_files.sql (новый)
│   │   └── migrations.ts (обновлен)
│   ├── middleware/
│   │   └── upload.middleware.ts (новый)
│   ├── repositories/
│   │   └── certificate-file.repository.ts (новый)
│   ├── routes/
│   │   ├── application.routes.ts (новый)
│   │   ├── certificate.routes.ts (обновлен)
│   │   └── index.ts (обновлен)
│   ├── services/
│   │   ├── certificate.service.ts (обновлен)
│   │   └── certificate-file.service.ts (новый)
│   └── types/
│       └── index.ts (обновлен)
└── package.json (обновлен)

web/
├── src/
│   ├── pages/
│   │   ├── ApplicationsPage.tsx (обновлен)
│   │   ├── ApplicationFormPage.tsx (обновлен)
│   │   └── ApplicationDetailsPage.tsx (обновлен)
│   └── services/
│       └── api.ts (новый)
└── package.json

```

## API Документация

Полная документация по API доступна в файле `API_DOCUMENTATION.md`.

## Особенности

### Маппинг статусов
Веб-приложение использует упрощенную схему статусов:
- `pending` - Ожидает обработки
- `approved` - Одобрена
- `rejected` - Отклонена
- `completed` - Завершена с файлом

Внутри API статусы более детализированы:
- `pending`, `in_progress` → `pending`
- `approved`, `ready` → `approved`
- `completed`, `issued` → `completed`
- `rejected` → `rejected`

### Загрузка файлов
- Разрешены только PDF и Word документы
- Максимальный размер файла: 10MB
- Файлы сохраняются в директории `UPLOAD_DIR` (по умолчанию: `./uploads/certificates`)
- При загрузке файла статус справки автоматически меняется на `completed`

### Права доступа
- **Student** - может создавать заявки и просматривать только свои заявки
- **Staff/Admin** - могут просматривать все заявки, загружать файлы, изменять статусы

## Что дальше?

1. Настройте переменные окружения в `.env` файлах
2. Запустите миграции БД
3. Установите зависимости (`npm install`)
4. Запустите приложение
5. Проверьте работу API через документацию

## Возможные проблемы

### Ошибка подключения к БД
- Проверьте, что PostgreSQL запущен
- Проверьте настройки подключения в `.env`

### Ошибки при загрузке файлов
- Убедитесь, что директория `UPLOAD_DIR` существует и доступна для записи
- Проверьте размер и тип файла

### Ошибки CORS
- Убедитесь, что в API настроен CORS для фронтенда
- Проверьте `VITE_API_BASE_URL` в веб-приложении


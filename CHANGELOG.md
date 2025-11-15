# Changelog

Все важные изменения в проекте MAX Bot будут документированы в этом файле.

Формат основан на [Keep a Changelog](https://keepachangelog.com/ru/1.0.0/),
и этот проект придерживается [Semantic Versioning](https://semver.org/lang/ru/).

## [Unreleased]

### Планируется
- Уведомления по email о статусе справок
- Telegram уведомления
- Экспорт справок в различных форматах
- Система шаблонов для справок
- Расширенная аналитика и отчеты

---

## [1.0.0] - 2025-01-15

### Добавлено

#### API Server
- Базовая архитектура REST API на Express.js + TypeScript
- Аутентификация и авторизация через JWT
- Управление пользователями (студенты, сотрудники, администраторы)
- CRUD операции для заявок на справки
- Система загрузки и хранения файлов
- Интеграция с PostgreSQL для хранения данных
- Интеграция с Redis для кэширования
- Swagger документация API (доступна по `/api-docs`)
- Миграции базы данных
- Автоматическое создание администратора при первом запуске
- Health check endpoint
- Error handling middleware
- CORS и Helmet для безопасности
- Логирование запросов через Morgan

#### MAX Bot
- Интеграция с платформой MAX (@maxhub/max-bot-api)
- Система команд (/start)
- Обработчики событий и сообщений
- Многоязычность (русский, английский)
- Авторизация пользователей через бота
- Создание и просмотр заявок на справки
- Клавиатуры для навигации
- Middleware для расширения контекста
- Интеграция с API сервером

#### Web Interface
- React приложение с TypeScript
- Routing через React Router DOM
- Интеграция с MAX UI компонентами
- Страницы:
  - Список заявок
  - Создание заявки
  - Детальная информация о заявке
  - 404 страница
- Адаптивный дизайн с TailwindCSS
- Обработка перенаправлений от MAX Platform
- UI компоненты (Button, Input, Badge)

#### DevOps
- Docker контейнеризация всех сервисов
- Docker Compose для локальной разработки
- Nginx reverse proxy конфигурация
- Health checks для всех сервисов
- Автоматический restart контейнеров
- Volumes для персистентности данных

#### Документация
- README.md с полным описанием проекта
- DEPLOYMENT.md с инструкциями по развертыванию
- API_REFERENCE.md с документацией API
- QUICK_START.md для быстрого старта
- CONTRIBUTING.md для разработчиков
- Примеры использования API

### База данных

#### Схема БД v1
- Таблица `users` - базовая информация о пользователях
- Таблица `students` - данные студентов
- Таблица `staff` - данные сотрудников
- Таблица `certificates` - заявки на справки
- Таблица `certificate_files` - файлы, прикрепленные к справкам
- Индексы для оптимизации запросов
- Триггеры для автоматического обновления `updated_at`

#### Типы справок
- `enrollment` - Справка о зачислении
- `academic` - Академическая справка
- `attendance` - Справка о посещаемости
- `graduation` - Справка о выпуске
- `other` - Другие справки

#### Статусы справок
- `pending` - Ожидает обработки
- `in_progress` - В работе
- `ready` - Готова к выдаче
- `issued` - Выдана
- `rejected` - Отклонена
- `approved` - Одобрена
- `completed` - Завершена

### Безопасность
- JWT токены для аутентификации (access + refresh)
- Хеширование паролей через bcrypt
- CORS настройки
- Helmet для HTTP headers security
- Валидация входных данных через Zod
- Rate limiting (планируется)

### Технологический стек

#### Backend
- Node.js 18
- Express.js 4
- TypeScript 5
- PostgreSQL 15
- Redis 7
- bcryptjs для хеширования паролей
- jsonwebtoken для JWT
- multer для загрузки файлов
- swagger-jsdoc + swagger-ui-express для документации

#### Bot
- @maxhub/max-bot-api 0.2.1
- Axios для HTTP запросов
- Express для webhook
- body-parser

#### Frontend
- React 18
- Vite 7
- TypeScript 5
- TailwindCSS 4
- @maxhub/max-ui 0.1.12
- React Router DOM 7
- Axios для API запросов
- Lucide React для иконок

---

## [0.1.0] - 2024-12-XX

### Добавлено
- Инициализация проекта
- Базовая структура директорий
- Настройка TypeScript конфигурации
- Базовые зависимости

---

## Типы изменений

- `Added` (Добавлено) - новые функции
- `Changed` (Изменено) - изменения в существующей функциональности
- `Deprecated` (Устарело) - функции, которые скоро будут удалены
- `Removed` (Удалено) - удаленные функции
- `Fixed` (Исправлено) - исправление багов
- `Security` (Безопасность) - исправления уязвимостей

---

[Unreleased]: https://github.com/username/max_bot/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/username/max_bot/releases/tag/v1.0.0
[0.1.0]: https://github.com/username/max_bot/releases/tag/v0.1.0


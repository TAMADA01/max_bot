# API Documentation

## Архитектура проекта

Проект использует чистую архитектуру с разделением на слои:

```
api/src/
├── config/          # Конфигурация (БД, Redis)
├── database/        # Миграции БД
├── types/           # TypeScript типы и интерфейсы
├── repositories/    # Слой доступа к данным
├── services/        # Бизнес-логика
├── controllers/     # Обработка HTTP запросов
├── middleware/      # Middleware (auth, error handling)
└── routes/          # Маршрутизация
```

## Основные компоненты

### Модели данных

- **Users** - базовые пользователи (студенты, сотрудники, админы)
- **Students** - расширенная информация о студентах
- **Staff** - информация о сотрудниках
- **Certificates** - справки об обучении

### Роли пользователей

- `student` - студент (может создавать заявки на справки)
- `staff` - сотрудник (может обрабатывать заявки)
- `admin` - администратор (полный доступ)

### Статусы справок

- `pending` - ожидает обработки
- `in_progress` - в процессе оформления
- `ready` - готова к выдаче
- `issued` - выдана
- `rejected` - отклонена

## API Endpoints

### Авторизация

- `POST /api/auth/register` - Регистрация
- `POST /api/auth/login` - Вход
- `POST /api/auth/refresh` - Обновление токена
- `POST /api/auth/logout` - Выход (требует auth)
- `GET /api/auth/me` - Информация о текущем пользователе (требует auth)

### Справки

- `POST /api/certificates` - Создать заявку на справку (требует auth, student)
- `GET /api/certificates/my` - Мои справки (требует auth, student)
- `GET /api/certificates/:id` - Получить справку по ID (требует auth)
- `GET /api/certificates/pending/list` - Список ожидающих справок (требует auth, staff/admin)
- `POST /api/certificates/:id/assign` - Назначить справку себе (требует auth, staff/admin)
- `PATCH /api/certificates/:id/status` - Изменить статус справки (требует auth, staff/admin)
- `GET /api/certificates/admin/statistics` - Статистика (требует auth, admin)

## Переменные окружения

```env
DATABASE_URL=postgresql://user:password@postgres:5432/dbname
REDIS_URL=redis://redis:6379
JWT_SECRET=your-secret-key
NODE_ENV=development
PORT=3000
```

## Запуск

```bash
# Установка зависимостей
npm install

# Разработка
npm run dev

# Сборка
npm run build

# Запуск
npm start
```


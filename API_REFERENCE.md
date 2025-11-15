# 📖 API Reference - MAX Bot

Полная документация API эндпоинтов системы MAX Bot.

## 📍 Base URL

```
Development: http://localhost:8080/api
Production:  https://your-domain.com/api
```

## 🔐 Аутентификация

API использует JWT (JSON Web Tokens) для аутентификации.

### Получение токена

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Ответ:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "role": "student",
      "first_name": "Иван",
      "last_name": "Иванов"
    },
    "tokens": {
      "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "expires_in": 900
    }
  }
}
```

### Использование токена

Добавьте заголовок Authorization ко всем защищенным запросам:

```http
Authorization: Bearer <access_token>
```

---

## 🔑 Authentication Endpoints

### 1. Регистрация пользователя

Создание нового пользователя (студент или сотрудник).

```http
POST /api/auth/register
Content-Type: application/json
```

**Тело запроса:**
```json
{
  "email": "student@example.com",
  "password": "SecurePass123!",
  "first_name": "Иван",
  "last_name": "Иванов",
  "middle_name": "Петрович",
  "phone": "+7 (999) 123-45-67",
  "role": "student",
  "student_data": {
    "student_id": "2021-0001",
    "group_name": "ИТ-301",
    "faculty": "Факультет информационных технологий",
    "specialty": "Программная инженерия",
    "year_of_study": 3
  }
}
```

Для сотрудника:
```json
{
  "email": "staff@example.com",
  "password": "SecurePass123!",
  "first_name": "Мария",
  "last_name": "Петрова",
  "role": "staff",
  "staff_data": {
    "position": "Специалист деканата",
    "department": "Деканат ФИТ"
  }
}
```

**Ответ (201 Created):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 5,
      "email": "student@example.com",
      "role": "student",
      "first_name": "Иван",
      "last_name": "Иванов",
      "middle_name": "Петрович",
      "phone": "+7 (999) 123-45-67"
    },
    "tokens": {
      "access_token": "...",
      "refresh_token": "...",
      "expires_in": 900
    }
  }
}
```

### 2. Вход в систему

```http
POST /api/auth/login
Content-Type: application/json
```

**Тело запроса:**
```json
{
  "email": "student@example.com",
  "password": "SecurePass123!"
}
```

**Ответ (200 OK):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 5,
      "email": "student@example.com",
      "role": "student",
      "first_name": "Иван",
      "last_name": "Иванов"
    },
    "tokens": {
      "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "expires_in": 900
    }
  }
}
```

### 3. Обновление токена

```http
POST /api/auth/refresh
Content-Type: application/json
```

**Тело запроса:**
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Ответ (200 OK):**
```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expires_in": 900
  }
}
```

### 4. Выход из системы

```http
POST /api/auth/logout
Authorization: Bearer <access_token>
```

**Ответ (200 OK):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

### 5. Информация о текущем пользователе

```http
GET /api/auth/me
Authorization: Bearer <access_token>
```

**Ответ (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 5,
    "email": "student@example.com",
    "role": "student",
    "first_name": "Иван",
    "last_name": "Иванов",
    "middle_name": "Петрович",
    "phone": "+7 (999) 123-45-67",
    "student_data": {
      "student_id": "2021-0001",
      "group_name": "ИТ-301",
      "faculty": "Факультет информационных технологий",
      "specialty": "Программная инженерия",
      "year_of_study": 3
    }
  }
}
```

---

## 👤 User Endpoints

### 1. Список пользователей

Доступно только для администраторов.

```http
GET /api/users
Authorization: Bearer <access_token>
```

**Query параметры:**
- `role` - Фильтр по роли (student, staff, admin)
- `page` - Номер страницы (default: 1)
- `limit` - Количество на странице (default: 20)

**Пример:**
```http
GET /api/users?role=student&page=1&limit=10
```

**Ответ (200 OK):**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": 5,
        "email": "student@example.com",
        "role": "student",
        "first_name": "Иван",
        "last_name": "Иванов",
        "created_at": "2025-01-15T10:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 45,
      "total_pages": 5
    }
  }
}
```

### 2. Получить пользователя по ID

```http
GET /api/users/:id
Authorization: Bearer <access_token>
```

**Ответ (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 5,
    "email": "student@example.com",
    "role": "student",
    "first_name": "Иван",
    "last_name": "Иванов",
    "middle_name": "Петрович",
    "phone": "+7 (999) 123-45-67",
    "student_data": {
      "student_id": "2021-0001",
      "group_name": "ИТ-301",
      "faculty": "Факультет информационных технологий",
      "specialty": "Программная инженерия",
      "year_of_study": 3
    },
    "created_at": "2025-01-15T10:30:00Z",
    "updated_at": "2025-01-15T10:30:00Z"
  }
}
```

### 3. Обновить пользователя

```http
PUT /api/users/:id
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Тело запроса:**
```json
{
  "first_name": "Иван",
  "last_name": "Иванов",
  "phone": "+7 (999) 111-22-33",
  "student_data": {
    "year_of_study": 4
  }
}
```

**Ответ (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 5,
    "email": "student@example.com",
    "first_name": "Иван",
    "last_name": "Иванов",
    "phone": "+7 (999) 111-22-33",
    "student_data": {
      "year_of_study": 4
    },
    "updated_at": "2025-01-15T14:20:00Z"
  }
}
```

### 4. Удалить пользователя

Доступно только администраторам.

```http
DELETE /api/users/:id
Authorization: Bearer <access_token>
```

**Ответ (200 OK):**
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

---

## 📄 Certificate Endpoints

Управление заявками на справки.

### 1. Список справок

```http
GET /api/certificates
Authorization: Bearer <access_token>
```

**Query параметры:**
- `status` - Фильтр по статусу (pending, in_progress, ready, issued, rejected)
- `type` - Фильтр по типу (enrollment, academic, attendance, graduation, other)
- `student_id` - ID студента
- `page` - Номер страницы
- `limit` - Количество на странице

**Пример:**
```http
GET /api/certificates?status=pending&page=1&limit=10
```

**Ответ (200 OK):**
```json
{
  "success": true,
  "data": {
    "certificates": [
      {
        "id": 15,
        "student": {
          "id": 5,
          "first_name": "Иван",
          "last_name": "Иванов",
          "student_id": "2021-0001",
          "group_name": "ИТ-301"
        },
        "type": "academic",
        "status": "pending",
        "request_data": {
          "purpose": "Для предоставления в военкомат",
          "copies": 2
        },
        "created_at": "2025-01-15T10:30:00Z",
        "updated_at": "2025-01-15T10:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "total_pages": 3
    }
  }
}
```

### 2. Создать заявку на справку

```http
POST /api/certificates
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Тело запроса:**
```json
{
  "type": "academic",
  "request_data": {
    "purpose": "Для предоставления в военкомат",
    "copies": 2,
    "delivery_method": "pickup",
    "additional_info": "Необходимо срочно"
  }
}
```

**Типы справок:**
- `enrollment` - Справка о зачислении
- `academic` - Академическая справка
- `attendance` - Справка о посещаемости
- `graduation` - Справка о выпуске
- `other` - Другие справки

**Ответ (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": 16,
    "student_id": 5,
    "type": "academic",
    "status": "pending",
    "request_data": {
      "purpose": "Для предоставления в военкомат",
      "copies": 2,
      "delivery_method": "pickup",
      "additional_info": "Необходимо срочно"
    },
    "created_at": "2025-01-15T14:30:00Z"
  }
}
```

### 3. Получить справку по ID

```http
GET /api/certificates/:id
Authorization: Bearer <access_token>
```

**Ответ (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 16,
    "student": {
      "id": 5,
      "first_name": "Иван",
      "last_name": "Иванов",
      "middle_name": "Петрович",
      "student_id": "2021-0001",
      "group_name": "ИТ-301",
      "faculty": "Факультет информационных технологий"
    },
    "staff": null,
    "type": "academic",
    "status": "pending",
    "request_data": {
      "purpose": "Для предоставления в военкомат",
      "copies": 2,
      "delivery_method": "pickup"
    },
    "files": [],
    "created_at": "2025-01-15T14:30:00Z",
    "updated_at": "2025-01-15T14:30:00Z",
    "issued_at": null
  }
}
```

### 4. Обновить справку

Доступно студенту (только свои справки со статусом pending) и сотрудникам/администраторам.

```http
PUT /api/certificates/:id
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Тело запроса:**
```json
{
  "request_data": {
    "purpose": "Для предоставления в банк",
    "copies": 3
  }
}
```

**Ответ (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 16,
    "type": "academic",
    "status": "pending",
    "request_data": {
      "purpose": "Для предоставления в банк",
      "copies": 3
    },
    "updated_at": "2025-01-15T15:00:00Z"
  }
}
```

### 5. Изменить статус справки

Доступно только для сотрудников и администраторов.

```http
PATCH /api/certificates/:id/status
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Тело запроса:**
```json
{
  "status": "in_progress",
  "notes": "Справка принята в работу"
}
```

Для отклонения:
```json
{
  "status": "rejected",
  "rejection_reason": "Недостаточно данных для оформления справки"
}
```

**Статусы справок:**
- `pending` - Ожидает обработки
- `in_progress` - В работе
- `ready` - Готова к выдаче
- `issued` - Выдана
- `rejected` - Отклонена
- `approved` - Одобрена
- `completed` - Завершена

**Ответ (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 16,
    "status": "in_progress",
    "notes": "Справка принята в работу",
    "staff": {
      "id": 10,
      "first_name": "Мария",
      "last_name": "Петрова",
      "position": "Специалист деканата"
    },
    "updated_at": "2025-01-15T15:30:00Z"
  }
}
```

### 6. Удалить справку

Студент может удалять только свои справки со статусом pending. Администраторы могут удалять любые.

```http
DELETE /api/certificates/:id
Authorization: Bearer <access_token>
```

**Ответ (200 OK):**
```json
{
  "success": true,
  "message": "Certificate deleted successfully"
}
```

### 7. Загрузить файл к справке

```http
POST /api/certificates/:id/files
Authorization: Bearer <access_token>
Content-Type: multipart/form-data
```

**Form data:**
- `file` - Файл (PDF, JPG, PNG, максимум 10 MB)
- `description` - Описание файла (опционально)

**Ответ (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": 25,
    "certificate_id": 16,
    "filename": "certificate_academic_2021-0001.pdf",
    "original_name": "справка.pdf",
    "mime_type": "application/pdf",
    "size": 245678,
    "description": "Готовая справка",
    "uploaded_by": 10,
    "created_at": "2025-01-15T16:00:00Z"
  }
}
```

---

## 📊 Statistics Endpoints

### 1. Статистика по справкам

Доступно для сотрудников и администраторов.

```http
GET /api/certificates/statistics
Authorization: Bearer <access_token>
```

**Query параметры:**
- `start_date` - Начальная дата (YYYY-MM-DD)
- `end_date` - Конечная дата (YYYY-MM-DD)

**Ответ (200 OK):**
```json
{
  "success": true,
  "data": {
    "total": 150,
    "by_status": {
      "pending": 25,
      "in_progress": 15,
      "ready": 10,
      "issued": 90,
      "rejected": 10
    },
    "by_type": {
      "enrollment": 30,
      "academic": 80,
      "attendance": 20,
      "graduation": 15,
      "other": 5
    },
    "average_processing_time": "2.5 days"
  }
}
```

---

## ❌ Обработка ошибок

Все ошибки возвращаются в единообразном формате:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Понятное описание ошибки",
    "details": {}
  }
}
```

### HTTP Status Codes

- `200` - OK (Успешный запрос)
- `201` - Created (Ресурс создан)
- `400` - Bad Request (Некорректные данные)
- `401` - Unauthorized (Требуется аутентификация)
- `403` - Forbidden (Недостаточно прав)
- `404` - Not Found (Ресурс не найден)
- `409` - Conflict (Конфликт данных, например, email уже существует)
- `422` - Unprocessable Entity (Ошибка валидации)
- `500` - Internal Server Error (Внутренняя ошибка сервера)

### Примеры ошибок

#### Ошибка валидации
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": {
      "email": "Invalid email format",
      "password": "Password must be at least 8 characters"
    }
  }
}
```

#### Ошибка аутентификации
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid credentials"
  }
}
```

#### Недостаточно прав
```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "You don't have permission to access this resource"
  }
}
```

#### Ресурс не найден
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Certificate with ID 999 not found"
  }
}
```

---

## 🔒 Rate Limiting

API имеет ограничения на количество запросов:

- **Аутентификация**: 5 запросов в минуту
- **Общие запросы**: 100 запросов в минуту

При превышении лимита вы получите ответ `429 Too Many Requests`:

```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Please try again later.",
    "retry_after": 60
  }
}
```

---

## 🧪 Тестирование API

### Использование curl

```bash
# Вход
TOKEN=$(curl -s -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"admin123"}' \
  | jq -r '.data.tokens.access_token')

# Получить текущего пользователя
curl -X GET http://localhost:8080/api/auth/me \
  -H "Authorization: Bearer $TOKEN"

# Создать справку
curl -X POST http://localhost:8080/api/certificates \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "academic",
    "request_data": {
      "purpose": "Для военкомата",
      "copies": 2
    }
  }'

# Получить список справок
curl -X GET "http://localhost:8080/api/certificates?status=pending" \
  -H "Authorization: Bearer $TOKEN"
```

### Использование Postman

1. Импортируйте коллекцию из Swagger UI
2. Настройте переменную окружения `base_url`: `http://localhost:8080/api`
3. Настройте Authorization Type: Bearer Token
4. Используйте `{{access_token}}` в качестве токена

### Swagger UI

Интерактивная документация доступна по адресу:
```
http://localhost:8080/api-docs
```

В Swagger UI вы можете:
- Просматривать все эндпоинты
- Тестировать запросы
- Авторизоваться через кнопку "Authorize"
- Просматривать схемы данных

---

## 📝 Примеры использования

### Полный flow для студента

```bash
# 1. Регистрация
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@example.com",
    "password": "password123",
    "first_name": "Иван",
    "last_name": "Иванов",
    "role": "student",
    "student_data": {
      "student_id": "2021-0001",
      "group_name": "ИТ-301",
      "faculty": "ФИТ",
      "specialty": "Программная инженерия",
      "year_of_study": 3
    }
  }'

# 2. Вход и сохранение токена
TOKEN=$(curl -s -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"student@example.com","password":"password123"}' \
  | jq -r '.data.tokens.access_token')

# 3. Создание заявки на справку
CERT_ID=$(curl -s -X POST http://localhost:8080/api/certificates \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "academic",
    "request_data": {
      "purpose": "Для военкомата",
      "copies": 2
    }
  }' | jq -r '.data.id')

# 4. Проверка статуса справки
curl -X GET "http://localhost:8080/api/certificates/$CERT_ID" \
  -H "Authorization: Bearer $TOKEN"

# 5. Получение списка всех своих справок
curl -X GET "http://localhost:8080/api/certificates" \
  -H "Authorization: Bearer $TOKEN"
```

---

**Версия API**: 1.0  
**Дата обновления**: 15 ноября 2025

Для получения актуальной интерактивной документации используйте Swagger UI: http://localhost:8080/api-docs


# API Documentation

## Базовый URL
`http://localhost:3000/api`

## Авторизация
Большинство эндпоинтов требуют JWT токен в заголовке:
```
Authorization: Bearer <access_token>
```

---

## Эндпоинты для работы с заявками (Applications)

### 1. Получить все заявки текущего пользователя
```
GET /api/applications
```
**Авторизация:** Требуется (student, staff, admin)

**Параметры запроса:**
- `limit` (опционально) - количество записей (по умолчанию: 50)
- `offset` (опционально) - смещение (по умолчанию: 0)

**Ответ:**
```json
[
  {
    "id": "1",
    "fullName": "Иванов Иван Иванович",
    "groupNumber": "ИТ-21-1",
    "admissionYear": "2021",
    "copiesCount": "2",
    "submissionPlace": "Деканат факультета информационных технологий",
    "status": "pending",
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z",
    "notes": null,
    "certificateFile": null
  }
]
```

### 2. Получить заявку по ID
```
GET /api/applications/:id
```
**Авторизация:** Требуется (student может видеть только свои заявки)

**Параметры:**
- `id` - ID заявки

**Ответ:**
```json
{
  "id": "1",
  "fullName": "Иванов Иван Иванович",
  "groupNumber": "ИТ-21-1",
  "admissionYear": "2021",
  "copiesCount": "2",
  "submissionPlace": "Деканат факультета информационных технологий",
  "status": "completed",
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-16T14:20:00Z",
  "notes": null,
  "certificateFile": {
    "id": "1",
    "name": "Справка_Иванов_Иван.pdf",
    "url": "http://localhost:3000/api/certificates/1/file",
    "uploadedAt": "2024-01-16T14:20:00Z"
  }
}
```

### 3. Создать новую заявку
```
POST /api/applications
```
**Авторизация:** Требуется (student, staff, admin)

**Тело запроса:**
```json
{
  "type": "enrollment",
  "request_data": {
    "fullName": "Иванов Иван Иванович",
    "groupNumber": "ИТ-21-1",
    "admissionYear": "2021",
    "copiesCount": "2",
    "submissionPlace": "Деканат факультета информационных технологий"
  }
}
```

**Ответ:**
```json
{
  "id": 1,
  "student_id": 5,
  "type": "enrollment",
  "status": "pending",
  "request_data": {...},
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:30:00Z"
}
```

### 4. Получить все заявки (только для staff/admin)
```
GET /api/applications/admin/all
```
**Авторизация:** Требуется (staff, admin)

**Параметры запроса:**
- `limit` (опционально) - количество записей (по умолчанию: 100)
- `offset` (опционально) - смещение (по умолчанию: 0)

---

## Эндпоинты для работы с файлами

### 5. Загрузить файл справки
```
POST /api/applications/:id/upload
```
**Авторизация:** Требуется (staff, admin)

**Тело запроса:** `multipart/form-data`
- `file` - файл (PDF, DOC, DOCX, максимум 10MB)

**Ответ:**
```json
{
  "id": 1,
  "certificate_id": 1,
  "file_name": "Справка.pdf",
  "file_path": "/uploads/certificates/1234567890_Справка.pdf",
  "file_size": 524288,
  "mime_type": "application/pdf",
  "uploaded_by": 2,
  "uploaded_at": "2024-01-16T14:20:00Z"
}
```

### 6. Скачать файл справки
```
GET /api/certificates/:id/file
```
**Авторизация:** Требуется (student может скачать только свои справки)

**Параметры:**
- `id` - ID заявки (certificate)

**Ответ:** Файл (Content-Type: application/pdf, application/msword и т.д.)

---

## Эндпоинты для работы со справками (Certificates) - старое API

### 7. Получить мои справки
```
GET /api/certificates/my
```
**Авторизация:** Требуется

### 8. Обновить статус справки
```
PATCH /api/certificates/:id/status
```
**Авторизация:** Требуется (staff, admin)

**Тело запроса:**
```json
{
  "status": "approved",
  "rejection_reason": "причина отказа (опционально)"
}
```

### 9. Назначить справку на сотрудника
```
POST /api/certificates/:id/assign
```
**Авторизация:** Требуется (staff, admin)

### 10. Получить статистику (только для admin)
```
GET /api/certificates/admin/statistics
```
**Авторизация:** Требуется (admin)

---

## Статусы заявок

### Для веб-приложения (ApplicationDTO):
- `pending` - Ожидает обработки / В процессе оформления
- `approved` - Одобрена / Готова к выдаче
- `rejected` - Отклонена
- `completed` - Завершена (с прикрепленным файлом)

### Маппинг внутренних статусов:
- `pending`, `in_progress` → `pending`
- `approved`, `ready` → `approved`
- `rejected` → `rejected`
- `completed`, `issued` → `completed`

---

## Типы справок
- `enrollment` - Справка о зачислении
- `academic` - Справка об успеваемости
- `attendance` - Справка о посещаемости
- `graduation` - Справка об окончании
- `other` - Другое

---

## Коды ошибок

- `400` - Неверный запрос
- `401` - Не авторизован
- `403` - Доступ запрещен
- `404` - Не найдено
- `500` - Внутренняя ошибка сервера

---

## Примеры использования

### Создание заявки с фронтенда:
```typescript
import apiService from './services/api';

const application = await apiService.createApplication({
  fullName: "Иванов Иван Иванович",
  groupNumber: "ИТ-21-1",
  admissionYear: "2021",
  copiesCount: "2",
  submissionPlace: "Деканат"
});
```

### Загрузка файла:
```typescript
const file = selectedFile; // File object from input
await apiService.uploadCertificateFile(applicationId, file);
```

### Скачивание файла:
```typescript
const blob = await apiService.downloadCertificateFile(applicationId);
const url = window.URL.createObjectURL(blob);
// Создать ссылку для скачивания
```


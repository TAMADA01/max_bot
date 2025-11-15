# 👨‍💼 Руководство администратора MAX Bot

Краткое руководство для администраторов системы MAX Bot.

## 📋 Содержание

- [Быстрые команды](#быстрые-команды)
- [Управление пользователями](#управление-пользователями)
- [Управление справками](#управление-справками)
- [Мониторинг системы](#мониторинг-системы)
- [Обслуживание](#обслуживание)
- [Решение проблем](#решение-проблем)

---

## ⚡ Быстрые команды

### Управление сервисами

```bash
# Запуск всех сервисов
docker-compose up -d

# Остановка всех сервисов
docker-compose down

# Перезапуск конкретного сервиса
docker-compose restart api

# Просмотр логов
docker-compose logs -f

# Просмотр логов конкретного сервиса
docker-compose logs -f api

# Статус всех сервисов
docker-compose ps

# Обновление и перезапуск
docker-compose pull
docker-compose up -d --build
```

### Работа с базой данных

```bash
# Подключение к PostgreSQL
docker-compose exec postgres psql -U admin -d bot_max

# Backup базы данных
docker-compose exec postgres pg_dump -U admin bot_max > backup_$(date +%Y%m%d).sql

# Восстановление из backup
docker-compose exec -T postgres psql -U admin bot_max < backup.sql

# Просмотр размера БД
docker-compose exec postgres psql -U admin bot_max -c "SELECT pg_size_pretty(pg_database_size('bot_max'));"

# Список таблиц
docker-compose exec postgres psql -U admin bot_max -c "\dt"

# Количество записей в таблицах
docker-compose exec postgres psql -U admin bot_max -c "
SELECT schemaname,relname,n_live_tup 
FROM pg_stat_user_tables 
ORDER BY n_live_tup DESC;"
```

### Мониторинг ресурсов

```bash
# Использование ресурсов контейнерами
docker stats

# Размер Docker volumes
docker system df

# Логи с timestamp
docker-compose logs -f --timestamps

# Только ошибки
docker-compose logs | grep -i error
```

---

## 👥 Управление пользователями

### Через API

#### Получить список всех пользователей

```bash
# Авторизуйтесь
TOKEN=$(curl -s -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"admin123"}' \
  | jq -r '.data.tokens.access_token')

# Получите список пользователей
curl -X GET "http://localhost:8080/api/users" \
  -H "Authorization: Bearer $TOKEN" | jq
```

#### Создать нового пользователя

```bash
# Студент
curl -X POST http://localhost:8080/api/auth/register \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@example.com",
    "password": "password123",
    "first_name": "Иван",
    "last_name": "Иванов",
    "role": "student",
    "student_data": {
      "student_id": "2024-0001",
      "group_name": "ИТ-401",
      "faculty": "ФИТ",
      "specialty": "Программная инженерия",
      "year_of_study": 4
    }
  }'

# Сотрудник
curl -X POST http://localhost:8080/api/auth/register \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "staff@example.com",
    "password": "password123",
    "first_name": "Мария",
    "last_name": "Петрова",
    "role": "staff",
    "staff_data": {
      "position": "Специалист деканата",
      "department": "Деканат ФИТ"
    }
  }'
```

#### Удалить пользователя

```bash
curl -X DELETE http://localhost:8080/api/users/5 \
  -H "Authorization: Bearer $TOKEN"
```

### Через базу данных

```sql
-- Подключитесь к БД
-- docker-compose exec postgres psql -U admin -d bot_max

-- Список всех пользователей
SELECT id, email, role, first_name, last_name, created_at 
FROM users 
ORDER BY created_at DESC;

-- Студенты с их данными
SELECT u.id, u.email, u.first_name, u.last_name,
       s.student_id, s.group_name, s.faculty
FROM users u
JOIN students s ON u.id = s.id
WHERE u.role = 'student';

-- Сотрудники
SELECT u.id, u.email, u.first_name, u.last_name,
       st.position, st.department
FROM users u
JOIN staff st ON u.id = st.id
WHERE u.role = 'staff';

-- Изменить роль пользователя
UPDATE users SET role = 'admin' WHERE email = 'user@example.com';

-- Сбросить пароль (нужен хеш от bcrypt)
UPDATE users 
SET password_hash = '$2a$10$...' 
WHERE email = 'user@example.com';

-- Удалить пользователя
DELETE FROM users WHERE id = 5;
```

---

## 📄 Управление справками

### Через API

#### Получить все справки

```bash
# Все справки
curl -X GET "http://localhost:8080/api/certificates" \
  -H "Authorization: Bearer $TOKEN" | jq

# Справки в статусе pending
curl -X GET "http://localhost:8080/api/certificates?status=pending" \
  -H "Authorization: Bearer $TOKEN" | jq

# Справки конкретного студента
curl -X GET "http://localhost:8080/api/certificates?student_id=5" \
  -H "Authorization: Bearer $TOKEN" | jq
```

#### Изменить статус справки

```bash
# Взять в работу
curl -X PATCH http://localhost:8080/api/certificates/15/status \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "in_progress",
    "notes": "Справка принята в работу"
  }'

# Пометить как готовую
curl -X PATCH http://localhost:8080/api/certificates/15/status \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "ready",
    "notes": "Справка готова к выдаче"
  }'

# Выдана
curl -X PATCH http://localhost:8080/api/certificates/15/status \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "issued"}'

# Отклонить
curl -X PATCH http://localhost:8080/api/certificates/15/status \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "rejected",
    "rejection_reason": "Недостаточно данных"
  }'
```

### Через базу данных

```sql
-- Статистика по справкам
SELECT status, COUNT(*) as count 
FROM certificates 
GROUP BY status;

-- Справки за сегодня
SELECT c.id, u.first_name, u.last_name, c.type, c.status
FROM certificates c
JOIN students s ON c.student_id = s.id
JOIN users u ON s.id = u.id
WHERE c.created_at::date = CURRENT_DATE;

-- Справки в ожидании (старше 3 дней)
SELECT c.id, u.first_name, u.last_name, c.type, 
       c.created_at, 
       EXTRACT(DAY FROM NOW() - c.created_at) as days_waiting
FROM certificates c
JOIN students s ON c.student_id = s.id
JOIN users u ON s.id = u.id
WHERE c.status = 'pending'
  AND c.created_at < NOW() - INTERVAL '3 days'
ORDER BY c.created_at;

-- Изменить статус
UPDATE certificates 
SET status = 'ready', updated_at = NOW()
WHERE id = 15;

-- Массовое изменение старых pending на rejected
UPDATE certificates 
SET status = 'rejected',
    rejection_reason = 'Автоматически отклонено (истек срок)',
    updated_at = NOW()
WHERE status = 'pending' 
  AND created_at < NOW() - INTERVAL '30 days';

-- Удалить старые rejected справки
DELETE FROM certificates 
WHERE status = 'rejected' 
  AND updated_at < NOW() - INTERVAL '1 year';
```

---

## 📊 Мониторинг системы

### Проверка здоровья сервисов

```bash
# Health check всех сервисов
curl http://localhost:8080/health
curl http://localhost:3000
curl http://localhost:3002/health

# Проверка подключения к БД
docker-compose exec postgres pg_isready

# Проверка Redis
docker-compose exec redis redis-cli ping
```

### Просмотр логов

```bash
# Последние 100 строк всех логов
docker-compose logs --tail=100

# Логи за последние 10 минут
docker-compose logs --since 10m

# Следить за логами с фильтрацией
docker-compose logs -f | grep -i "error\|warning"

# Логи конкретного сервиса
docker-compose logs -f api
docker-compose logs -f bot
docker-compose logs -f web

# Экспорт логов в файл
docker-compose logs > logs_$(date +%Y%m%d_%H%M%S).txt
```

### Мониторинг ресурсов

```bash
# Реальное время использования
docker stats

# Размер volumes
docker volume ls
docker system df -v

# Свободное место на диске
df -h

# Использование памяти
free -h

# Загрузка CPU
top -bn1 | grep "Cpu(s)"
```

### Статистика базы данных

```sql
-- Размер базы данных
SELECT pg_size_pretty(pg_database_size('bot_max'));

-- Размер таблиц
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Активные подключения
SELECT COUNT(*) FROM pg_stat_activity 
WHERE datname = 'bot_max';

-- Долгие запросы (более 5 секунд)
SELECT pid, now() - query_start as duration, query 
FROM pg_stat_activity 
WHERE state = 'active' 
  AND now() - query_start > interval '5 seconds'
  AND datname = 'bot_max';
```

---

## 🔧 Обслуживание

### Резервное копирование

#### Автоматический backup

Создайте скрипт `/opt/max_bot/backup.sh`:

```bash
#!/bin/bash

BACKUP_DIR="/opt/max_bot/backups"
DATE=$(date +%Y%m%d_%H%M%S)
DAYS_TO_KEEP=7

# Создать директорию если не существует
mkdir -p "$BACKUP_DIR"

# Backup базы данных
echo "Starting backup..."
cd /opt/max_bot
docker-compose exec -T postgres pg_dump -U admin bot_max | gzip > "$BACKUP_DIR/db_backup_$DATE.sql.gz"

# Backup файлов
tar -czf "$BACKUP_DIR/files_backup_$DATE.tar.gz" ./uploads/ 2>/dev/null

# Удалить старые backup
find "$BACKUP_DIR" -name "db_backup_*.sql.gz" -mtime +$DAYS_TO_KEEP -delete
find "$BACKUP_DIR" -name "files_backup_*.tar.gz" -mtime +$DAYS_TO_KEEP -delete

echo "Backup completed: $BACKUP_DIR"
ls -lh "$BACKUP_DIR"
```

Добавьте в crontab:

```bash
# Редактировать crontab
crontab -e

# Добавить строку (backup каждый день в 2:00)
0 2 * * * /opt/max_bot/backup.sh >> /var/log/max_bot_backup.log 2>&1
```

#### Восстановление из backup

```bash
# Восстановить БД
gunzip -c /opt/max_bot/backups/db_backup_20250115_020000.sql.gz | \
  docker-compose exec -T postgres psql -U admin bot_max

# Восстановить файлы
tar -xzf /opt/max_bot/backups/files_backup_20250115_020000.tar.gz
```

### Обновление системы

```bash
# 1. Backup перед обновлением
/opt/max_bot/backup.sh

# 2. Остановить сервисы
cd /opt/max_bot
docker-compose down

# 3. Обновить код
git pull origin main

# 4. Обновить Docker образы
docker-compose pull

# 5. Пересобрать и запустить
docker-compose up -d --build

# 6. Проверить логи
docker-compose logs -f

# 7. Проверить работу
curl http://localhost:8080/health
```

### Очистка старых данных

```bash
# Очистка Docker
docker system prune -a --volumes

# Очистка старых логов
find /var/log -name "*.log" -mtime +30 -delete

# Очистка временных файлов
docker-compose exec api rm -rf /tmp/*
```

### Оптимизация базы данных

```sql
-- Вакуум и анализ
VACUUM ANALYZE;

-- Пересоздание индексов
REINDEX DATABASE bot_max;

-- Статистика по индексам
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan as index_scans,
  idx_tup_read as tuples_read,
  idx_tup_fetch as tuples_fetched
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;
```

---

## 🐛 Решение проблем

### API не отвечает

```bash
# 1. Проверить статус
docker-compose ps api

# 2. Проверить логи
docker-compose logs --tail=50 api

# 3. Проверить подключение к БД
docker-compose exec api curl http://postgres:5432 -I

# 4. Перезапустить
docker-compose restart api

# 5. Если не помогло - пересоздать
docker-compose up -d --force-recreate api
```

### База данных не работает

```bash
# 1. Проверить статус PostgreSQL
docker-compose ps postgres

# 2. Проверить логи
docker-compose logs --tail=100 postgres

# 3. Проверить готовность
docker-compose exec postgres pg_isready

# 4. Проверить место на диске
df -h

# 5. Перезапустить
docker-compose restart postgres

# 6. Если повреждена БД
docker-compose down
# Восстановить из backup
docker-compose up -d postgres
# Восстановить данные
```

### Бот не работает

```bash
# 1. Проверить логи
docker-compose logs --tail=50 bot

# 2. Проверить токен
docker-compose exec bot printenv MAX_BOT_TOKEN

# 3. Проверить подключение к API
docker-compose exec bot curl http://api:8080/health

# 4. Перезапустить
docker-compose restart bot
```

### Высокая нагрузка

```bash
# 1. Проверить использование ресурсов
docker stats

# 2. Проверить долгие запросы в БД
docker-compose exec postgres psql -U admin bot_max -c "
SELECT pid, now() - query_start as duration, query 
FROM pg_stat_activity 
WHERE state = 'active' 
ORDER BY duration DESC;"

# 3. Убить долгий запрос
# SELECT pg_terminate_backend(PID);

# 4. Очистить кэш Redis (если нужно)
docker-compose exec redis redis-cli FLUSHALL
```

### Закончилось место на диске

```bash
# 1. Проверить использование
df -h
docker system df

# 2. Очистить Docker
docker system prune -a --volumes

# 3. Очистить логи
journalctl --vacuum-time=7d
find /var/log -name "*.log" -mtime +7 -delete

# 4. Удалить старые backup
find /opt/max_bot/backups -mtime +30 -delete

# 5. Очистить старые данные из БД
# SQL запросы для удаления старых записей
```

---

## 📞 Поддержка

### Полезные ссылки

- [README.md](README.md) - Основная документация
- [DEPLOYMENT.md](DEPLOYMENT.md) - Развертывание
- [API_REFERENCE.md](API_REFERENCE.md) - API документация
- [FAQ.md](FAQ.md) - Часто задаваемые вопросы
- Swagger UI: http://localhost:8080/api-docs

### Логирование проблем

При возникновении проблем собирайте следующую информацию:

```bash
# Системная информация
uname -a
docker --version
docker-compose --version

# Статус сервисов
docker-compose ps

# Логи последних 200 строк
docker-compose logs --tail=200 > logs_issue.txt

# Использование ресурсов
docker stats --no-stream > stats.txt

# Конфигурация (без секретов!)
docker-compose config > config.txt
```

---

## 📝 Чеклист ежедневных задач

- [ ] Проверить статус всех сервисов
- [ ] Просмотреть логи на наличие ошибок
- [ ] Проверить новые заявки на справки
- [ ] Проверить использование ресурсов
- [ ] Проверить наличие backup

## 📝 Чеклист еженедельных задач

- [ ] Обновить систему и Docker образы
- [ ] Проверить безопасность (`npm audit`)
- [ ] Очистить старые логи
- [ ] Проверить размер базы данных
- [ ] Выполнить VACUUM ANALYZE
- [ ] Проверить backup и тестовое восстановление

## 📝 Чеклист ежемесячных задач

- [ ] Обзор статистики использования
- [ ] Архивирование старых данных
- [ ] Обновление документации
- [ ] Проверка безопасности
- [ ] Планирование capacity

---

**Последнее обновление**: 15 ноября 2025


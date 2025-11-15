# 🚀 Инструкция по развертыванию MAX Bot

Подробное руководство по развертыванию системы MAX Bot в различных окружениях.

## 📋 Содержание

- [Развертывание для разработки](#развертывание-для-разработки)
- [Развертывание на production сервере](#развертывание-на-production-сервере)
- [Развертывание на облачных платформах](#развертывание-на-облачных-платформах)
- [Настройка CI/CD](#настройка-cicd)
- [Мониторинг и логирование](#мониторинг-и-логирование)

---

## 🔧 Развертывание для разработки

### Вариант 1: Полное развертывание через Docker Compose

Это самый простой способ запустить весь стек для разработки.

#### Шаг 1: Подготовка окружения

```bash
# Клонируйте репозиторий
git clone <repository-url>
cd max_bot

# Создайте .env файл
cp example-env .env
```

#### Шаг 2: Настройка .env

Отредактируйте `.env` файл:

```env
# Database
POSTGRES_DB=bot_max
POSTGRES_USER=admin
POSTGRES_PASSWORD=dev_password_123

# Redis
REDIS_URL=redis://redis:6379

# JWT Secret
JWT_SECRET=dev_jwt_secret_key_12345
JWT_REFRESH_SECRET=dev_refresh_secret_key_12345
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# API Configuration
PORT=8080
NODE_ENV=development
API_BASE_URL=http://localhost:8080

# Admin User
ADMIN_EMAIL=admin@test.com
ADMIN_PASSWORD=admin123
ADMIN_FIRST_NAME=Админ
ADMIN_LAST_NAME=Системы
ADMIN_POSITION=Администратор

# MAX Bot
MAX_BOT_TOKEN=your_bot_token_from_max_platform
MAX_API_BASE=https://platform-api.max.ru
WEBHOOK_URL=http://your-server.com/webhook
```

> 💡 **Совет**: Для разработки можно использовать простые пароли, но для production обязательно используйте сложные и уникальные значения.

#### Шаг 3: Запуск

```bash
# Запуск всех сервисов
docker-compose up -d

# Просмотр логов
docker-compose logs -f

# Проверка статуса
docker-compose ps
```

#### Шаг 4: Проверка

```bash
# Проверка API
curl http://localhost:8080/health

# Проверка Swagger UI
# Откройте в браузере: http://localhost:8080/api-docs

# Проверка Web
# Откройте в браузере: http://localhost:3000
```

---

### Вариант 2: Локальная разработка с отдельным запуском сервисов

Если вы хотите запускать сервисы по отдельности для более гибкой разработки.

#### Шаг 1: Запуск инфраструктуры (PostgreSQL + Redis)

```bash
# Создайте docker-compose.dev.yml
cat > docker-compose.dev.yml << 'EOF'
version: '3.8'

services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: bot_max
      POSTGRES_USER: admin
      POSTGRES_PASSWORD: dev_password_123
    ports:
      - "5432:5432"
    volumes:
      - postgres_dev_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_dev_data:/data

volumes:
  postgres_dev_data:
  redis_dev_data:
EOF

# Запустите только БД и Redis
docker-compose -f docker-compose.dev.yml up -d
```

#### Шаг 2: Запуск API сервера

```bash
cd api

# Установка зависимостей
npm install

# Создайте .env файл
cat > .env << 'EOF'
DATABASE_URL=postgresql://admin:dev_password_123@localhost:5432/bot_max
REDIS_URL=redis://localhost:6379
JWT_SECRET=dev_jwt_secret_key_12345
JWT_REFRESH_SECRET=dev_refresh_secret_key_12345
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
PORT=8080
NODE_ENV=development
UPLOAD_DIR=./uploads/certificates
ADMIN_EMAIL=admin@test.com
ADMIN_PASSWORD=admin123
ADMIN_FIRST_NAME=Админ
ADMIN_LAST_NAME=Системы
ADMIN_POSITION=Администратор
EOF

# Запуск в режиме разработки (с hot-reload)
npm run dev
```

#### Шаг 3: Запуск Web приложения

```bash
# В новом терминале
cd web

# Установка зависимостей
npm install

# Создайте .env файл
cat > .env << 'EOF'
VITE_API_URL=http://localhost:8080/api
EOF

# Запуск dev сервера
npm run dev
```

#### Шаг 4: Запуск бота

```bash
# В новом терминале
cd bot

# Установка зависимостей
npm install

# Создайте .env файл
cat > .env << 'EOF'
DATABASE_URL=postgresql://admin:dev_password_123@localhost:5432/bot_max
API_URL=http://localhost:8080
MAX_BOT_TOKEN=your_bot_token_here
WEBHOOK_URL=http://your-server.com/webhook
MAX_API_BASE=https://platform-api.max.ru
PORT=3002
EOF

# Запуск в режиме разработки
npm run dev
```

---

## 🌐 Развертывание на production сервере

### Требования к серверу

- **ОС**: Ubuntu 20.04+ / Debian 11+ / CentOS 8+
- **RAM**: Минимум 2 GB, рекомендуется 4 GB+
- **CPU**: Минимум 2 ядра
- **Диск**: 20 GB свободного места
- **Docker**: 20.10+
- **Docker Compose**: 2.0+

### Подготовка сервера

#### Шаг 1: Обновление системы

```bash
# Ubuntu/Debian
sudo apt update && sudo apt upgrade -y

# CentOS/RHEL
sudo yum update -y
```

#### Шаг 2: Установка Docker

```bash
# Ubuntu/Debian
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Установка Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Проверка установки
docker --version
docker-compose --version
```

#### Шаг 3: Настройка файрвола

```bash
# UFW (Ubuntu)
sudo ufw allow 22/tcp      # SSH
sudo ufw allow 80/tcp      # HTTP
sudo ufw allow 443/tcp     # HTTPS
sudo ufw enable

# firewalld (CentOS)
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --permanent --add-service=ssh
sudo firewall-cmd --reload
```

### Развертывание приложения

#### Шаг 1: Клонирование репозитория

```bash
cd /opt
sudo git clone <repository-url> max_bot
sudo chown -R $USER:$USER max_bot
cd max_bot
```

#### Шаг 2: Настройка production окружения

```bash
# Создайте .env файл
cat > .env << 'EOF'
# Database
POSTGRES_DB=bot_max_prod
POSTGRES_USER=max_user
POSTGRES_PASSWORD=CHANGE_THIS_STRONG_PASSWORD_123!@#

# Redis
REDIS_URL=redis://redis:6379

# JWT Secret (ОБЯЗАТЕЛЬНО измените!)
JWT_SECRET=CHANGE_THIS_TO_RANDOM_64_CHAR_STRING_ABCD1234
JWT_REFRESH_SECRET=CHANGE_THIS_TO_ANOTHER_RANDOM_64_CHAR_STRING_EFGH5678
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# API Configuration
PORT=8080
NODE_ENV=production
API_BASE_URL=https://your-domain.com

# File Upload
UPLOAD_DIR=./uploads/certificates

# Admin User
ADMIN_EMAIL=admin@your-domain.com
ADMIN_PASSWORD=CHANGE_THIS_ADMIN_PASSWORD
ADMIN_FIRST_NAME=Администратор
ADMIN_LAST_NAME=Системы
ADMIN_POSITION=Главный администратор

# MAX Bot
MAX_BOT_TOKEN=your_production_bot_token
MAX_API_BASE=https://platform-api.max.ru
WEBHOOK_URL=https://your-domain.com/webhook
EOF

# Установите правильные права доступа
chmod 600 .env
```

#### Шаг 3: Обновление docker-compose для production

Создайте `docker-compose.prod.yml`:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15
    container_name: max_bot_postgres
    environment:
      POSTGRES_DB: ${POSTGRES_DB}
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backups:/backups
    networks:
      - max_bot_network
    restart: always
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER}"]
      interval: 30s
      timeout: 10s
      retries: 3

  redis:
    image: redis:7-alpine
    container_name: max_bot_redis
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data
    networks:
      - max_bot_network
    restart: always
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  api:
    build:
      context: ./api
      dockerfile: Dockerfile
    container_name: max_bot_api
    env_file: .env
    environment:
      - DATABASE_URL=postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres:5432/${POSTGRES_DB}
      - REDIS_URL=redis://redis:6379
      - NODE_ENV=production
    volumes:
      - ./uploads:/app/uploads
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    networks:
      - max_bot_network
    restart: always

  web:
    build:
      context: ./web
      dockerfile: Dockerfile
      args:
        - VITE_API_URL=https://your-domain.com/api
    container_name: max_bot_web
    depends_on:
      - api
    networks:
      - max_bot_network
    restart: always

  bot:
    build:
      context: ./bot
      dockerfile: Dockerfile
    container_name: max_bot_bot
    env_file: .env
    environment:
      - DATABASE_URL=postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres:5432/${POSTGRES_DB}
      - API_URL=http://api:8080
      - NODE_ENV=production
    depends_on:
      postgres:
        condition: service_healthy
      api:
        condition: service_started
    networks:
      - max_bot_network
    restart: always

  nginx:
    image: nginx:alpine
    container_name: max_bot_nginx
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/ssl:/etc/nginx/ssl:ro
      - ./certbot/conf:/etc/letsencrypt:ro
      - ./certbot/www:/var/www/certbot:ro
    depends_on:
      - api
      - web
    networks:
      - max_bot_network
    restart: always

volumes:
  postgres_data:
  redis_data:

networks:
  max_bot_network:
    driver: bridge
```

#### Шаг 4: Настройка Nginx для production

Создайте `nginx/nginx.prod.conf`:

```nginx
# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }
    
    location / {
        return 301 https://$server_name$request_uri;
    }
}

# HTTPS Server
server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # API
    location /api {
        proxy_pass http://api:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Bot webhook
    location /webhook {
        proxy_pass http://bot:3002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Web application
    location / {
        proxy_pass http://web:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Logs
    access_log /var/log/nginx/max_bot_access.log;
    error_log /var/log/nginx/max_bot_error.log;
}
```

#### Шаг 5: Получение SSL сертификата (Let's Encrypt)

```bash
# Установка Certbot
sudo apt install certbot python3-certbot-nginx -y

# Получение сертификата
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Автоматическое обновление
sudo certbot renew --dry-run
```

#### Шаг 6: Запуск приложения

```bash
# Сборка и запуск
docker-compose -f docker-compose.prod.yml up -d --build

# Проверка статуса
docker-compose -f docker-compose.prod.yml ps

# Просмотр логов
docker-compose -f docker-compose.prod.yml logs -f
```

#### Шаг 7: Проверка работы

```bash
# Health check
curl https://your-domain.com/api/health

# Проверка SSL
curl -I https://your-domain.com
```

---

## ☁️ Развертывание на облачных платформах

### AWS (Amazon Web Services)

#### Использование EC2

1. **Создайте EC2 инстанс**:
   - AMI: Ubuntu Server 22.04 LTS
   - Instance Type: t3.medium (или больше)
   - Security Group: открыть порты 80, 443, 22

2. **Подключитесь к инстансу**:
```bash
ssh -i your-key.pem ubuntu@your-ec2-ip
```

3. **Следуйте инструкциям из раздела "Развертывание на production сервере"**

#### Использование ECS (Elastic Container Service)

1. Создайте ECR (Elastic Container Registry) репозитории для каждого сервиса
2. Соберите и загрузите образы
3. Создайте Task Definitions
4. Настройте ECS Service с Load Balancer

### Google Cloud Platform (GCP)

#### Использование Compute Engine

```bash
# Создайте VM инстанс
gcloud compute instances create max-bot-vm \
    --image-family=ubuntu-2204-lts \
    --image-project=ubuntu-os-cloud \
    --machine-type=e2-medium \
    --zone=us-central1-a

# Подключитесь
gcloud compute ssh max-bot-vm

# Следуйте инструкциям для production сервера
```

#### Использование Cloud Run

```bash
# Соберите образы
docker build -t gcr.io/your-project/max-bot-api:latest ./api
docker build -t gcr.io/your-project/max-bot-web:latest ./web
docker build -t gcr.io/your-project/max-bot-bot:latest ./bot

# Загрузите в Container Registry
docker push gcr.io/your-project/max-bot-api:latest
docker push gcr.io/your-project/max-bot-web:latest
docker push gcr.io/your-project/max-bot-bot:latest

# Разверните на Cloud Run
gcloud run deploy max-bot-api \
    --image gcr.io/your-project/max-bot-api:latest \
    --platform managed \
    --region us-central1 \
    --allow-unauthenticated
```

### DigitalOcean

1. **Создайте Droplet**:
   - Image: Ubuntu 22.04
   - Size: Basic, 2 GB RAM / 2 CPUs
   - Add SSH key

2. **Или используйте App Platform**:
```bash
# Создайте doctl config
doctl apps create --spec .do/app.yaml
```

Пример `.do/app.yaml`:
```yaml
name: max-bot
services:
  - name: api
    github:
      repo: your-username/max-bot
      branch: main
      deploy_on_push: true
    build_command: cd api && npm install && npm run build
    run_command: cd api && npm start
    environment_slug: node-js
    instance_count: 1
    instance_size_slug: basic-xxs
    
  - name: web
    github:
      repo: your-username/max-bot
      branch: main
    build_command: cd web && npm install && npm run build
    run_command: cd web && npm run preview
    environment_slug: node-js
    instance_count: 1
    instance_size_slug: basic-xxs

databases:
  - name: max-bot-db
    engine: PG
    version: "15"
    
  - name: max-bot-redis
    engine: REDIS
    version: "7"
```

---

## 🔄 Настройка CI/CD

### GitHub Actions

Создайте `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v3
      
      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v2
      
      - name: Login to Docker Hub
        uses: docker/login-action@v2
        with:
          username: ${{ secrets.DOCKER_USERNAME }}
          password: ${{ secrets.DOCKER_PASSWORD }}
      
      - name: Build and push API
        uses: docker/build-push-action@v4
        with:
          context: ./api
          push: true
          tags: your-username/max-bot-api:latest
      
      - name: Build and push Web
        uses: docker/build-push-action@v4
        with:
          context: ./web
          push: true
          tags: your-username/max-bot-web:latest
      
      - name: Build and push Bot
        uses: docker/build-push-action@v4
        with:
          context: ./bot
          push: true
          tags: your-username/max-bot-bot:latest
      
      - name: Deploy to server
        uses: appleboy/ssh-action@v0.1.10
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            cd /opt/max_bot
            git pull origin main
            docker-compose -f docker-compose.prod.yml pull
            docker-compose -f docker-compose.prod.yml up -d
            docker system prune -af
```

### GitLab CI/CD

Создайте `.gitlab-ci.yml`:

```yaml
stages:
  - build
  - deploy

variables:
  DOCKER_DRIVER: overlay2

build:
  stage: build
  image: docker:latest
  services:
    - docker:dind
  script:
    - docker login -u $CI_REGISTRY_USER -p $CI_REGISTRY_PASSWORD $CI_REGISTRY
    - docker build -t $CI_REGISTRY_IMAGE/api:latest ./api
    - docker build -t $CI_REGISTRY_IMAGE/web:latest ./web
    - docker build -t $CI_REGISTRY_IMAGE/bot:latest ./bot
    - docker push $CI_REGISTRY_IMAGE/api:latest
    - docker push $CI_REGISTRY_IMAGE/web:latest
    - docker push $CI_REGISTRY_IMAGE/bot:latest

deploy:
  stage: deploy
  only:
    - main
  script:
    - apt-get update && apt-get install -y openssh-client
    - eval $(ssh-agent -s)
    - echo "$SSH_PRIVATE_KEY" | tr -d '\r' | ssh-add -
    - mkdir -p ~/.ssh
    - chmod 700 ~/.ssh
    - ssh-keyscan $SERVER_HOST >> ~/.ssh/known_hosts
    - ssh $SERVER_USER@$SERVER_HOST "cd /opt/max_bot && docker-compose -f docker-compose.prod.yml pull && docker-compose -f docker-compose.prod.yml up -d"
```

---

## 📊 Мониторинг и логирование

### Настройка логирования

#### 1. Централизованное логирование с ELK Stack

```yaml
# docker-compose.monitoring.yml
version: '3.8'

services:
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.11.0
    environment:
      - discovery.type=single-node
      - "ES_JAVA_OPTS=-Xms512m -Xmx512m"
    volumes:
      - elasticsearch_data:/usr/share/elasticsearch/data
    networks:
      - monitoring

  logstash:
    image: docker.elastic.co/logstash/logstash:8.11.0
    volumes:
      - ./logstash/config:/usr/share/logstash/pipeline
    networks:
      - monitoring
    depends_on:
      - elasticsearch

  kibana:
    image: docker.elastic.co/kibana/kibana:8.11.0
    ports:
      - "5601:5601"
    environment:
      - ELASTICSEARCH_HOSTS=http://elasticsearch:9200
    networks:
      - monitoring
    depends_on:
      - elasticsearch

volumes:
  elasticsearch_data:

networks:
  monitoring:
```

#### 2. Простое логирование с Loki

```bash
# Установка Promtail для сбора логов
docker run -d --name promtail \
  -v /var/log:/var/log \
  -v /var/lib/docker/containers:/var/lib/docker/containers \
  grafana/promtail:latest \
  -config.file=/etc/promtail/config.yml
```

### Мониторинг метрик

#### Prometheus + Grafana

```yaml
# docker-compose.monitoring.yml
services:
  prometheus:
    image: prom/prometheus:latest
    volumes:
      - ./prometheus/prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus
    ports:
      - "9090:9090"
    networks:
      - monitoring

  grafana:
    image: grafana/grafana:latest
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
    volumes:
      - grafana_data:/var/lib/grafana
    networks:
      - monitoring
    depends_on:
      - prometheus

  node-exporter:
    image: prom/node-exporter:latest
    ports:
      - "9100:9100"
    networks:
      - monitoring

volumes:
  prometheus_data:
  grafana_data:

networks:
  monitoring:
```

#### Пример конфигурации Prometheus (`prometheus/prometheus.yml`):

```yaml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']

  - job_name: 'node-exporter'
    static_configs:
      - targets: ['node-exporter:9100']

  - job_name: 'max-bot-api'
    static_configs:
      - targets: ['api:8080']

  - job_name: 'postgres'
    static_configs:
      - targets: ['postgres-exporter:9187']
```

### Health Checks и Uptime мониторинг

#### 1. Простой health check скрипт

```bash
#!/bin/bash
# health-check.sh

services=("https://your-domain.com/api/health" "https://your-domain.com")

for service in "${services[@]}"; do
    if curl -f -s -o /dev/null "$service"; then
        echo "✅ $service is UP"
    else
        echo "❌ $service is DOWN"
        # Отправьте уведомление (email, Slack, Telegram)
    fi
done
```

#### 2. Настройка cron для регулярных проверок

```bash
# Добавьте в crontab
*/5 * * * * /opt/max_bot/health-check.sh
```

### Backup и восстановление

#### Автоматический backup PostgreSQL

```bash
#!/bin/bash
# backup.sh

BACKUP_DIR="/opt/max_bot/backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/backup_$DATE.sql"

# Создание backup
docker-compose exec -T postgres pg_dump -U admin bot_max > "$BACKUP_FILE"

# Сжатие
gzip "$BACKUP_FILE"

# Удаление старых backup (старше 7 дней)
find "$BACKUP_DIR" -name "backup_*.sql.gz" -mtime +7 -delete

echo "Backup completed: $BACKUP_FILE.gz"
```

#### Настройка автоматического backup

```bash
# Добавьте в crontab для ежедневного backup в 2:00
0 2 * * * /opt/max_bot/backup.sh
```

#### Восстановление из backup

```bash
# Восстановление
gunzip -c /opt/max_bot/backups/backup_20250115_020000.sql.gz | \
  docker-compose exec -T postgres psql -U admin bot_max
```

---

## 🔐 Безопасность в production

### Checklist безопасности

- [ ] Изменены все пароли и секреты по умолчанию
- [ ] Настроен HTTPS с действительным SSL сертификатом
- [ ] Включен файрвол с минимальным набором открытых портов
- [ ] Настроены лимиты rate limiting на API
- [ ] Включено логирование всех запросов
- [ ] Настроен мониторинг и алерты
- [ ] Регулярные backup базы данных
- [ ] Обновление зависимостей и Docker образов
- [ ] Ограничен доступ к админ-панели
- [ ] Настроена проверка на уязвимости (например, Snyk)

---

## 🆘 Troubleshooting

### Проблема: Контейнер постоянно перезапускается

```bash
# Проверьте логи
docker-compose logs -f api

# Проверьте ресурсы
docker stats

# Проверьте health checks
docker inspect --format='{{json .State.Health}}' max_bot_api
```

### Проблема: База данных недоступна

```bash
# Проверьте статус PostgreSQL
docker-compose exec postgres pg_isready

# Проверьте подключение
docker-compose exec api psql $DATABASE_URL -c "SELECT 1"
```

### Проблема: Высокое потребление памяти

```bash
# Ограничьте память для контейнеров в docker-compose.yml
services:
  api:
    deploy:
      resources:
        limits:
          memory: 512M
```

---

## 📞 Поддержка

Если возникли проблемы при развертывании:

1. Проверьте логи: `docker-compose logs -f`
2. Убедитесь, что все переменные окружения установлены правильно
3. Проверьте документацию в README.md
4. Создайте issue в репозитории проекта

---

**Версия**: 1.0  
**Дата**: 15 ноября 2025


FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY tsconfig.json ./

RUN npm ci

COPY src/ ./src/
RUN npm run build

FROM node:18-alpine AS production

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY --from=builder /app/dist ./dist
# Копируем JSON файлы локализации (TypeScript встраивает их в код, но на всякий случай копируем)
COPY --from=builder /app/src/i18n ./dist/i18n

USER node

EXPOSE 3002

CMD ["node", "dist/bot.js"]
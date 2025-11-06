import { MaxMessage } from '../types/max';
import { MaxApiService } from '../services/maxApi';

export class MessageHandler {
  private maxApi: MaxApiService;

  constructor(maxApi: MaxApiService) {
    this.maxApi = maxApi;
  }

  async handleMessage(message: MaxMessage) {
    const text = message.text?.toLowerCase().trim();

    if (!text) return;

    try {
      switch (text) {
        case '/start':
          await this.handleStart(message);
          break;
        case '/help':
          await this.handleHelp(message);
          break;
        case '/status':
          await this.handleStatus(message);
          break;
        default:
          await this.handleEcho(message);
      }
    } catch (error) {
      console.error('Error handling message:', error);
      await this.maxApi.sendMessage(message.chat_id, 'Произошла ошибка при обработке сообщения');
    }
  }

  private async handleStart(message: MaxMessage) {
    const welcomeText = `👋 Привет! Я бот для MAX мессенджера.

Доступные команды:
/start - Начать работу
/help - Помощь
/status - Статус сервисов

Просто отправь мне сообщение, и я отвечу!`;

    await this.maxApi.sendMessage(message.chat_id, welcomeText);
  }

  private async handleHelp(message: MaxMessage) {
    const helpText = `📖 Помощь по боту:

• Я могу отвечать на ваши сообщения
• Проверять статус API сервисов
• Обрабатывать различные команды

Для связи с разработчиком: ...`;

    await this.maxApi.sendMessage(message.chat_id, helpText);
  }

  private async handleStatus(message: MaxMessage) {
    // Проверяем статус API сервиса
    try {
      const apiStatus = await this.checkApiStatus();
      const statusText = `📊 Статус сервисов:
API: ${apiStatus ? '✅ Работает' : '❌ Недоступен'}
База данных: ✅ Активна
Бот: ✅ Активен`;

      await this.maxApi.sendMessage(message.chat_id, statusText);
    } catch (error) {
      await this.maxApi.sendMessage(message.chat_id, '❌ Не удалось проверить статус сервисов');
    }
  }

  private async handleEcho(message: MaxMessage) {
    const responseText = `Вы сказали: "${message.text}"
    
Время: ${new Date().toLocaleString('ru-RU')}
ID сообщения: ${message.id}`;

    await this.maxApi.sendMessage(message.chat_id, responseText);
  }

  private async checkApiStatus(): Promise<boolean> {
    try {
      // Здесь можно добавить проверку вашего API
      const response = await fetch('http://api:3000/health');
      return response.ok;
    } catch {
      return false;
    }
  }
}
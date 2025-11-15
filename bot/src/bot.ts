import { Bot } from '@maxhub/max-bot-api';
import { registerCommands } from './commands';
import { registerMiddlewares } from './middlewares';
import { registerHandlers } from './handlers';
import { setMyCommands } from './SetMyCommands';
import { AuthService } from './services/authService';
import { ApiClient } from './services/apiClient';

const token: string = process.env.MAX_BOT_TOKEN || process.env.BOT_TOKEN || '';
if (!token) {
	console.error('MAX_BOT_TOKEN (or BOT_TOKEN) is required');
	process.exit(1);
}

// Инициализация бота
async function start() {
	try {
		// Создаем API клиент
		const apiClient = new ApiClient();
		
		// Создаем сервисы
		const authService = new AuthService(apiClient);
		
		// Экземпляр бота
		const bot = new Bot(token);

		setMyCommands(bot);
		
		// Подключаем middleware (должен быть первым для расширения контекста)
		registerMiddlewares(bot, authService);
		
		// Регистрируем команды (паттерн: класс в папке commands + добавление в registerCommands)
		registerCommands(bot);
		
		// Прочие обработчики событий
		registerHandlers(bot, authService);
		
		// Старт
		bot.start();
		
		console.log('✅ Bot started successfully');
	} catch (error) {
		console.error('❌ Failed to start bot:', error);
		process.exit(1);
	}
}

start();

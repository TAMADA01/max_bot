import { Bot } from '@maxhub/max-bot-api';
import { registerCommands } from './commands';
import { registerMiddlewares } from './middlewares';
import { registerHandlers } from './handlers';
import { initDatabase, initTables } from './services/database';
import { AuthService } from './services/authService';

const token: string = process.env.MAX_BOT_TOKEN || process.env.BOT_TOKEN || '';
if (!token) {
	console.error('MAX_BOT_TOKEN (or BOT_TOKEN) is required');
	process.exit(1);
}

// Инициализация базы данных
async function start() {
	try {
		await initDatabase();
		await initTables();
		
		// Создаем сервисы
		const authService = new AuthService();
		
		// Экземпляр бота
		const bot = new Bot(token);
		
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

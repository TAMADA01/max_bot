import { Bot } from '@maxhub/max-bot-api';
import { registerCommands } from './commands';
import { registerMiddlewares } from './middlewares';
import { registerHandlers } from './handlers';

const token = process.env.MAX_BOT_TOKEN || process.env.BOT_TOKEN;
if (!token) {
	console.error('MAX_BOT_TOKEN (or BOT_TOKEN) is required');
	process.exit(1);
}

// Экземпляр бота
const bot = new Bot(token);

// Подключаем middleware
registerMiddlewares(bot);

// Регистрируем команды (паттерн: класс в папке commands + добавление в registerCommands)
registerCommands(bot);

// Прочие обработчики событий
registerHandlers(bot);

// Старт
bot.start();

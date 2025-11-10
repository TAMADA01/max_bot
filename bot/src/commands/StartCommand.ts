import { Bot } from '@maxhub/max-bot-api';
import { BotCommand } from './Command';
import { CustomContext } from '../types/context';
import { getStartKeyboard } from '../keyboards/start';

export class StartCommand implements BotCommand {
	register(bot: Bot): void {
		bot.command('start', async (ctx) => {
			const customCtx = ctx as CustomContext;
			await customCtx.reply(customCtx.t('welcome') + '\n\n' + customCtx.t('chooseRole'), {
				attachments: [getStartKeyboard(customCtx) as any]
			});
		});
	}
}



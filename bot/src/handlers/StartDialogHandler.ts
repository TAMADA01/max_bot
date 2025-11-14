import { Bot } from "@maxhub/max-bot-api";
import { getAuthCancelKeyboard } from '../keyboards/auth';
import { CustomContext } from "../types/context";
import { BotHandler } from "./Handler";
import { authStateManager } from '../services/authState';

export class StartDialogHandler implements BotHandler {
    register(bot: Bot): void {
        bot.on('bot_started', async (ctx) => {
            const customCtx = ctx as CustomContext;
            
            // Предлагаем авторизацию
            authStateManager.setState(customCtx.userId || 0, 'waiting_login');
            await customCtx.reply(customCtx.t('welcome') + '\n\n' + customCtx.t('authRequired') + '\n\n' + customCtx.t('Введите Email'), {
                attachments: [getAuthCancelKeyboard(customCtx) as any]
            });
        });
    }
}

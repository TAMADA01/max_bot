import { Bot } from "@maxhub/max-bot-api";
import { getStartKeyboard } from '../keyboards/start';
import { CustomContext } from "../types/context";
import { BotHandler } from "./Handler";

export class StartDialogHandler implements BotHandler {
    register(bot: Bot): void {
        bot.on('bot_started', async (ctx) => {
        const customCtx = ctx as CustomContext
        customCtx.reply('Добро пожаловать!', {
            attachments: [getStartKeyboard(customCtx) as any]
        });
    });
    }

}

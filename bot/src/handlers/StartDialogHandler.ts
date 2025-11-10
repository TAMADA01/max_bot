import { Bot } from "@maxhub/max-bot-api";
import { startKeyboard } from '../keyboards/start';

export function startDialogCommand(bot: Bot){
    bot.on('bot_started', (ctx) => {
        ctx.reply('Добро пожаловать!', {
            attachments: [startKeyboard]
        });
    });
}

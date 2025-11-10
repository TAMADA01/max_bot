import { Bot } from "@maxhub/max-bot-api";


export function setMyCommands(bot: Bot){
    bot.api.setMyCommands([
        {
            name: 'start',
            description: 'Перезапуск бота',
        },
    ]);
}

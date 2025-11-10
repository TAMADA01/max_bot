import { Keyboard } from "@maxhub/max-bot-api";

// Простой пример inline-клавиатуры через raw attachment
export const startKeyboard = Keyboard.inlineKeyboard([
	// 1-я строка с 3-мя кнопками
	[
	  Keyboard.button.callback('default', 'color:default'),
	  Keyboard.button.callback('positive', 'color:positive', { intent: 'positive' }),
	  Keyboard.button.callback('negative', 'color:negative', { intent: 'negative' }),
	], 
	// 2-я строка с 1-й кнопкой
	[Keyboard.button.link('Открыть Max', 'https://max.ru')],
  ]);



import { Keyboard } from "@maxhub/max-bot-api";
import { CustomContext } from '../types/context';

export function getStartKeyboard(ctx: CustomContext) {
	return Keyboard.inlineKeyboard([
		[
			Keyboard.button.callback(ctx.t('student'), 'role:student'),
			Keyboard.button.callback(ctx.t('deanery'), 'role:deanery'),
		],
	]);
}

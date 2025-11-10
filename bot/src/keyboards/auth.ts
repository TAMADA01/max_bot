import { Keyboard } from "@maxhub/max-bot-api";
import { CustomContext } from '../types/context';

export function getAuthCancelKeyboard(ctx: CustomContext) {
	return Keyboard.inlineKeyboard([
		[
			Keyboard.button.callback(ctx.t('cancel'), 'auth:cancel'),
		],
	]);
}


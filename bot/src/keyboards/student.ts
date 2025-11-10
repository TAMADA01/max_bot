import { Keyboard } from "@maxhub/max-bot-api";
import { CustomContext } from '../types/context';

export function getStudentKeyboard(ctx: CustomContext) {
	return Keyboard.inlineKeyboard([
		[
            Keyboard.button.link(ctx.t('viewApplications'), 'https://dev.max.ru/')
			// Keyboard.button.openApp(
			// 	ctx.t('viewApplications'),
			// 	'view-applications', // webApp ID
			// 	ctx.userId || undefined
			// ),
		],
		[
            Keyboard.button.link(ctx.t('createApplication'), 'https://dev.max.ru/')
			// Keyboard.button.openApp(
			// 	ctx.t('createApplication'),
			// 	'create-application', // webApp ID
			// 	ctx.userId || undefined
			// ),
		],
		[
			Keyboard.button.callback(ctx.t('back'), 'back:start'),
		],
	]);
}


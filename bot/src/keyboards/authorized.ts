import { Keyboard } from "@maxhub/max-bot-api";
import { CustomContext } from '../types/context';

// Клавиатура для авторизованного студента
export function getAuthorizedStudentKeyboard(ctx: CustomContext) {
	return Keyboard.inlineKeyboard([
		[
			Keyboard.button.link(ctx.t('activeApplications'), 'https://max.ru/t411_hakaton_bot?startapp=applications')
		],
		[
			Keyboard.button.link(ctx.t('createApplication'), 'https://max.ru/t411_hakaton_bot?startapp=applications/create')
		],
		[
			Keyboard.button.callback(ctx.t('logout'), 'logout')
		],
	]);
}

// Клавиатура для авторизованного сотрудника (deanery)
export function getAuthorizedDeaneryKeyboard(ctx: CustomContext) {
	return Keyboard.inlineKeyboard([
		[
			Keyboard.button.link(ctx.t('activeApplications'), 'https://dev.max.ru/')
		],
		[
			Keyboard.button.callback(ctx.t('logout'), 'logout')
		],
	]);
}


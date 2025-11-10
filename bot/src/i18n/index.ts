type Translations = {
	[key: string]: string | ((params?: Record<string, string>) => string);
};

const translations: Record<'ru' | 'en', Translations> = {
	ru: {
		welcome: 'Добро пожаловать!',
		chooseRole: 'Выберите вашу роль:',
		student: 'Я - студент',
		deanery: 'Я - деканат',
		studentMenu: 'Меню студента:',
		viewApplications: 'Посмотреть заявки',
		createApplication: 'Отправить заявку',
		authRequired: 'Для доступа к функциям деканата требуется авторизация.',
		enterLogin: 'Введите логин:',
		enterPassword: 'Введите пароль:',
		authSuccess: 'Авторизация успешна! Добро пожаловать, {name}!',
		authFailed: 'Неверный логин или пароль. Попробуйте снова.',
		authError: 'Произошла ошибка при авторизации. Попробуйте позже.',
		alreadyAuthorized: 'Вы уже авторизованы.',
		cancel: 'Отмена',
		back: 'Назад',
	},
	en: {
		welcome: 'Welcome!',
		chooseRole: 'Choose your role:',
		student: 'I am a student',
		deanery: 'I am a deanery',
		studentMenu: 'Student menu:',
		viewApplications: 'View applications',
		createApplication: 'Create application',
		authRequired: 'Authorization is required to access deanery functions.',
		enterLogin: 'Enter login:',
		enterPassword: 'Enter password:',
		authSuccess: 'Authorization successful! Welcome, {name}!',
		authFailed: 'Invalid login or password. Please try again.',
		authError: 'An error occurred during authorization. Please try later.',
		alreadyAuthorized: 'You are already authorized.',
		cancel: 'Cancel',
		back: 'Back',
	},
};

export function translate(lang: 'ru' | 'en', key: string, params?: Record<string, string>): string {
	const translation = translations[lang][key];
	if (!translation) {
		return key;
	}
	
	if (typeof translation === 'function') {
		return translation(params);
	}
	
	if (params) {
		return translation.replace(/\{(\w+)\}/g, (match, paramKey) => {
			return params[paramKey] || match;
		});
	}
	
	return translation;
}

export function getTranslator(lang: 'ru' | 'en') {
	return (key: string, params?: Record<string, string>) => translate(lang, key, params);
}


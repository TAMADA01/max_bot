import ruTranslations from './ru.json';
import enTranslations from './en.json';

type Translations = {
	[key: string]: string;
};

const translations: Record<'ru' | 'en', Translations> = {
	ru: ruTranslations,
	en: enTranslations,
};

export function translate(lang: 'ru' | 'en', key: string, params?: Record<string, string>): string {
	const translation = translations[lang][key];
	if (!translation) {
		return key;
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


import moment from 'moment';
import {i18nFactory} from '../../i18n';
import type {ChartKitPlugin, ChartKitLang} from '../../types';

type Settings = {
    plugins: ChartKitPlugin[];
    lang: ChartKitLang;
    locale?: moment.LocaleSpecification;
};
type SettingKey = keyof Settings;

export const DEFAULT_LOCALE_SPECIFICATION: moment.LocaleSpecification = {week: {dow: 1, doy: 7}};

const removeUndefinedValues = <T extends Record<string, any>>(data: T) => {
    return Object.entries(data).reduce((acc, [key, value]) => {
        if (typeof value !== 'undefined') {
            acc[key as keyof T] = value;
        }

        return acc;
    }, {} as T);
};

const updateLocale = (args: {lang: ChartKitLang; locale?: moment.LocaleSpecification}) => {
    const {lang, locale} = args;

    if (locale) {
        moment.updateLocale(lang, locale);
    }

    moment.locale(lang);
    i18nFactory.setLang(lang);
};

class ChartKitSettings {
    private settings: Settings = {
        plugins: [],
        lang: 'en',
    };

    get<T extends SettingKey>(key: T) {
        return this.settings[key];
    }

    set(updates: Partial<Settings>) {
        const filteredUpdates = removeUndefinedValues(updates);

        if (filteredUpdates.lang || filteredUpdates.locale) {
            const lang = filteredUpdates.lang || this.get('lang');
            const locale = filteredUpdates.locale || this.get('locale');
            updateLocale({lang, locale});
        }

        this.settings = {
            ...this.settings,
            ...filteredUpdates,
        };
    }
}

export const settings = new ChartKitSettings();

settings.set({locale: DEFAULT_LOCALE_SPECIFICATION});

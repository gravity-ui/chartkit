import moment from 'moment';
import get from 'lodash/get';
import merge from 'lodash/merge';
import {configure} from '@gravity-ui/uikit';
import {i18nFactory} from '../../i18n';
import type {ChartKitPlugin, ChartKitLang, ChartKitHolidays} from '../../types';

interface Settings {
    plugins: ChartKitPlugin[];
    lang: ChartKitLang;
    locale?: moment.LocaleSpecification;
    extra?: {
        holidays?: ChartKitHolidays;
    };
}

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
    configure({lang});
    i18nFactory.setLang(lang);
};

class ChartKitSettings {
    private settings: Settings = {
        plugins: [],
        lang: 'en',
    };

    get<T extends SettingKey>(key: T) {
        return get(this.settings, key);
    }

    set(updates: Partial<Settings>) {
        const filteredUpdates = removeUndefinedValues(updates);

        if (filteredUpdates.lang || filteredUpdates.locale) {
            const lang = filteredUpdates.lang || this.get('lang');
            const locale = filteredUpdates.locale || this.get('locale');
            updateLocale({lang, locale});
        }

        this.settings = merge(this.settings, filteredUpdates);
    }
}

export const settings = new ChartKitSettings();

settings.set({locale: DEFAULT_LOCALE_SPECIFICATION});

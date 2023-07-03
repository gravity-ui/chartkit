import get from 'lodash/get';
import merge from 'lodash/merge';
import {configure} from '@gravity-ui/uikit';
import {i18nFactory} from '../../i18n';
import type {ChartKitPlugin, ChartKitLang, ChartKitHolidays} from '../../types';

interface Settings {
    plugins: ChartKitPlugin[];
    lang: ChartKitLang;
    extra?: {
        holidays?: ChartKitHolidays;
    };
}

type SettingKey = keyof Settings;

const removeUndefinedValues = <T extends Record<string, any>>(data: T) => {
    return Object.entries(data).reduce((acc, [key, value]) => {
        if (typeof value !== 'undefined') {
            acc[key as keyof T] = value;
        }

        return acc;
    }, {} as T);
};

const updateLang = (lang: ChartKitLang) => {
    configure({lang});
    i18nFactory.setLang(lang);
};

class ChartKitSettings {
    private settings: Settings = {
        plugins: [],
        lang: 'en',
    };

    constructor() {
        updateLang(this.get('lang'));
    }

    get<T extends SettingKey>(key: T) {
        return get(this.settings, key);
    }

    set(updates: Partial<Settings>) {
        const filteredUpdates = removeUndefinedValues(updates);

        if (filteredUpdates.lang) {
            const lang = filteredUpdates.lang || this.get('lang');
            updateLang(lang);
        }

        this.settings = merge(this.settings, filteredUpdates);
    }
}

export const settings = new ChartKitSettings();

import {configure} from '@gravity-ui/uikit';
import get from 'lodash/get';
import mergeWith from 'lodash/mergeWith';

import {i18nFactory} from '../../i18n';
import type {ChartKitHolidays, ChartKitLang, ChartKitPlugin} from '../../types';

import {EventEmitter} from './eventEmitter';
import {mergeSettingStrategy} from './mergeSettingStrategy';

interface Settings {
    plugins: ChartKitPlugin[];
    lang: ChartKitLang;
    extra?: {
        holidays?: ChartKitHolidays;
    };
}

type SettingKey = keyof Settings;
type SettingsEventsMap = {
    'change-lang': ChartKitLang;
};

export const settingsEventEmitter = new EventEmitter<SettingsEventsMap>();

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

        this.settings = mergeWith(this.settings, filteredUpdates, mergeSettingStrategy);

        if (filteredUpdates.lang) {
            const lang = filteredUpdates.lang || this.get('lang');
            updateLang(lang);
            settingsEventEmitter.dispatch('change-lang', lang);
        }
    }
}

export const settings = new ChartKitSettings();

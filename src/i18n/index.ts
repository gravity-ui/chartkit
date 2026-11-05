import type {I18NFn, KeysetData} from '@gravity-ui/i18n';
import {I18N} from '@gravity-ui/i18n';

import type {ChartKitLang} from '../types';

import en from './keysets/en.json';
import ru from './keysets/ru.json';

const i18nFactory = new I18N();
const EN: ChartKitLang = 'en';
const RU: ChartKitLang = 'ru';

i18nFactory.registerKeysets(EN, en);
i18nFactory.registerKeysets(RU, ru);

// The keyset type is inferred from the argument, so declaration files inline it instead of
// importing the JSON: in the declarations of an ES module TypeScript requires an import
// attribute for that, and consumers without `resolveJsonModule` reject it altogether.
function bindI18n<T extends KeysetData>(_keysets: T) {
    return i18nFactory.i18n.bind(i18nFactory) as I18NFn<T>;
}

const i18n = bindI18n(en);

export {i18nFactory, i18n};

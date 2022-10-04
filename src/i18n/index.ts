import {I18N, I18NFn} from '@gravity-ui/i18n';
import type {ChartKitLang} from '../types';
import en from './keysets/en.json';
import ru from './keysets/ru.json';

type Keysets = typeof en;
type TypedI18n = I18NFn<Keysets>;

const i18nFactory = new I18N();
const EN: ChartKitLang = 'en';
const RU: ChartKitLang = 'ru';

i18nFactory.registerKeysets(EN, en);
i18nFactory.registerKeysets(RU, ru);

const i18n = i18nFactory.i18n.bind(i18nFactory) as TypedI18n;

export {i18nFactory, i18n};

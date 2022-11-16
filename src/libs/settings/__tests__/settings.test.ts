import {DEFAULT_LOCALE_SPECIFICATION, settings} from '../settings';

const resetSettings = () =>
    settings.set({
        lang: 'en',
        locale: DEFAULT_LOCALE_SPECIFICATION,
    });

describe('libs/settings', () => {
    it('Default locale should be equal DEFAULT_LOCALE_SPECIFICATION', () => {
        const result = settings.get('locale');
        expect(result).toStrictEqual(DEFAULT_LOCALE_SPECIFICATION);
    });

    it('Default lang should be equal to en', () => {
        const result = settings.get('lang');

        expect(result).toBe('en');
    });

    it('Changed lang should be equal to ru', () => {
        settings.set({
            lang: 'ru',
        });
        const result = settings.get('lang');

        expect(result).toBe('ru');
    });

    beforeAll(resetSettings);
    afterEach(resetSettings);
});

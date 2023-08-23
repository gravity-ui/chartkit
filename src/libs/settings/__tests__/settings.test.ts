import {settings} from '../settings';

const resetSettings = () => settings.set({lang: 'en'});

describe('libs/settings', () => {
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

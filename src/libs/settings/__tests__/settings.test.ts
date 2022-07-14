import {DEFAULT_LOCALE_SPECIFICATION, settings} from '../settings';

describe('libs/settings', () => {
    it('Default locale should be equal DEFAULT_LOCALE_SPECIFICATION', () => {
        const result = settings.get('locale');
        expect(result).toBe(DEFAULT_LOCALE_SPECIFICATION);
    });
});

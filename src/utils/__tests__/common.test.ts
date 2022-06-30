import {getRandomCKId} from '../common';

// length of "ck." + 10 random symbols
const ID_LENGTH = 13;

describe('utils/getRandomCKId', () => {
    it('Id should have 13 symbols', () => {
        const result = getRandomCKId();
        expect(result.length).toBe(ID_LENGTH);
    });
});

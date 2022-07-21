import {CHARTKIT_ERROR_CODE, ChartKitError, isChartKitError} from '../chartkit-error';
import type {ChartKitErrorArgs} from '../chartkit-error';

describe('libs/chartkit-error', () => {
    test.each<[unknown, boolean] /* [error, expected] */>([
        [new ChartKitError(), true],
        [new Error(), false],
        [null, false],
        [undefined, false],
    ])('isChartKitError (args: %j)', (error, expected) => {
        const result = isChartKitError(error);
        expect(result).toEqual(expected);
    });

    test.each<[ChartKitErrorArgs | undefined, ChartKitErrorArgs['code']] /* [args, expected] */>([
        [undefined, CHARTKIT_ERROR_CODE.UNKNOWN],
        [{code: CHARTKIT_ERROR_CODE.NO_DATA}, CHARTKIT_ERROR_CODE.NO_DATA],
    ])('check ChartKitError code (args: %j)', (args, expected) => {
        let result: ChartKitErrorArgs['code'] = '';

        try {
            throw new ChartKitError(args);
        } catch (error) {
            if (isChartKitError(error)) {
                result = error.code;
            }
        }

        expect(result).toEqual(expected);
    });
});

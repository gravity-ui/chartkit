import {ChartKitError, CHARTKIT_ERROR_CODE} from '../../../../../libs';
import {ChartKitWidgetData} from '../../../../../types';
import {validateData} from '../';
import {PIE_SERIES, XY_SERIES} from '../__mocks__';

describe('plugins/d3/validation', () => {
    test.each<any>([undefined, null, {}, {series: {}}, {series: {data: []}}])(
        'validateData should throw an error in case of empty data (data: %j)',
        (data) => {
            let error: ChartKitError | null = null;

            try {
                validateData(data);
            } catch (e) {
                error = e as ChartKitError;
            }

            expect(error?.code).toEqual(CHARTKIT_ERROR_CODE.NO_DATA);
        },
    );

    test.each<any>([
        {series: {data: [{data: [{x: 1, y: 1}]}]}},
        {series: {data: [{type: 'invalid-type', data: [{x: 1, y: 1}]}]}},
    ])('validateData should throw an error in case of incorrect series type (data: %j)', (data) => {
        let error: ChartKitError | null = null;

        try {
            validateData(data);
        } catch (e) {
            error = e as ChartKitError;
        }

        expect(error?.code).toEqual(CHARTKIT_ERROR_CODE.INVALID_DATA);
    });

    test.each<ChartKitWidgetData>([
        XY_SERIES.INVALID_CATEGORY_X,
        XY_SERIES.INVALID_CATEGORY_Y,
        XY_SERIES.INVALID_DATETIME_X,
        XY_SERIES.INVALID_DATETIME_Y,
        XY_SERIES.INVALID_LINEAR_X,
        XY_SERIES.INVALID_LINEAR_Y,
    ])(
        '[XY Series] validateData should throw an error in case of invalid data (data: %j)',
        (data) => {
            let error: ChartKitError | null = null;

            try {
                validateData(data);
            } catch (e) {
                error = e as ChartKitError;
            }

            expect(error?.code).toEqual(CHARTKIT_ERROR_CODE.INVALID_DATA);
        },
    );

    test.each<ChartKitWidgetData>([PIE_SERIES.INVALID_VALUE])(
        '[Pie Series] validateData should throw an error in case of invalid data (data: %j)',
        (data) => {
            let error: ChartKitError | null = null;

            try {
                validateData(data);
            } catch (e) {
                error = e as ChartKitError;
            }

            expect(error?.code).toEqual(CHARTKIT_ERROR_CODE.INVALID_DATA);
        },
    );
});

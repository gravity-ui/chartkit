import type {FormatNumberOptions} from '../../../../../shared';
import type {TooltipLine} from '../../tooltip/types';
import {getFormatOptionsFromLine} from './getFormatOptionsFromLine';

describe('plugins/highcharts/config', () => {
    test.each<[Partial<TooltipLine> | undefined, FormatNumberOptions | undefined]>([
        [{chartKitFormat: 'percent'}, {format: 'percent'}],
        [{}, undefined],
        [undefined, undefined],
    ])('getFormatOptionsFromLine (line: %j)', (line, expected) => {
        const result = getFormatOptionsFromLine(line);
        expect(result).toEqual(expected);
    });
});

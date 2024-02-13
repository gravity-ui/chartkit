import orderBy from 'lodash/orderBy';

import type {HighchartsSortData} from '../../../../types/widget';

export {addShowInNavigatorToSeries} from './addShowInNavigatorToSeries';
export {buildNavigatorFallback} from './buildNavigatorFallback';
export {calculatePrecision} from './calculatePrecision';
export {concatStrings} from './concatStrings';
export {getChartKitFormattedValue} from './getChartKitFormattedValue';
export {getFormatOptionsFromLine} from './getFormatOptionsFromLine';
export {getXAxisThresholdValue} from './getXAxisThresholdValue';
export * from './tooltip';
export {isNavigatorSeries} from './isNavigatorSeries';
export {isSafari} from './isSafari';
export {mergeArrayWithObject} from './mergeArrayWithObject';
export {numberFormat} from './numberFormat';
export {setNavigatorDefaultPeriod} from './setNavigatorDefaultPeriod';

export const getSortedData = <T extends Record<string, any>>(
    data: T[],
    sort: HighchartsSortData = {},
) => {
    const {enabled = false, order = 'desc', iteratee = 'y'} = sort;

    if (!enabled) {
        return [...data];
    }

    return orderBy(data, iteratee, order);
};

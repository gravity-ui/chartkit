import {CHARTKIT_ERROR_CODE, ChartKitError} from '../../../libs';
import type {ChartKitProps} from '../../../types';

function validateSeriesCountLimit(
    series?: ChartKitProps<'gravity-charts'>['data']['series']['data'],
    seriesCountLimit?: number,
) {
    if (typeof seriesCountLimit !== 'number') {
        return;
    }

    const seriesCount = series?.length ?? 0;

    if (seriesCount > seriesCountLimit) {
        throw new ChartKitError({code: CHARTKIT_ERROR_CODE.TOO_MANY_LINES});
    }
}

export function vaildateData(props: ChartKitProps<'gravity-charts'>) {
    const {data, validation} = props;
    const seriesCountLimit = validation?.seriesCountLimit;
    const series = data?.series?.data;
    validateSeriesCountLimit(series, seriesCountLimit);
}

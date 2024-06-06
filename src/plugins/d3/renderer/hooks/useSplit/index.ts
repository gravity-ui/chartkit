import get from 'lodash/get';

import {BaseTextStyle, ChartKitWidgetSplit, PlotOptions} from '../../../../../types';
import {calculateNumericProperty, getHorisontalSvgTextHeight} from '../../utils';

import type {PreparedPlotTitle, PreparedSplit} from './types';
import {PreparedPlot} from './types';

type UseSplitArgs = {
    split?: ChartKitWidgetSplit;
    boundsHeight: number;
    chartWidth: number;
};

const DEFAULT_TITLE_FONT_SIZE = '15px';
const TITLE_PADDINGS = 8 * 2;

function preparePlotTitle(args: {
    title: PlotOptions['title'];
    plotIndex: number;
    plotHeight: number;
    chartWidth: number;
    gap: number;
}): PreparedPlotTitle {
    const {title, plotIndex, plotHeight, chartWidth, gap} = args;
    const titleText = title?.text || '';
    const titleStyle: BaseTextStyle = {
        fontSize: get(title, 'style.fontSize', DEFAULT_TITLE_FONT_SIZE),
        fontWeight: get(title, 'style.fontWeight'),
    };
    const titleHeight = titleText
        ? getHorisontalSvgTextHeight({text: titleText, style: titleStyle}) + TITLE_PADDINGS
        : 0;
    const top = plotIndex * (plotHeight + gap);

    return {
        text: titleText,
        x: chartWidth / 2,
        y: top + titleHeight / 2,
        style: titleStyle,
        height: titleHeight,
    };
}

export function getPlotHeight(args: {
    split: ChartKitWidgetSplit | undefined;
    boundsHeight: number;
    gap: number;
}) {
    const {split, boundsHeight, gap} = args;
    const plots = split?.plots || [];

    if (plots.length > 1) {
        return (boundsHeight - gap * (plots.length - 1)) / plots.length;
    }

    return boundsHeight;
}

export const useSplit = (args: UseSplitArgs): PreparedSplit => {
    const {split, boundsHeight, chartWidth} = args;
    const splitGap = calculateNumericProperty({value: split?.gap, base: boundsHeight}) ?? 0;
    const plotHeight = getPlotHeight({split: split, boundsHeight, gap: splitGap});

    const plots = split?.plots || [];
    return {
        plots: plots.map<PreparedPlot>((p, index) => {
            const title = preparePlotTitle({
                title: p.title,
                plotIndex: index,
                gap: splitGap,
                plotHeight,
                chartWidth,
            });
            const top = index * (plotHeight + splitGap);

            return {
                top: top + title.height,
                height: plotHeight - title.height,
                title,
            };
        }),
        gap: splitGap,
    };
};

import {select} from 'd3';
import get from 'lodash/get';

import type {
    BaseTextStyle,
    ChartKitWidgetData,
    ChartKitWidgetLegend,
    ChartMargin,
} from '../../../../../types/widget-data';

import type {PreparedAxis, PreparedTitle} from './types';

export type ChartOptions = {
    chart: {
        margin: ChartMargin;
    };
    legend: Required<ChartKitWidgetLegend>;
    xAxis: PreparedAxis;
    yAxis: PreparedAxis[];
    title?: PreparedTitle;
};

const DEFAULT_AXIS_LABEL_FONT_SIZE = '11px';
const DEFAULT_TITLE_FONT_SIZE = '15px';

const getHorisontalSvgTextDimensions = (args: {text: string; style?: Partial<BaseTextStyle>}) => {
    const {text, style} = args;
    const textSelection = select(document.body).append('text').text(text);
    const fontSize = get(style, 'fontSize', DEFAULT_AXIS_LABEL_FONT_SIZE);
    let height = 0;

    if (fontSize) {
        textSelection.style('font-size', fontSize);
    }

    textSelection
        .each(function () {
            height = this.getBoundingClientRect().height;
        })
        .remove();

    return height;
};

export const getPreparedTitle = ({
    title,
}: {
    title: ChartKitWidgetData['title'];
}): PreparedTitle | undefined => {
    const titleText = get(title, 'text');
    const titleStyle: BaseTextStyle = {
        fontSize: get(title, 'style.fontSize', DEFAULT_TITLE_FONT_SIZE),
    };
    const titleHeight = titleText
        ? getHorisontalSvgTextDimensions({text: titleText, style: titleStyle})
        : 0;
    const preparedTitle: PreparedTitle | undefined = titleText
        ? {text: titleText, style: titleStyle, height: titleHeight}
        : undefined;

    return preparedTitle;
};

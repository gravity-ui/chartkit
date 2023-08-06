import get from 'lodash/get';

import type {BaseTextStyle, ChartKitWidgetData} from '../../../../../types/widget-data';

import type {PreparedTitle} from './types';
import {getHorisontalSvgTextDimensions} from './utils';

const DEFAULT_TITLE_FONT_SIZE = '15px';

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

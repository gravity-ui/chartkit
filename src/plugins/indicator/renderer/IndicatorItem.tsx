import React from 'react';

import type {ChartKitProps} from '../../../types';
import {block} from '../../../utils/cn';
import type {IndicatorWidgetDataItem} from '../types';

import {IndicatorSecondaryValue} from './IndicatorSecondaryValue';
import {formatValue} from './utils';

const b = block('indicator');

export const IndicatorItem = (
    props: IndicatorWidgetDataItem & {
        defaultColor?: string;
        formatNumber?: ChartKitProps<'indicator'>['formatNumber'];
    },
) => {
    const {formatNumber, content, color, defaultColor, size, title, nowrap, secondaryValue} = props;
    const mods = {size, nowrap, right: secondaryValue?.position === 'right'};
    const style: React.CSSProperties = {color: color || defaultColor};

    let value = content.current.value;

    if (content.current.numberFormat) {
        value = formatValue(content.current);
    } else if (formatNumber && typeof value === 'number') {
        value = formatNumber(value, content.current);
    }

    const valueContent = (
        <div className={b('item-value')} style={style}>
            {value}
        </div>
    );

    return (
        <div className={b('item', mods)}>
            {title && (
                <div className={b('item-title')} title={nowrap ? title : ''}>
                    {title}
                </div>
            )}
            {secondaryValue ? (
                <div className={b('value-row')}>
                    {valueContent}
                    <IndicatorSecondaryValue
                        secondaryValue={secondaryValue}
                        size={size}
                        formatNumber={formatNumber}
                    />
                </div>
            ) : (
                valueContent
            )}
        </div>
    );
};

import block from 'bem-cn-lite';
import React from 'react';

import type {ChartKitProps} from '../../../types';
import type {IndicatorWidgetDataItem} from '../types';

const b = block('chartkit-indicator');

export const IndicatorItem = (
    props: IndicatorWidgetDataItem & {
        defaultColor?: string;
        formatNumber?: ChartKitProps<'indicator'>['formatNumber'];
    },
) => {
    const {formatNumber, content, color, defaultColor, size, title, nowrap} = props;
    const mods = {size, nowrap};
    const style: React.CSSProperties = {color: color || defaultColor};

    let value = content.current.value;

    if (formatNumber && typeof value === 'number') {
        value = formatNumber(value, content.current);
    }

    return (
        <div className={b('item', mods)}>
            {title && (
                <div className={b('item-title')} title={nowrap ? title : ''}>
                    {title}
                </div>
            )}
            <div className={b('item-value')} style={style}>
                {value}
            </div>
        </div>
    );
};

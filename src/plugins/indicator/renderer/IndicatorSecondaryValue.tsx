import React from 'react';

import {ArrowDown as ArrowDownIcon, ArrowUp as ArrowUpIcon} from '@gravity-ui/icons';
import {Icon, Label} from '@gravity-ui/uikit';

import type {ChartKitProps} from '../../../types';
import {block} from '../../../utils/cn';
import type {
    IndicatorSecondaryValue as IndicatorSecondaryValueData,
    IndicatorWidgetDataItem,
} from '../types';

import {formatValue} from './utils';

const b = block('indicator');

const BADGE_SIZE_BY_INDICATOR_SIZE = {s: 'xs', m: 's', l: 's', xl: 'm'} as const;

export function IndicatorSecondaryValue({
    secondaryValue,
    size,
    formatNumber,
}: {
    secondaryValue: IndicatorSecondaryValueData;
    size: IndicatorWidgetDataItem['size'];
    formatNumber?: ChartKitProps<'indicator'>['formatNumber'];
}) {
    const {caption, view = 'text', arrow, arrowLabel, color} = secondaryValue;
    const formattedValue = formatValue(secondaryValue, formatNumber);
    const content = (
        <React.Fragment>
            {arrow && (
                <span
                    className={b('secondary-value-arrow')}
                    role={arrowLabel ? 'img' : undefined}
                    aria-label={arrowLabel}
                >
                    <Icon data={arrow === 'up' ? ArrowUpIcon : ArrowDownIcon} size={14} />
                </span>
            )}
            <span className={b('secondary-value-text')}>{formattedValue}</span>
        </React.Fragment>
    );

    return (
        <div
            className={b('secondary-value')}
            style={{'--indicator-secondary-value-color': color} as React.CSSProperties}
        >
            <div className={b('secondary-value-content')}>
                {view === 'badge' ? (
                    <Label
                        className={b('secondary-value-badge', {background: true})}
                        size={BADGE_SIZE_BY_INDICATOR_SIZE[size ?? 'm']}
                    >
                        <span className={b('secondary-value-badge-content')}>{content}</span>
                    </Label>
                ) : (
                    <span className={b('secondary-value-badge')}>{content}</span>
                )}
                {caption !== null && caption !== undefined && caption !== '' && (
                    <span
                        className={b('secondary-value-caption')}
                        title={typeof caption === 'string' ? caption : undefined}
                    >
                        {caption}
                    </span>
                )}
            </div>
        </div>
    );
}

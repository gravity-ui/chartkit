import React from 'react';

import {Label} from '@gravity-ui/uikit';

import type {ChartKitProps} from '../../../types';
import {block} from '../../../utils/cn';
import type {
    IndicatorSecondaryValue as IndicatorSecondaryValueData,
    IndicatorWidgetDataItem,
} from '../types';

import {formatValue} from './utils';

const b = block('indicator');

const LABEL_SIZES = {s: 'xs', m: 's', l: 's', xl: 'm'} as const;

export function IndicatorSecondaryValue({
    secondaryValue,
    size,
    formatNumber,
}: {
    secondaryValue: IndicatorSecondaryValueData;
    size: IndicatorWidgetDataItem['size'];
    formatNumber?: ChartKitProps<'indicator'>['formatNumber'];
}) {
    const {caption, view = 'text', arrow, color} = secondaryValue;
    const formattedValue = formatValue(secondaryValue, formatNumber);
    const content = (
        <React.Fragment>
            {arrow && (
                <svg
                    className={b('secondary-value-arrow', {down: arrow === 'down'})}
                    width="14"
                    height="14"
                    viewBox="0 0 16 16"
                    fill="currentColor"
                    aria-hidden="true"
                >
                    <path d="M8.53 1.47a.75.75 0 0 0-1.06 0l-4 4a.75.75 0 0 0 1.06 1.06l2.72-2.72V14a.75.75 0 0 0 1.5 0V3.81l2.72 2.72a.75.75 0 0 0 1.06-1.06l-4-4Z" />
                </svg>
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
                        size={LABEL_SIZES[size ?? 'm']}
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

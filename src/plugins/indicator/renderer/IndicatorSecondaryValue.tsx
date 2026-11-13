import React from 'react';

import {ArrowDown as ArrowDownIcon, ArrowUp as ArrowUpIcon} from '@gravity-ui/icons';
import {Icon, Label} from '@gravity-ui/uikit';

import {block} from '../../../utils/cn';
import type {IndicatorItemProps} from '../types';

const b = block('indicator');

const LABEL_SIZE_BY_INDICATOR_SIZE = {s: 'xs', m: 's', l: 's', xl: 'm'} as const;
const ICON_SIZE_BY_INDICATOR_SIZE = {s: 12, m: 14, l: 14, xl: 16} as const;

export function IndicatorSecondaryValue({
    secondaryValue,
    size,
}: {
    secondaryValue: NonNullable<IndicatorItemProps['secondaryValue']>;
    size: IndicatorItemProps['size'];
}) {
    const {value, caption, view = 'text', arrow, color} = secondaryValue;
    const labelSize = LABEL_SIZE_BY_INDICATOR_SIZE[size ?? 'm'];
    const arrowIcon = arrow && (
        <span
            className={b('secondary-value-arrow')}
            role={arrow.ariaLabel ? 'img' : undefined}
            aria-label={arrow.ariaLabel}
        >
            <Icon
                data={arrow.direction === 'up' ? ArrowUpIcon : ArrowDownIcon}
                size={ICON_SIZE_BY_INDICATOR_SIZE[size ?? 'm']}
            />
        </span>
    );

    return (
        <div
            className={b('secondary-value', {view})}
            style={{'--indicator-secondary-value-color': color} as React.CSSProperties}
        >
            <div className={b('secondary-value-content')}>
                {view === 'label' ? (
                    <Label className={b('secondary-value-label')} size={labelSize} icon={arrowIcon}>
                        {value}
                    </Label>
                ) : (
                    <span className={b('secondary-value-text')} style={{color}}>
                        {arrowIcon}
                        <span>{value}</span>
                    </span>
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

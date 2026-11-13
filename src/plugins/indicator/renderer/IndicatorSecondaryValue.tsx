import React from 'react';

import {ArrowDown as ArrowDownIcon, ArrowUp as ArrowUpIcon} from '@gravity-ui/icons';
import {Icon, Label} from '@gravity-ui/uikit';

import {block} from '../../../utils/cn';
import type {IndicatorItemProps} from '../types';

const b = block('indicator');

const BADGE_SIZE_BY_INDICATOR_SIZE = {s: 'xs', m: 's', l: 's', xl: 'm'} as const;

export function IndicatorSecondaryValue({
    secondaryValue,
    size,
}: {
    secondaryValue: NonNullable<IndicatorItemProps['secondaryValue']>;
    size: IndicatorItemProps['size'];
}) {
    const {value, caption, view = 'text', arrow, color} = secondaryValue;
    const content = (
        <React.Fragment>
            {arrow && (
                <span
                    className={b('secondary-value-arrow')}
                    role={arrow.ariaLabel ? 'img' : undefined}
                    aria-label={arrow.ariaLabel}
                >
                    <Icon data={arrow.direction === 'up' ? ArrowUpIcon : ArrowDownIcon} size={14} />
                </span>
            )}
            <span className={b('secondary-value-text')}>{value}</span>
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

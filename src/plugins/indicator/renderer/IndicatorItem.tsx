import React from 'react';

import {block} from '../../../utils/cn';
import type {IndicatorItemProps} from '../internal-types';

import {IndicatorSecondaryValue} from './IndicatorSecondaryValue';

const b = block('indicator');

export const IndicatorItem = (props: IndicatorItemProps) => {
    const {primaryValue, size, title, nowrap, secondaryValue} = props;
    const mods = {size, nowrap, right: secondaryValue?.position === 'right'};
    const style: React.CSSProperties = {color: primaryValue.color};

    const valueContent = (
        <div className={b('item-value')} style={style}>
            {primaryValue.value}
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
                    <IndicatorSecondaryValue secondaryValue={secondaryValue} size={size} />
                </div>
            ) : (
                valueContent
            )}
        </div>
    );
};

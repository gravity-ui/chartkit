import React from 'react';

import {block} from '../../../utils/cn';
import type {IndicatorItemProps} from '../types';

import {IndicatorSecondaryValue} from './IndicatorSecondaryValue';

const b = block('indicator');

export const IndicatorItem = (props: IndicatorItemProps) => {
    const {value, size, title, nowrap, secondaryValue} = props;
    const mods = {size, nowrap, right: secondaryValue?.position === 'right'};
    const style: React.CSSProperties = {color: value.color};

    const valueContent = (
        <div className={b('item-value')} style={style}>
            {value.value}
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

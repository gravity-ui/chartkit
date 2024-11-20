// Copyright 2015 tomkp
// Copyright 2022 YANDEX LLC

import React from 'react';

import type {SplitLayoutType} from './types';

type Props = {
    className?: string;
    children?: React.ReactNode;
    size?: number | string;
    split?: SplitLayoutType;
    style?: React.CSSProperties;
    eleRef?: (node: HTMLDivElement) => void;
};

export class Pane extends React.PureComponent<Props> {
    render() {
        const {children, className, split, style: styleProps, size, eleRef} = this.props;
        const classes = ['Pane', split, className];

        let style: React.CSSProperties = {
            flex: 1,
            position: 'relative',
            outline: 'none',
        };

        if (size !== undefined) {
            if (split === 'vertical') {
                style.width = size;
            } else {
                style.height = size;
                style.display = 'flex';
            }
            style.flex = 'none';
        }

        style = Object.assign({}, style, styleProps || {});

        return (
            <div ref={eleRef} className={classes.join(' ')} style={style}>
                {children}
            </div>
        );
    }
}

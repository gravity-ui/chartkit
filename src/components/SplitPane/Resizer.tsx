// Copyright 2015 tomkp
// Copyright 2022 YANDEX LLC

import React from 'react';

import type {SplitLayoutType} from './types';

export const RESIZER_DEFAULT_CLASSNAME = 'Resizer';

type Props = {
    onMouseDown: React.MouseEventHandler;
    onTouchStart: React.TouchEventHandler;
    onTouchEnd: React.TouchEventHandler;
    className?: string;
    split?: SplitLayoutType;
    style?: React.CSSProperties;
    resizerClassName?: string;
    onClick?: React.MouseEventHandler;
    onDoubleClick?: React.MouseEventHandler;
};

export class Resizer extends React.Component<Props> {
    render() {
        const {
            className,
            onClick,
            onDoubleClick,
            onMouseDown,
            onTouchEnd,
            onTouchStart,
            resizerClassName = RESIZER_DEFAULT_CLASSNAME,
            split,
            style,
        } = this.props;
        const classes = [resizerClassName, split, className];

        return (
            <span
                role="presentation"
                className={classes.join(' ')}
                style={style}
                onMouseDown={(event) => onMouseDown(event)}
                onTouchStart={(event) => {
                    onTouchStart(event);
                }}
                onTouchEnd={(event) => {
                    event.preventDefault();
                    onTouchEnd(event);
                }}
                onClick={(event) => {
                    if (onClick) {
                        event.preventDefault();
                        onClick(event);
                    }
                }}
                onDoubleClick={(event) => {
                    if (onDoubleClick) {
                        event.preventDefault();
                        onDoubleClick(event);
                    }
                }}
            />
        );
    }
}

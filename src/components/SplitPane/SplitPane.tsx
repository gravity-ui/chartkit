/* eslint-disable radix */
/* eslint-disable complexity */

import React from 'react';

import {Pane} from './Pane';
import {RESIZER_DEFAULT_CLASSNAME, Resizer} from './Resizer';
import type {SplitLayoutType} from './types';

export type SplitPaneProps = {
    allowResize?: boolean;
    children?: React.ReactNode;
    className?: string;
    primary?: 'first' | 'second';
    minSize?: number;
    maxSize?: number;
    defaultSize?: number;
    size?: number | string;
    split?: SplitLayoutType;
    onDragStarted?: () => void;
    onDragFinished?: (size?: number | string) => void;
    onChange?: (size: number) => void;
    onResizerClick?: React.MouseEventHandler;
    onResizerDoubleClick?: React.MouseEventHandler;
    style?: React.CSSProperties;
    resizerStyle?: React.CSSProperties;
    paneClassName?: string;
    pane1ClassName?: string;
    pane2ClassName?: string;
    paneStyle?: React.CSSProperties;
    pane1Style?: React.CSSProperties;
    pane2Style?: React.CSSProperties;
    resizerClassName?: string;
    step?: number;
};

type DefaultProps = Required<
    Pick<
        SplitPaneProps,
        | 'allowResize'
        | 'minSize'
        | 'primary'
        | 'split'
        | 'paneClassName'
        | 'pane1ClassName'
        | 'pane2ClassName'
    >
>;

type Props = Omit<
    SplitPaneProps,
    | 'allowResize'
    | 'minSize'
    | 'primary'
    | 'split'
    | 'paneClassName'
    | 'pane1ClassName'
    | 'pane2ClassName'
> &
    DefaultProps;

type State = {
    active: boolean;
    position: number;
    resized: boolean;
    draggedSize?: number | string;
    pane1Size?: number | string;
    pane2Size?: number | string;
    instanceProps: {
        size?: number | string;
    };
};

function unFocus() {
    window.getSelection()?.removeAllRanges();
}

function getDefaultSize(
    defaultSize?: number,
    minSize?: number,
    maxSize?: number,
    draggedSize?: number | string,
) {
    if (typeof draggedSize === 'number') {
        const min = typeof minSize === 'number' ? minSize : 0;
        const max = typeof maxSize === 'number' && maxSize >= 0 ? maxSize : Infinity;
        return Math.max(min, Math.min(max, draggedSize));
    }
    if (defaultSize !== undefined) {
        return defaultSize;
    }
    return minSize;
}

function removeNullChildren(children: React.ReactNode) {
    return React.Children.toArray(children).filter((c) => c);
}

export class SplitPane extends React.Component<Props, State> {
    static defaultProps: DefaultProps = {
        allowResize: true,
        minSize: 50,
        primary: 'first',
        split: 'vertical',
        paneClassName: '',
        pane1ClassName: '',
        pane2ClassName: '',
    };

    static getDerivedStateFromProps(nextProps: Props, prevState: State) {
        return SplitPane.getSizeUpdate(nextProps, prevState);
    }

    // we have to check values since gDSFP is called on every render and more in StrictMode
    static getSizeUpdate(props: Props, state: State) {
        const newState = {} as State;
        const {instanceProps} = state;

        if (instanceProps.size === props.size && props.size !== undefined) {
            return {};
        }

        const newSize =
            props.size === undefined
                ? getDefaultSize(props.defaultSize, props.minSize, props.maxSize, state.draggedSize)
                : props.size;

        if (props.size !== undefined) {
            newState.draggedSize = newSize;
        }

        const isPanel1Primary = props.primary === 'first';

        newState[isPanel1Primary ? 'pane1Size' : 'pane2Size'] = newSize;
        newState[isPanel1Primary ? 'pane2Size' : 'pane1Size'] = undefined;

        newState.instanceProps = {size: props.size};

        return newState;
    }

    splitPane: HTMLDivElement | null = null;
    private pane1: HTMLDivElement | null = null;
    private pane2: HTMLDivElement | null = null;

    constructor(props: Props) {
        super(props);

        // order of setting panel sizes.
        // 1. size
        // 2. getDefaultSize(defaultSize, minsize, maxSize)

        const {size, defaultSize, minSize, maxSize, primary} = props;

        const initialSize =
            size === undefined ? getDefaultSize(defaultSize, minSize, maxSize) : size;

        this.state = {
            active: false,
            resized: false,
            position: 0,
            draggedSize: 0,
            pane1Size: primary === 'first' ? initialSize : undefined,
            pane2Size: primary === 'second' ? initialSize : undefined,

            // these are props that are needed in static functions. ie: gDSFP
            instanceProps: {
                size,
            },
        };
    }

    componentDidMount() {
        document.addEventListener('mouseup', this.onMouseUp);
        document.addEventListener('mousemove', this.onMouseMove);
        document.addEventListener('touchmove', this.onTouchMove);
        this.setState(SplitPane.getSizeUpdate(this.props, this.state));
    }

    componentWillUnmount() {
        document.removeEventListener('mouseup', this.onMouseUp);
        document.removeEventListener('mousemove', this.onMouseMove);
        document.removeEventListener('touchmove', this.onTouchMove);
    }

    render() {
        const {
            allowResize,
            children,
            className,
            onResizerClick,
            onResizerDoubleClick,
            paneClassName,
            pane1ClassName,
            pane2ClassName,
            paneStyle,
            pane1Style: pane1StyleProps,
            pane2Style: pane2StyleProps,
            resizerClassName,
            resizerStyle,
            split,
            style: styleProps,
        } = this.props;

        const {pane1Size, pane2Size} = this.state;

        const disabledClass = allowResize ? '' : 'disabled';
        const resizerClassNamesIncludingDefault = resizerClassName
            ? `${resizerClassName} ${RESIZER_DEFAULT_CLASSNAME}`
            : resizerClassName;

        const notNullChildren = removeNullChildren(children);

        const style: React.CSSProperties = {
            display: 'flex',
            flex: 1,
            height: '100%',
            position: 'absolute',
            outline: 'none',
            overflow: 'hidden',
            MozUserSelect: 'text',
            WebkitUserSelect: 'text',
            msUserSelect: 'text',
            userSelect: 'text',
            ...styleProps,
        };

        if (split === 'vertical') {
            Object.assign(style, {
                flexDirection: 'row',
                left: 0,
                right: 0,
            });
        } else {
            Object.assign(style, {
                bottom: 0,
                flexDirection: 'column',
                minHeight: '100%',
                top: 0,
                width: '100%',
            });
        }

        const classes = ['SplitPane', className, split, disabledClass];

        const pane1Style = {...paneStyle, ...pane1StyleProps};
        const pane2Style = {...paneStyle, ...pane2StyleProps};

        const pane1Classes = ['Pane1', paneClassName, pane1ClassName].join(' ');
        const pane2Classes = ['Pane2', paneClassName, pane2ClassName].join(' ');

        return (
            <div
                className={classes.join(' ')}
                ref={(node) => {
                    this.splitPane = node;
                }}
                style={style}
            >
                <Pane
                    className={pane1Classes}
                    key="pane1"
                    eleRef={(node) => {
                        this.pane1 = node;
                    }}
                    size={pane1Size}
                    split={split}
                    style={pane1Style}
                >
                    {notNullChildren[0]}
                </Pane>
                <Resizer
                    className={disabledClass}
                    onClick={onResizerClick}
                    onDoubleClick={onResizerDoubleClick}
                    onMouseDown={this.onMouseDown}
                    onTouchStart={this.onTouchStart}
                    onTouchEnd={this.onMouseUp}
                    key="resizer"
                    resizerClassName={resizerClassNamesIncludingDefault}
                    split={split}
                    style={resizerStyle || {}}
                />
                <Pane
                    className={pane2Classes}
                    key="pane2"
                    eleRef={(node) => {
                        this.pane2 = node;
                    }}
                    size={pane2Size}
                    split={split}
                    style={pane2Style}
                >
                    {notNullChildren[1]}
                </Pane>
            </div>
        );
    }

    private onMouseDown = (event: React.MouseEvent) => {
        const eventWithTouches = Object.assign({} as React.TouchEvent, event, {
            touches: [{clientX: event.clientX, clientY: event.clientY}],
        });
        this.onTouchStart(eventWithTouches);
    };

    private onTouchStart = (event: React.TouchEvent | TouchEvent) => {
        const {allowResize, onDragStarted, split} = this.props;
        if (allowResize) {
            unFocus();
            const position =
                split === 'vertical' ? event.touches[0].clientX : event.touches[0].clientY;

            if (typeof onDragStarted === 'function') {
                onDragStarted();
            }
            this.setState({
                active: true,
                position,
            });
        }
    };

    private onMouseMove = (event: React.MouseEvent | MouseEvent) => {
        const eventWithTouches = Object.assign({} as React.TouchEvent, event, {
            touches: [{clientX: event.clientX, clientY: event.clientY}],
        });
        this.onTouchMove(eventWithTouches);
    };

    private onTouchMove = (event: React.TouchEvent | TouchEvent) => {
        const {allowResize, maxSize, minSize, onChange, split, step} = this.props;
        const {active, position} = this.state;

        if (allowResize && active) {
            unFocus();
            const isPrimaryFirst = this.props.primary === 'first';
            const ref = isPrimaryFirst ? this.pane1 : this.pane2;
            const ref2 = isPrimaryFirst ? this.pane2 : this.pane1;
            if (ref) {
                const node = ref;
                const node2 = ref2;

                if (node.getBoundingClientRect) {
                    const width = node.getBoundingClientRect().width;
                    const height = node.getBoundingClientRect().height;
                    const current =
                        split === 'vertical' ? event.touches[0].clientX : event.touches[0].clientY;
                    const size = split === 'vertical' ? width : height;
                    let positionDelta = position - current;
                    if (step) {
                        if (Math.abs(positionDelta) < step) {
                            return;
                        }
                        // Integer division
                        // eslint-disable-next-line no-bitwise
                        positionDelta = ~~(positionDelta / step) * step;
                    }
                    let sizeDelta = isPrimaryFirst ? positionDelta : -positionDelta;

                    const pane1Order = parseInt(window.getComputedStyle(node).order);
                    const pane2Order = parseInt(window.getComputedStyle(node2!).order);
                    if (pane1Order > pane2Order) {
                        sizeDelta = -sizeDelta;
                    }

                    let newMaxSize = maxSize;
                    if (maxSize !== undefined && maxSize <= 0) {
                        const splitPane = this.splitPane;
                        if (split === 'vertical') {
                            newMaxSize = splitPane!.getBoundingClientRect().width + maxSize;
                        } else {
                            newMaxSize = splitPane!.getBoundingClientRect().height + maxSize;
                        }
                    }

                    let newSize = size - sizeDelta;
                    const newPosition = position - positionDelta;

                    if (newSize < minSize) {
                        newSize = minSize;
                    } else if (maxSize !== undefined && newSize > newMaxSize!) {
                        newSize = newMaxSize!;
                    } else {
                        this.setState({
                            position: newPosition,
                            resized: true,
                        });
                    }

                    if (onChange) onChange(newSize);

                    this.setState({
                        draggedSize: newSize,
                        [isPrimaryFirst ? 'pane1Size' : 'pane2Size']: newSize,
                    } as unknown as State);
                }
            }
        }
    };

    private onMouseUp = () => {
        const {allowResize, onDragFinished} = this.props;
        const {active, draggedSize} = this.state;
        if (allowResize && active) {
            if (typeof onDragFinished === 'function') {
                onDragFinished(draggedSize);
            }
            this.setState({active: false});
        }
    };
}

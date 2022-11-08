import React from 'react';
import block from 'bem-cn-lite';
import {i18n} from '../i18n';
import {CHARTKIT_ERROR_CODE, ChartKitError, settings} from '../libs';
import {getRandomCKId, typedMemo} from '../utils';
import type {ChartkitType, ChartKitRef, ChartKitWidgetRef, ChartKitProps} from '../types';
import {ErrorBoundary} from './ErrorBoundary/ErrorBoundary';
import {Loader} from './Loader/Loader';

import '@gravity-ui/uikit/styles/styles.scss';
import './ChartKit.scss';

const b = block('chartkit');

type ChartKitComponentProps<T extends ChartkitType> = Omit<ChartKitProps<T>, 'onError'> & {
    instanceRef?: React.ForwardedRef<ChartKitRef | undefined>;
};

const ChartKitComponent = <T extends ChartkitType>(props: ChartKitComponentProps<T>) => {
    const widgetRef = React.useRef<ChartKitWidgetRef>();
    const {instanceRef, id = getRandomCKId(), type, data, onLoad, ...restProps} = props;
    const lang = settings.get('lang');
    const plugins = settings.get('plugins');
    const plugin = plugins.find((iteratedPlugin) => iteratedPlugin.type === type);

    if (!plugin) {
        throw new ChartKitError({
            code: CHARTKIT_ERROR_CODE.UNKNOWN_PLUGIN,
            message: i18n('error', 'label_unknown-plugin', {type}),
        });
    }

    const ChartComponent = plugin.renderer;

    React.useImperativeHandle(
        instanceRef,
        () => ({
            reflow(details) {
                if (widgetRef.current?.reflow) {
                    widgetRef.current.reflow(details);
                }
            },
        }),
        [],
    );

    return (
        <React.Suspense fallback={<Loader />}>
            <div className={b()}>
                <ChartComponent
                    ref={widgetRef}
                    id={id}
                    lang={lang}
                    data={data}
                    onLoad={onLoad}
                    {...restProps}
                />
            </div>
        </React.Suspense>
    );
};

const ChartKitComponentWithErrorBoundary = React.forwardRef<
    ChartKitRef | undefined,
    ChartKitProps<ChartkitType>
>((props, ref) => {
    const {onError, ...componentProps} = props;

    return (
        <ErrorBoundary onError={onError}>
            <ChartKitComponent instanceRef={ref} {...componentProps} />
        </ErrorBoundary>
    );
}) /* https://stackoverflow.com/a/58473012 */ as <T extends ChartkitType>(
    props: ChartKitProps<T> & {ref?: React.ForwardedRef<ChartKitRef | undefined>},
) => ReturnType<typeof ChartKitComponent>;

export const ChartKit = typedMemo(ChartKitComponentWithErrorBoundary);

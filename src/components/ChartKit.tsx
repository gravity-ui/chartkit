import React from 'react';
import block from 'bem-cn-lite';
import {i18n} from '../i18n';
import {CHARTKIT_ERROR_CODE, ChartKitError, settings} from '../libs';
import {getRandomCKId, typedMemo} from '../utils';
import type {
    ChartKitType,
    ChartKitRef,
    ChartKitWidgetRef,
    ChartKitProps,
    ChartRenderedRef,
} from '../types';
import {ErrorBoundary} from './ErrorBoundary/ErrorBoundary';
import {Loader} from './Loader/Loader';

import './ChartKit.scss';

const b = block('chartkit');

type ChartKitComponentProps<T extends ChartKitType> = Omit<ChartKitProps<T>, 'onError'> & {
    instanceRef?: React.ForwardedRef<ChartKitRef | undefined>;
    rendererRef?: ChartRenderedRef<T>;
};

const ChartKitComponent = <T extends ChartKitType>(props: ChartKitComponentProps<T>) => {
    const widgetRef = React.useRef<ChartKitWidgetRef>();
    const {instanceRef, id: propsId, type, isMobile, renderPluginLoader, ...restProps} = props;

    const ckId = React.useMemo(() => getRandomCKId(), []);
    const id = propsId || ckId;

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
        <React.Suspense fallback={renderPluginLoader?.() || <Loader />}>
            <div className={b({mobile: isMobile}, 'chartkit-theme_common')}>
                <ChartComponent ref={widgetRef} id={id} lang={lang} {...restProps} />
            </div>
        </React.Suspense>
    );
};

const ChartKitComponentWithErrorBoundary = React.forwardRef<
    ChartKitRef | undefined,
    ChartKitProps<ChartKitType>
>(function ChartKitComponentWithErrorBoundary(props, ref) {
    return (
        <ErrorBoundary onError={props.onError} data={props.data} renderError={props.renderError}>
            <ChartKitComponent instanceRef={ref} {...props} />
        </ErrorBoundary>
    );
}) /* https://stackoverflow.com/a/58473012 */ as <T extends ChartKitType>(
    props: ChartKitProps<T> & {ref?: React.ForwardedRef<ChartKitRef | undefined>},
) => ReturnType<typeof ChartKitComponent>;

export const ChartKit = typedMemo(ChartKitComponentWithErrorBoundary);

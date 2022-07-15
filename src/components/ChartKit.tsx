import React from 'react';
import block from 'bem-cn-lite';
import {settings} from '../libs';
import {getRandomCKId} from '../utils';
import type {ChartkitType, ChartKitRef, ChartKitWidgetRef, ChartKitProps} from '../types';
import {ErrorBoundary} from './ErrorBoundary/ErrorBoundary';
import {Loader} from './Loader/Loader';

import '@yandex-cloud/uikit/styles/styles.scss';
import '../styles/theme.scss';
import './ChartKit.scss';

const b = block('chartkit');

const Component = React.forwardRef<ChartKitRef | undefined, ChartKitProps<ChartkitType>>(
    (props, ref) => {
        const widgetRef = React.useRef<ChartKitWidgetRef>();
        const {id = getRandomCKId(), type, data, onLoad, onError, ...restProps} = props;
        const lang = settings.get('lang');
        const plugins = settings.get('plugins');
        const plugin = plugins.find((iteratedPlugin) => iteratedPlugin.type === type);

        if (!plugin) {
            return null;
        }

        const ChartComponent = plugin.renderer;

        React.useImperativeHandle(
            ref,
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
            <ErrorBoundary onError={onError}>
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
            </ErrorBoundary>
        );
    },
);

export const ChartKit = React.memo(Component);

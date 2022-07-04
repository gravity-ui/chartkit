import React from 'react';
import block from 'bem-cn-lite';
import {settings} from '../libs';
import {getRandomCKId} from '../utils';
import {ChartKitEvent} from '../constants';
import type {ChartkitType, ChartKitRef, ChartKitProps} from '../types';
import {ErrorBoundary} from './ErrorBoundary/ErrorBoundary';
import {Loader} from './Loader/Loader';

import '@yandex-cloud/uikit/styles/styles.scss';
import '../styles/theme.scss';
import './ChartKit.scss';

const b = block('chartkit');

export const ChartKit = React.forwardRef<ChartKitRef | undefined, ChartKitProps<ChartkitType>>(
    (props, ref) => {
        const {id = getRandomCKId(), type, data, onLoad, ...restProps} = props;
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
                reflow(detail) {
                    document.dispatchEvent(
                        new CustomEvent(ChartKitEvent.REFLOW, {
                            detail,
                            bubbles: true,
                            cancelable: true,
                        }),
                    );
                },
            }),
            [],
        );

        return (
            <ErrorBoundary>
                <React.Suspense fallback={<Loader />}>
                    <div className={b()}>
                        <ChartComponent
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

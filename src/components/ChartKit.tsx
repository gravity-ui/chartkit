import React from 'react';
import {settings} from '../libs';
import {getRandomCKId} from '../utils';
import type {ChartkitType, ChartKitProps} from '../types';
import {ErrorBoundary} from './ErrorBoundary/ErrorBoundary';
import {Loader} from './Loader/Loader';

import './ChartKit.scss';

export const ChartKit = <T extends ChartkitType>(props: ChartKitProps<T>) => {
    const {id = getRandomCKId(), type, data, onLoad, ...restProps} = props;
    const lang = settings.get('lang');
    const plugins = settings.get('plugins');
    const plugin = plugins.find((iteratedPlugin) => iteratedPlugin.type === type);

    if (!plugin) {
        return null;
    }

    const ChartComponent = plugin.renderer;

    return (
        <ErrorBoundary>
            <React.Suspense fallback={<Loader />}>
                <ChartComponent id={id} lang={lang} data={data} onLoad={onLoad} {...restProps} />
            </React.Suspense>
        </ErrorBoundary>
    );
};

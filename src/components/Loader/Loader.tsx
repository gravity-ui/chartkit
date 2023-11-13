import React from 'react';
import {Loader as BaseLoader, LoaderProps as BaseLoaderProps} from '@gravity-ui/uikit';
import {block} from '../../utils/cn';
import type {ChartKitRenderPluginLoader} from '../../types';

import './Loader.scss';

const b = block('loader');

type LoaderProps = BaseLoaderProps & {renderPluginLoader?: ChartKitRenderPluginLoader};

export const Loader = ({renderPluginLoader, ...props}: LoaderProps) => {
    const pluginLoader = renderPluginLoader?.();

    // React.Suspense complains about possible undefined in "fallback" property
    if (typeof pluginLoader !== 'undefined') {
        return pluginLoader as React.JSX.Element;
    }

    return (
        <div className={b()}>
            <BaseLoader {...props} />
        </div>
    );
};

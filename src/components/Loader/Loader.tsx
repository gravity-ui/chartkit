import React from 'react';
import {Loader as BaseLoader, LoaderProps as BaseLoaderProps} from '@yandex-cloud/uikit';

import './Loader.scss';

type LoaderProps = BaseLoaderProps;

export const Loader = (props: LoaderProps) => {
    return (
        <div className="chartkit-loader">
            <BaseLoader {...props} />
        </div>
    );
};

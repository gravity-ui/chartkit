import React from 'react';
import block from 'bem-cn-lite';
import {Loader as BaseLoader, LoaderProps as BaseLoaderProps} from '@gravity-ui/uikit';

import './Loader.scss';

const b = block('chartkit-loader');

type LoaderProps = BaseLoaderProps;

export const Loader = (props: LoaderProps) => {
    return (
        <div className={b()}>
            <BaseLoader {...props} />
        </div>
    );
};

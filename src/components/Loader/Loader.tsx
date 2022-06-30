import React from 'react';
import {Loader as BaseLoader, LoaderProps as BaseLoaderProps} from '@yandex-cloud/uikit';
import {block} from '../../utils';

import './Loader.scss';

const b = block('loader');

type LoaderProps = BaseLoaderProps;

export const Loader = (props: LoaderProps) => {
    return (
        <div className={b()}>
            <BaseLoader {...props} />
        </div>
    );
};

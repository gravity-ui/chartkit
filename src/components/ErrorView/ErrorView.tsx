import React from 'react';
import block from 'bem-cn-lite';
import {i18n} from '../../i18n';
import type {ChartKitError} from '../../libs';

const b = block('chartkit-error');

type Props = {
    error: ChartKitError | Error;
};

export const ErrorView = ({error}: Props) => {
    const message = error.message || i18n('error', 'label_unknown-error');

    return <div className={b()}>{message}</div>;
};

import React from 'react';
import {i18n} from '../../i18n';
import type {ChartKitError} from '../../libs';

type Props = {
    error: ChartKitError | Error;
};

export const ErrorView = ({error}: Props) => {
    const message = error.message || i18n('error', 'label_unknown-error');

    return <div>{message}</div>;
};

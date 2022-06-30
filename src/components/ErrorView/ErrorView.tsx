import React from 'react';
import block from 'bem-cn-lite';
import {i18n} from '../../i18n';

import './ErrorView.scss';

const b = block('chartkit-error');

export const ErrorView = () => {
    return (
        <div className={b()}>
            <div className={b('title')}>{i18n('common', 'error')}</div>
            <div className={b('message')}>{i18n('common', 'error-unknown-extension')}</div>
        </div>
    );
};

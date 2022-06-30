import React from 'react';
import block from 'bem-cn-lite';
import {dict} from '../../dict/dict';
import {settings} from '../../libs';

import './ErrorView.scss';

const b = block('chartkit-error');

export const ErrorView = () => {
    const lang = settings.get('lang');

    return (
        <div className={b()}>
            <div className={b('title')}>{dict(lang, 'error')}</div>
            <div className={b('message')}>{dict(lang, 'error-unknown-extension')}</div>
        </div>
    );
};

import React from 'react';
import {dict} from '../../dict/dict';
import {settings} from '../../libs';

import './ErrorView.scss';

export const ErrorView = () => {
    const lang = settings.get('lang');

    return (
        <div className={'chartkit-error'}>
            <div className={'chartkit-error__title'}>{dict(lang, 'error')}</div>
            <div className={'message'}>{dict(lang, 'error-unknown-extension')}</div>
        </div>
    );
};

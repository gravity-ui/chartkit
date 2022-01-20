import React from 'react';
import {dict} from '../../../dict/dict';
import './ErrorComponent.scss';

type ErrorComponentProps = {
    lang: 'en' | 'ru';
};

export const ErrorComponent = (props: ErrorComponentProps) => {
    return (
        <div className={'chartkit-error'}>
            <div className={'chartkit-error__title'}>{dict(props.lang, 'error')}</div>
            <div className={'message'}>{dict(props.lang, 'error-unknown-extension')}</div>
        </div>
    );
};

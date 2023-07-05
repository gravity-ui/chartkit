import {i18n} from '../i18n';
import type {ChartKitError} from '../libs';

export function getErrorMessage(error: ChartKitError | Error) {
    const code = 'code' in error && error.code;
    return (error.message || code || i18n('error', 'label_unknown-error')).toString();
}

import React from 'react';

import type {ChartKitError} from '../../libs';
import {CHARTKIT_ERROR_CODE} from '../../libs';
import type {ChartKitOnError, ChartKitType, ChartKitWidget, RenderError} from '../../types';
import {getErrorMessage} from '../../utils/getErrorMessage';

type Props = {
    onError?: ChartKitOnError;
    data: ChartKitWidget[ChartKitType]['data'];
    renderError?: RenderError;
};

type State = {
    error?: ChartKitError | Error;
};

export class ErrorBoundary extends React.Component<Props, State> {
    static getDerivedStateFromError(error: Error) {
        return {error};
    }

    state: State = {
        error: undefined,
    };

    componentDidCatch() {
        const {error} = this.state;

        if (error) {
            this.props.onError?.({error});
        }
    }

    componentDidUpdate(prevProps: Readonly<Props>) {
        if (prevProps.data !== this.props.data) {
            const {error} = this.state;
            if (
                error &&
                'code' in error &&
                [CHARTKIT_ERROR_CODE.NO_DATA, CHARTKIT_ERROR_CODE.INVALID_DATA].includes(
                    String(error.code),
                )
            ) {
                this.resetError();
            }
        }
    }

    render() {
        const {error} = this.state;

        if (error) {
            const message = getErrorMessage(error);

            if (this.props.renderError) {
                return this.props.renderError({
                    error,
                    message,
                    resetError: this.resetError,
                });
            }

            return <div>{message}</div>;
        }

        return this.props.children;
    }

    resetError = () => {
        if (this.state.error) {
            this.setState({error: undefined});
        }
    };
}

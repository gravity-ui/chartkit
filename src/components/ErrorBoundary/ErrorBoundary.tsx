import React from 'react';
import type {ChartKitError} from '../../libs';
import type {ChartKitOnError} from '../../types';
import {getErrorMessage} from '../../utils/getErrorMessage';

type Props = {
    onError?: ChartKitOnError;
    resetError?(resetError: () => void): void;
    renderErrorView?: ErrorBoundaryRenderErrorView;
};

type State = {
    error?: ChartKitError | Error;
};

export type ErrorBoundaryRenderErrorViewOpts = {
    message: string;
    error: ChartKitError | Error;
    resetError: () => void;
};

export type ErrorBoundaryRenderErrorView = (
    opts: ErrorBoundaryRenderErrorViewOpts,
) => React.ReactNode;

export class ErrorBoundary extends React.Component<Props, State> {
    static getDerivedStateFromError(error: Error) {
        return {error};
    }

    state: State = {
        error: undefined,
    };

    componentDidCatch() {
        const {error} = this.state;

        this.props.resetError?.(() => {
            this.setState({error: undefined});
        });

        if (error) {
            this.props.onError?.({error});
        }
    }

    render() {
        const {error} = this.state;

        if (error) {
            const message = getErrorMessage(error);

            if (this.props.renderErrorView) {
                return this.props.renderErrorView({
                    error,
                    message,
                    resetError: () => {
                        this.setState({error: undefined});
                    },
                });
            }

            return <div>{message}</div>;
        }

        return this.props.children;
    }
}

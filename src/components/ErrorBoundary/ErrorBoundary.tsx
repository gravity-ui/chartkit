import React from 'react';
import type {ChartKitError} from '../../libs';
import type {ChartKitOnError} from '../../types';
import {ErrorView} from '../ErrorView/ErrorView';

type Props = {
    onError?: ChartKitOnError;
    resetError?(resetError: () => void): void;
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
            return <ErrorView error={error} />;
        }

        return this.props.children;
    }
}

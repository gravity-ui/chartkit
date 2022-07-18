import React from 'react';
import type {ChartKitOnError} from '../../types';
import {ErrorView} from '../ErrorView/ErrorView';

type Props = {
    onError?: ChartKitOnError;
};

type State = {
    error?: Error;
};

export class ErrorBoundary extends React.Component<Props, State> {
    static getDerivedStateFromError(error: Error) {
        return {error};
    }

    state: State = {
        error: undefined,
    };

    componentDidUpdate() {
        const {error} = this.state;

        if (error) {
            this.props.onError?.({error});
        }
    }

    render() {
        if (this.state.error) {
            return <ErrorView />;
        }

        return this.props.children;
    }
}

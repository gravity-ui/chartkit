import React from 'react';
import {ErrorView} from '../ErrorView/ErrorView';

type State = {
    error?: Error;
};

export class ErrorBoundary extends React.Component<{}, State> {
    static getDerivedStateFromError(error: Error) {
        return {error};
    }

    state: State = {
        error: undefined,
    };

    render() {
        if (this.state.error) {
            return <ErrorView />;
        }

        return this.props.children;
    }
}

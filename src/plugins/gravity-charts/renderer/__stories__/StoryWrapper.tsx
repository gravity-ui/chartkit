import React from 'react';

import {settings} from '../../../../libs';
import {GravityChartsPlugin} from '../../index';

settings.set({plugins: [GravityChartsPlugin]});

type Props = {
    children?: React.ReactNode;
    style?: React.CSSProperties;
};

export const StoryWrapper = (props: Props) => {
    const {children, style} = props;

    return (
        <div
            style={{
                height: 300,
                width: '100%',
                ...style,
            }}
        >
            {children}
        </div>
    );
};

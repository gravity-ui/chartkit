import React from 'react';

import {settings} from '../../../../libs';
import {D3Plugin} from '../../index';

settings.set({plugins: [D3Plugin]});

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

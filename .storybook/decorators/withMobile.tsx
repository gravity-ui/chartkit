import React from 'react';
import type {Decorator} from '@storybook/react';
import {useMobile} from '@gravity-ui/uikit';

export const withMobile: Decorator = (Story, context) => {
    const mobileValue = context.globals.platform === 'mobile';

    const [_mobile, setMobile] = useMobile();

    React.useEffect(() => {
        setMobile(mobileValue);
    }, [mobileValue]);

    return <Story {...context} />;
};

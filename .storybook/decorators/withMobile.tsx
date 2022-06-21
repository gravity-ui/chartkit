import React from 'react';
import {Story as StoryType, StoryContext} from '@storybook/react';
import {useMobile} from '@yandex-cloud/uikit';

export function withMobile(Story: StoryType, context: StoryContext) {
    const mobileValue = context.globals.platform === 'mobile';
    const [, setMobile] = useMobile();

    React.useEffect(() => {
        setMobile(mobileValue);
    }, [mobileValue]);

    return <Story {...context} />;
}

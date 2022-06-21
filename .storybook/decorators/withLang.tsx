import React from 'react';
import {Story as StoryType, StoryContext} from '@storybook/react';

export function withLang(Story: StoryType, context: StoryContext) {
    const lang = context.globals.lang;

    return <Story key={lang} {...context} />;
}

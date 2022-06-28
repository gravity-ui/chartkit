import React from 'react';
import {Story as StoryType, StoryContext} from '@storybook/react';
import {settings} from '../../src/libs';

export function withLang(Story: StoryType, context: StoryContext) {
    const lang = context.globals.lang;

    settings.set({lang});

    return <Story key={lang} {...context} />;
}

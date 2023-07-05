import React from 'react';
import {MINIMAL_VIEWPORTS} from '@storybook/addon-viewport';
import type {Decorator} from '@storybook/react';
import {themes} from './theme';
import {withMobile} from './decorators/withMobile';
import {withLang} from './decorators/withLang';
import {DocsDecorator} from './decorators/DocsDecorator/DocsDecorator';
import {ThemeProvider, MobileProvider, configure, Lang} from '@gravity-ui/uikit';

import '@gravity-ui/uikit/styles/styles.scss';

configure({
    lang: Lang.En,
});

const withContextProvider: Decorator = (Story, context) => {
    return (
        <React.StrictMode>
            <ThemeProvider theme={context.globals.theme}>
                <MobileProvider>
                    <Story {...context} />
                </MobileProvider>
            </ThemeProvider>
        </React.StrictMode>
    );
};

export const decorators = [withMobile, withLang, withContextProvider];

export const parameters = {
    docs: {
        theme: themes.light,
        container: DocsDecorator,
    },
    jsx: {showFunctions: true}, // To show functions in sources
    viewport: {
        viewports: MINIMAL_VIEWPORTS,
    },
    options: {
        storySort: {
            order: ['Theme', 'Components', ['Basic']],
            method: 'alphabetical',
        },
    },
};

export const globalTypes = {
    theme: {
        name: 'Theme',
        defaultValue: 'light',
        toolbar: {
            icon: 'mirror',
            items: [
                {value: 'light', right: '☼', title: 'Light'},
                {value: 'dark', right: '☾', title: 'Dark'},
                {value: 'light-hc', right: '☼', title: 'High Contrast Light'},
                {value: 'dark-hc', right: '☾', title: 'High Contrast Dark'},
            ],
        },
    },
    lang: {
        name: 'Language',
        defaultValue: 'en',
        toolbar: {
            icon: 'globe',
            items: [
                {value: 'en', right: '🇬🇧', title: 'En'},
                {value: 'ru', right: '🇷🇺', title: 'Ru'},
            ],
        },
    },
    platform: {
        name: 'Platform',
        defaultValue: 'desktop',
        toolbar: {
            items: [
                {value: 'desktop', title: 'Desktop', icon: 'browser'},
                {value: 'mobile', title: 'Mobile', icon: 'mobile'},
            ],
        },
    },
};

import React from 'react';

import {Lang, MobileProvider, ThemeProvider, configure} from '@gravity-ui/uikit';
import addonDocs from '@storybook/addon-docs';
import type {Decorator} from '@storybook/react-vite';
import {definePreview} from '@storybook/react-vite';
import {MINIMAL_VIEWPORTS} from 'storybook/viewport';

import {DocsDecorator} from './decorators/DocsDecorator/DocsDecorator';
import {withLang} from './decorators/withLang';
import {withMobile} from './decorators/withMobile';
import {themes} from './theme';

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

export default definePreview({
    addons: [addonDocs()],
    decorators: [withMobile, withLang, withContextProvider],
    parameters: {
        backgrounds: {disable: true},
        docs: {
            theme: themes.light,
            container: DocsDecorator,
        },
        jsx: {showFunctions: true}, // To show functions in sources
        viewport: {
            options: MINIMAL_VIEWPORTS,
        },
        options: {
            storySort: {
                order: ['Showcase'],
                includeNames: true,
            },
        },
    },
    globalTypes: {
        theme: {
            toolbar: {
                title: 'Theme',
                icon: 'mirror',
                items: [
                    {value: 'light', right: '☼', title: 'Light'},
                    {value: 'dark', right: '☾', title: 'Dark'},
                    {value: 'light-hc', right: '☼', title: 'High Contrast Light'},
                    {value: 'dark-hc', right: '☾', title: 'High Contrast Dark'},
                ],
                dynamicTitle: true,
            },
        },
        lang: {
            toolbar: {
                title: 'Language',
                icon: 'globe',
                items: [
                    {value: 'en', right: '🇬🇧', title: 'En'},
                    {value: 'ru', right: '🇷🇺', title: 'Ru'},
                ],
                dynamicTitle: true,
            },
        },
        platform: {
            toolbar: {
                title: 'Platform',
                items: [
                    {value: 'desktop', title: 'Desktop', icon: 'browser'},
                    {value: 'mobile', title: 'Mobile', icon: 'mobile'},
                ],
                dynamicTitle: true,
            },
        },
    },
    initialGlobals: {
        theme: 'light',
        lang: 'en',
        platform: 'desktop',
    },
});

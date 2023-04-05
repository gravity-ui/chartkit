import type {StorybookConfig} from '@storybook/core-common';

const config: StorybookConfig = {
    stories: ['../src/**/*.stories.@(ts|tsx)'],
    addons: [
        '@storybook/preset-scss',
        {name: '@storybook/addon-essentials', options: {backgrounds: false}},
        {name: '@storybook/addon-knobs'},
        './theme-addon/register.tsx',
    ],
};

module.exports = config;

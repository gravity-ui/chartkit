import type {StorybookConfig} from '@storybook/react-vite';

const config: StorybookConfig = {
    framework: {
        name: '@storybook/react-vite',
        options: {},
    },
    stories: ['../src/**/*.mdx', '../src/**/*.stories.@(ts|tsx)'],
    addons: ['@storybook/addon-docs'],
    refs: (_config, {configType}) => {
        if (configType !== 'PRODUCTION') {
            return {} as Record<string, {title: string; url: string}>;
        }

        return {
            'gravity-charts': {
                title: 'Gravity Charts',
                url: 'https://preview.gravity-ui.com/charts',
            },
        };
    },
};

export default config;

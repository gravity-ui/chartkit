import type {StorybookConfig} from '@storybook/core-common';

const config: StorybookConfig = {
    stories: ['../src/**/*.stories.@(ts|tsx)'],
    addons: [
        '@storybook/preset-scss',
        {name: '@storybook/addon-essentials', options: {backgrounds: false}},
        './theme-addon/register.tsx',
    ],
    webpackFinal: async (config) => {
        const babelModuleIdx = config.module?.rules?.findIndex((rule) => {
            const use = (Array.isArray(rule.use) ? rule.use?.[0] : rule.use) as {loader: string};
            return use.loader?.includes('babel-loader') && typeof rule.include === 'function';
        });

        if (babelModuleIdx === undefined || babelModuleIdx === -1) {
            return config;
        }

        if (config.module?.rules?.[babelModuleIdx]?.include) {
            const ii = config.module?.rules?.[babelModuleIdx]?.include as (s: string) => boolean;
            config.module.rules[babelModuleIdx].include = (input: string) => {
                const res = ii(input);
                if (
                    input.includes('node_modules/uplot') ||
                    input.includes('node_modules/@gravity-ui/yagr')
                ) {
                    return true;
                }
                return res;
            };
        }

        return config;
    },
};

module.exports = config;

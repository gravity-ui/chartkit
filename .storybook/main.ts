import type {StorybookConfig} from '@storybook/react-vite';
import type {InlineConfig} from 'vite';

const config: StorybookConfig = {
    framework: {
        name: '@storybook/react-vite',
        options: {},
    },
    stories: ['../src/**/*.mdx', '../src/**/*.stories.@(ts|tsx)'],
    addons: ['@storybook/addon-docs', '@storybook/addon-vitest'],
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
    viteFinal: (viteConfig: InlineConfig) => {
        const localPkg = process.env.LOCAL_PKG;

        if (!localPkg) {
            return viteConfig;
        }

        const localPkgs = localPkg.split(',').map((s) => s.trim());

        return {
            ...viteConfig,
            server: {
                ...viteConfig.server,
                watch: {
                    ...viteConfig.server?.watch,
                    ignored: (path: string) =>
                        path.includes('node_modules') &&
                        !localPkgs.some((pkg) => path.includes(pkg)),
                },
            },
            optimizeDeps: {
                ...viteConfig.optimizeDeps,
                exclude: [...(viteConfig.optimizeDeps?.exclude ?? []), ...localPkgs],
            },
        };
    },
};

export default config;

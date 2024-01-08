import path from 'node:path';
import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const isProduction = process.env.NODE_ENV === 'production';

const getNavbarItems = () => {
    return [
        {
            type: 'docSidebar',
            sidebarId: 'docSidebar',
            position: 'left',
            label: 'Docs',
        },
        {
            to: 'api',
            label: 'API',
            position: 'left',
        },
        isProduction && {
            type: 'localeDropdown',
            position: 'right',
        },
        {
            href: 'https://github.com/gravity-ui/chartkit',
            className: 'header-github-link',
            'aria-label': 'GitHub repository',
            position: 'right',
        },
    ].filter(Boolean) as NonNullable<Preset.ThemeConfig['navbar']>['items'];
};

const config: Config = {
    title: 'ChartKit',
    favicon: 'img/favicon.ico',

    // Set the production url of your site here
    url: 'https://github.com',
    // Set the /<baseUrl>/ pathname under which your site is served
    // For GitHub pages deployment, it is often '/<projectName>/'
    baseUrl: '/',

    organizationName: 'gravity-ui',
    projectName: 'chartkit',

    onBrokenLinks: 'throw',
    onBrokenMarkdownLinks: 'warn',

    i18n: {
        defaultLocale: 'en',
        locales: ['en', 'ru'],
    },

    presets: [
        [
            'classic',
            {
                docs: {
                    sidebarPath: './sidebars.ts',
                    editUrl: 'https://github.com/gravity-ui/chartkit/tree/main/documentation/',
                },
                theme: {
                    customCss: './src/css/custom.css',
                },
            } satisfies Preset.Options,
        ],
    ],

    themeConfig: {
        navbar: {
            title: 'ChartKit',
            hideOnScroll: true,
            logo: {
                alt: 'ChartKit logo',
                src: 'img/logo.svg',
            },
            items: getNavbarItems(),
        },
        footer: {
            style: 'dark',
            copyright: `© ${new Date().getFullYear()} Gravity UI Team`,
        },
        prism: {
            theme: prismThemes.github,
            darkTheme: prismThemes.dracula,
        },
    } satisfies Preset.ThemeConfig,

    plugins: [
        [
            // https://github.com/milesj/docusaurus-plugin-typedoc-api/blob/master/packages/plugin/README.md
            require.resolve('docusaurus-plugin-typedoc-api'),
            {
                projectRoot: path.join(__dirname, '..'),
                packages: [
                    {
                        path: './src/types/widget-data',
                        entry: 'index.ts',
                        displayName: 'D3 plugin',
                        slug: 'd3',
                    },
                    {
                        path: './src/plugins/yagr',
                        entry: 'types.ts',
                        displayName: 'Yagr plugin',
                        slug: 'yagr',
                    },
                ],
                typedocOptions: {
                    externalPattern: 'dasd',
                },
                componentProps: {
                    ApiIndex: {
                        sectionTitle: 'Plugins',
                        showVersions: false,
                    },
                },
                transformReflectionName: (pkg) => {
                    if (pkg.packageName === '@gravity-ui/chartkit' && pkg.displayName) {
                        return `${pkg.displayName} Overview`;
                    }

                    return pkg.packageName;
                },
                sortPackages: (a, b) => {
                    if (a.displayName && b.displayName) {
                        return a.displayName.localeCompare(b.displayName);
                    }

                    return a.packageName.localeCompare(b.packageName);
                },
            },
        ],
    ],
};

export default config;

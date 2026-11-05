import baseConfig from '@gravity-ui/eslint-config';
import clientConfig from '@gravity-ui/eslint-config/client';
import importOrderConfig from '@gravity-ui/eslint-config/import-order';
import prettierConfig from '@gravity-ui/eslint-config/prettier';
import storybook from 'eslint-plugin-storybook';
import globals from 'globals';

const esToolkitByFunction = {
    regex: '^es-toolkit(?!/compat/[^/]+$)(/|$)',
    allowTypeImports: true,
    message:
        "Import es-toolkit functions by path, e.g. import get from 'es-toolkit/compat/get': in CommonJS the root and category entries load all of their functions.",
};

export default [
    ...baseConfig,
    ...clientConfig,
    ...prettierConfig,
    ...importOrderConfig,
    ...storybook.configs['flat/recommended'],
    {
        rules: {
            'no-console': ['error', {allow: ['warn', 'error']}],
            'no-restricted-imports': ['error', {patterns: [esToolkitByFunction]}],
        },
    },
    {
        // Library code merges user options and throttles through src/utils
        files: ['src/**'],
        ignores: [
            'src/**/__tests__/**',
            'src/**/__stories__/**',
            'src/**/mocks/**',
            'src/**/*.test.*',
        ],
        rules: {
            'no-restricted-imports': [
                'error',
                {
                    paths: [
                        ...['merge', 'mergeWith', 'defaultsDeep'].map((name) => ({
                            name: `es-toolkit/compat/${name}`,
                            message:
                                "Use merge or mergeWith from 'src/utils/merge': es-toolkit's merge reuses one result for an object shared by several paths.",
                        })),
                        {
                            name: 'es-toolkit/compat/throttle',
                            message:
                                "Use throttle from 'src/utils/throttle': es-toolkit's throttle delays the last call until `wait` after it.",
                        },
                    ],
                    patterns: [esToolkitByFunction],
                },
            ],
        },
    },
    {
        // Root-level config files may import devDependencies
        files: ['*.js', '*.mjs', '*.cjs'],
        rules: {
            'import/no-extraneous-dependencies': ['error', {devDependencies: true}],
        },
    },
    {
        // CommonJS files (Node.js environment)
        files: ['*.js'],
        languageOptions: {
            sourceType: 'script',
            globals: globals.node,
        },
        rules: {
            // Node.js wraps each file in its own module scope, so "global scope" warnings don't apply
            'no-implicit-globals': 'off',
        },
    },
    {
        // Story files use @storybook/react for types — this is valid with @storybook/react-vite
        files: ['**/*.stories.@(ts|tsx|js|jsx|mjs|cjs)', '**/*.story.@(ts|tsx|js|jsx|mjs|cjs)'],
        rules: {
            'storybook/no-renderer-packages': 'off',
        },
    },
    {
        ignores: [
            'build/',
            'node_modules/',
            'storybook-static/',
            'src/i18n/keysets/',
            'test-utils/',
            'tests/',
            'jest.config.js',
        ],
    },
];

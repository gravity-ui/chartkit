import baseConfig from '@gravity-ui/eslint-config';
import clientConfig from '@gravity-ui/eslint-config/client';
import importOrderConfig from '@gravity-ui/eslint-config/import-order';
import prettierConfig from '@gravity-ui/eslint-config/prettier';
import storybook from 'eslint-plugin-storybook';
import globals from 'globals';

export default [
    ...baseConfig,
    ...clientConfig,
    ...prettierConfig,
    ...importOrderConfig,
    ...storybook.configs['flat/recommended'],
    {
        rules: {
            'no-console': ['error', {allow: ['warn', 'error']}],
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

import path from 'node:path';

import {storybookTest} from '@storybook/addon-vitest/vitest-plugin';
import react from '@vitejs/plugin-react';
import {playwright} from '@vitest/browser-playwright';
import {defineConfig} from 'vitest/config';

export default defineConfig({
    test: {
        reporters: ['default', ['html', {outputFile: './reports/html/index.html'}]],
        coverage: {
            reporter: ['text', 'json', 'json-summary', 'lcov'],
            reportsDirectory: './reports/coverage',
            include: ['src/**/*.ts?(x)'],
            exclude: ['**/__stories__', '**/__tests__', 'src/demo/**'],
        },
        browser: {
            enabled: true,
            headless: true,
            provider: playwright({}),
            instances: [
                {
                    browser: 'chromium',
                    viewport: {width: 1280, height: 720},
                },
            ],
            locators: {testIdAttribute: 'data-qa'},
            screenshotDirectory: 'reports/screenshots',
            expect: {
                toMatchScreenshot: {
                    resolveScreenshotPath: ({
                        root,
                        testFileDirectory,
                        testFileName,
                        arg,
                        browserName,
                        platform,
                        ext,
                    }) => {
                        return `${root}/${testFileDirectory}/../__screenshots__/${testFileName}-screenshots/${arg}-${browserName}-${platform}${ext}`;
                    },
                },
            },
        },
        projects: [
            {
                extends: true,
                plugins: [
                    storybookTest({
                        configDir: path.join(import.meta.dirname, '.storybook'),
                        storybookUrl: process.env.SB_URL || 'http://localhost:7070',
                    }),
                ],
                optimizeDeps: {
                    include: ['react/jsx-dev-runtime'],
                },
                test: {
                    name: 'storybook',
                    setupFiles: ['.storybook/vitest.setup.ts'],
                    exclude: ['**/*.visual.test.*'],
                },
            },
            {
                extends: true,
                plugins: [react()],
                resolve: {
                    alias: {
                        'react/jsx-runtime': path.join(
                            import.meta.dirname,
                            'node_modules/react/jsx-runtime.js',
                        ),
                        'react/jsx-dev-runtime': path.join(
                            import.meta.dirname,
                            'node_modules/react/jsx-dev-runtime.js',
                        ),
                    },
                },
                test: {
                    name: 'unit',
                    include: ['src/**/*.test.ts?(x)'],
                    exclude: ['**/node_modules/**', '**/*.visual.test.*'],
                    globals: true,
                    browser: {
                        enabled: false,
                    },
                    environment: 'node',
                    setupFiles: [path.join(import.meta.dirname, './test-utils/setup-unit.ts')],
                    server: {
                        deps: {
                            inline: [/@gravity-ui\//, /@floating-ui\//],
                        },
                    },
                },
            },
            {
                extends: true,
                plugins: [react()],
                test: {
                    name: 'visual',
                    include: ['src/**/*.visual.test.ts?(x)'],
                    globals: true,
                    setupFiles: [path.join(import.meta.dirname, './test-utils/setup-tests.ts')],
                },
            },
        ],
    },
});

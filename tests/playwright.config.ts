import {resolve} from 'path';
import {defineConfig, devices} from '@playwright/experimental-ct-react17';

function pathFromRoot(p: string) {
    return resolve(__dirname, '../', p);
}

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
    testDir: pathFromRoot('src'),
    testMatch: '**/__tests__/*.visual.test.tsx',
    snapshotPathTemplate:
        '{testDir}/{testFileDir}/../__snapshots__/{testFileName}-snapshots/{arg}{-projectName}-linux{ext}',
    timeout: 10 * 1000,
    fullyParallel: true,
    forbidOnly: Boolean(process.env.CI),
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 8 : undefined,
    reporter: 'html',
    use: {
        testIdAttribute: 'data-qa',
        trace: 'on',
        headless: true,
        timezoneId: 'UTC',
    },

    projects: [
        {
            name: 'chromium',
            use: {...devices['Desktop Chrome']},
        },
    ],
});

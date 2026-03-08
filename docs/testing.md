# Testing Guide

## Scripts

| Script                            | Description                                                                               |
| --------------------------------- | ----------------------------------------------------------------------------------------- |
| `npm test`                        | Run unit tests once                                                                       |
| `npm run test:watch`              | Run unit tests in watch mode                                                              |
| `npm run test:unit`               | Alias for `npm test`                                                                      |
| `npm run test:coverage`           | Unit tests with coverage report (saved to `reports/coverage/`)                            |
| `npm run test:storybook`          | Run all Storybook stories as tests                                                        |
| `npm run test:docker`             | Run visual tests in Docker (Linux) — use this for visual testing                          |
| `npm run test:docker:update`      | Update baseline screenshots via Docker                                                    |
| `npm run test:docker:clear-cache` | Clear Docker image cache                                                                  |
| `npm run test:visual`             | Run visual tests locally (macOS) — used internally by Docker scripts, not for regular use |

## Test Projects

The project uses [Vitest](https://vitest.dev/) with three test projects:

| Project     | Environment        | Pattern                       |
| ----------- | ------------------ | ----------------------------- |
| `unit`      | Node               | `src/**/*.test.ts?(x)`        |
| `storybook` | Browser (Chromium) | Storybook stories             |
| `visual`    | Browser (Chromium) | `src/**/*.visual.test.ts?(x)` |

## Unit Tests

Standard Vitest tests running in Node. No browser, no screenshots.

Coverage report is saved to `reports/coverage/`.

## Visual (Screenshot) Tests

Visual tests use Playwright via `vitest-browser-react` and capture screenshots to compare against baselines.

### Running visual tests

**Always run visual tests via Docker** to ensure consistent Linux-based screenshots:

```bash
npm run test:docker           # run visual tests in Docker
npm run test:docker:update    # update baseline screenshots
```

Running `npm run test:visual` directly produces macOS screenshots (darwin) which are not committed and not used as baselines. This command is used internally by the Docker scripts.

### How screenshots work

Screenshots are stored next to the test file in a `__screenshots__/` directory. The filename is generated automatically.

Only Linux screenshots (generated via Docker) are committed to the repository — they serve as the CI baseline.

### Adding a new visual test

1. Create `src/plugins/<plugin>/__tests__/<Name>.visual.test.tsx`
2. Use `toMatchScreenshot()` for screenshot assertions:

```tsx
import React from 'react';
import {render} from '../../../../test-utils/utils.js';
import {ChartKit} from '../../../components/ChartKit.js';
import {settings} from '../../../libs/index.js';
import {MyPlugin} from '../index.js';

describe('MyPlugin visual tests', () => {
  const options = {providers: {theme: 'light'}};

  test('default state', async () => {
    settings.set({plugins: [MyPlugin]});
    const screen = await render(
      <div style={{height: 300, width: '100%'}}>
        <ChartKit id="my-chart" type="my-type" data={data} />
      </div>,
      options,
    );
    await expect(screen.getByRole('img')).toMatchScreenshot();
  });
});
```

3. Generate the baseline screenshot:

```bash
npm run test:docker:update
```

4. Commit the generated `*-linux.png` file.

### Behavior-only visual tests

Not every visual test needs a screenshot. Use `expect.element().toBeVisible()` for asserting rendered state without capturing a screenshot:

```tsx
test('no data state', async () => {
  const screen = await render(<ChartKit id="empty" type="my-type" data={emptyData} />, options);
  await expect.element(screen.getByText('No data')).toBeVisible();
});
```

### Updating screenshots

If a visual change is intentional, update the baselines:

**Locally (via Docker):**

```bash
npm run test:docker:update
```

**On a pull request** — comment `/update-screenshots` on the PR. The bot will run the update workflow and push the new screenshots to the branch.

## Storybook Tests

Story-based tests run all stories through `@storybook/addon-vitest`. They verify stories render without errors and can include story-level play functions.

```bash
npm run test:storybook
```

## CI

The CI pipeline (`.github/workflows/ci.yml`) runs:

- Lint + typecheck (`verify_files` job)
- Unit tests with coverage (`tests` job — runs `npm run test:unit -- --coverage`)

Visual tests are **not** run on every CI push. Instead:

- Baselines are committed to the repository
- Screenshots are updated on demand via the `/update-screenshots` bot command

### Test reports

After CI completes, test and coverage reports are uploaded to S3 and linked in a PR comment:

- Tests report: HTML Vitest report
- Coverage report: LCOV coverage report

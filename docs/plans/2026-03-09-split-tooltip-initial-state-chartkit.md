# Split Tooltip Initial State Implementation Plan (chartkit)

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Pre-populate the split-pane tooltip with data from the leftmost data point on mount, eliminating the layout shift when the user first interacts with the chart on mobile.

**Architecture:** Import `getDataAtX` (already exported from `@gravity-ui/charts`) into `withSplitPane.tsx`. On mount, call it with `x: 'first'` to get `TooltipDataChunk[]`, then feed it into the existing `tooltipRef.current?.redraw()` path — the same path that real hover uses. This triggers the existing resize logic before the user sees the chart.

**Tech Stack:** TypeScript, React, `@gravity-ui/charts`

**Assumption:** `getDataAtX` is already available in the installed version of `@gravity-ui/charts`. If not — install a newer version or link the local build first (see Task 1).

---

## Context

### File to change

`src/plugins/gravity-charts/renderer/withSplitPane/withSplitPane.tsx`

### How the tooltip update path works (existing code)

```ts
// The pointermove handler (existing):
const pointerMoveHandler: PointerMoveHandler = (pointerMoveData, event) => {
    if (!isEmpty(pointerMoveData?.hovered)) {
        shouldShowTooltip.current = true;       // shows resizer
        tooltipRef.current?.redraw(pointerMoveData); // updates TooltipContent
    }
    userPointerMoveHandler?.(pointerMoveData, event);
};
```

We will call the same `tooltipRef.current?.redraw()` in a `useEffect` on mount. The `shouldShowTooltip.current = true` ensures the resizer is visible immediately, which then triggers the existing resize-observer chain:

```
tooltipContainerRef resize → setTooltipHeight(nonZero)
  → prevTooltipHeight===0 branch → setSize(containerHeight - RESIZER_HEIGHT - tooltipHeight)
  → chartRef.current?.reflow()
```

This chain already exists and handles layout correctly — we just need to trigger it on mount instead of on first user interaction.

### Why `useEffect` with empty deps

`tooltipRef` and `shouldShowTooltip` are refs (stable, not deps). `initialHovered` and `headerFormat` are memoized and will be correct on mount. The effect must run **once** — subsequent updates are handled by the real `pointermove` handler. Empty deps + eslint-disable comment is intentional.

---

## Task 1: Verify `getDataAtX` is available

### Step 1: Check the installed version exports the function

```bash
cd /Users/alaev89/Desktop/gh-yandex/chartkit
node -e "const c = require('./node_modules/@gravity-ui/charts'); console.log(typeof c.getDataAtX)"
```

**If output is `function`** — proceed to Task 2.

**If output is `undefined`** — the function isn't in the installed version yet. Update the package:

```bash
npm install @gravity-ui/charts@<version-with-getDataAtX>
```

Or link the local charts build:

```bash
# With yalc (preferred):
cd /Users/alaev89/Desktop/gh-yandex/charts && yalc publish
cd /Users/alaev89/Desktop/gh-yandex/chartkit && yalc add @gravity-ui/charts

# Without yalc — npm link:
cd /Users/alaev89/Desktop/gh-yandex/charts && npm link
cd /Users/alaev89/Desktop/gh-yandex/chartkit && npm link @gravity-ui/charts
```

Re-run the check above before continuing.

---

## Task 2: Update `withSplitPane.tsx`

**File:** `src/plugins/gravity-charts/renderer/withSplitPane/withSplitPane.tsx`

### Step 1: Read the file before editing

Read `src/plugins/gravity-charts/renderer/withSplitPane/withSplitPane.tsx` in full to confirm current line numbers match expectations.

### Step 2: Extend the `@gravity-ui/charts` import

Find the existing import (line ~2):

```ts
import {Chart, getDefaultTooltipHeaderFormat} from '@gravity-ui/charts';
```

Change to:

```ts
import {Chart, getDataAtX, getDefaultTooltipHeaderFormat} from '@gravity-ui/charts';
```

### Step 3: Add `initialHovered` memo

After the `headerFormat` useMemo block (which ends around line 93), add:

```ts
const initialHovered = React.useMemo(() => {
    return getDataAtX({series: data.series.data, x: 'first'});
}, [data.series.data]);
```

### Step 4: Add mount effect

Directly after the `initialHovered` memo, add:

```ts
React.useEffect(() => {
    if (initialHovered.length > 0) {
        shouldShowTooltip.current = true;
        tooltipRef.current?.redraw({hovered: initialHovered, headerFormat});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
}, []); // intentional: runs only on mount, updates handled by pointermove
```

### Step 5: Run typecheck

```bash
cd /Users/alaev89/Desktop/gh-yandex/chartkit
npm run ts
```

Expected: no errors.

### Step 6: Run unit tests

```bash
npm run test:unit
```

Expected: all existing tests pass.

### Step 7: Manual smoke test

Open storybook, find a gravity-charts story that uses the split-pane view, switch browser devtools to a mobile viewport (e.g. iPhone 12).

```bash
npm run storybook
```

Verify:
- [ ] Tooltip panel shows data from the first (leftmost) data point immediately on load — no empty panel
- [ ] Resizer is visible without any tap
- [ ] Chart height is already adjusted — no layout shift on first tap
- [ ] Tapping/hovering at other points updates the tooltip normally

### Step 8: Commit

```bash
git add src/plugins/gravity-charts/renderer/withSplitPane/withSplitPane.tsx
git commit -m "feat(gravity-charts): pre-populate split-pane tooltip with first data point on mount"
```

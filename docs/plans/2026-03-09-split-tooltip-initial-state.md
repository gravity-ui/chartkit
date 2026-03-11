# Split Tooltip Initial State Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Pre-populate the split-pane tooltip with data from the leftmost data point so the layout is fully established on mount, eliminating the layout shift on mobile.

**Architecture:** Add a new pure exported function `getDataAtX` to `gravity-ui/charts` that takes raw `ChartSeries[]` and an x-position hint (`'first' | 'last' | number | Date`) and returns `TooltipDataChunk[]` — the same type that `pointermove.hovered` carries. In `chartkit`, call this on mount to pre-populate the `TooltipContent` via the existing `tooltipRef.current?.redraw()` path, triggering the existing resize logic before the user sees the chart.

**Tech Stack:** TypeScript, `@gravity-ui/charts` (jest for tests in charts repo), React, `bisector` from d3

**Two repos:**
- `gravity-ui/charts` — `/Users/alaev89/Desktop/gh-yandex/charts`
- `chartkit` — `/Users/alaev89/Desktop/gh-yandex/chartkit`

---

## Context

### How the tooltip currently works

`withSplitPane` (chartkit) intercepts the `pointermove` event from the chart and passes the `hovered` data to a `TooltipContent` component via a ref imperatively:

```ts
// withSplitPane.tsx
const pointerMoveHandler = (pointerMoveData, event) => {
    if (!isEmpty(pointerMoveData?.hovered)) {
        shouldShowTooltip.current = true;
        tooltipRef.current?.redraw(pointerMoveData); // <-- this is the update path
    }
};
```

`shouldShowTooltip.current` controls whether the resizer is visible. When it's `false` (initial state), the tooltip pane is invisible (`resizerStyle={{display: 'none'}}`), the layout is full-height chart. After first interaction, `shouldShowTooltip.current = true`, the tooltip appears, and the layout shifts.

### What `getClosestPoints` does (internal, not reusable)

The internal `getClosestPoints` in `src/utils/chart/get-closest-data.ts` works with **rendered/prepared data** (pixel coordinates from D3 scales, `PreparedLineData`, etc.) — it is not callable without a mounted chart. We need a separate function at the raw data layer.

### Relevant types

```ts
// TooltipDataChunk — what pointermove.hovered contains:
type TooltipDataChunk = (
    | {data: LineSeriesData; series: {type, id, name}; closest?: boolean}
    | {data: AreaSeriesData; series: {type, id, name}; closest?: boolean}
    | {data: BarXSeriesData; series: BarXSeries; closest?: boolean}
    | {data: WaterfallSeriesData; series: WaterfallSeries; subTotal?: number; closest?: boolean}
    | ... (pie, treemap, bar-y, scatter, etc. — skip these)
) & {closest?: boolean}

// ChartTooltipRendererArgs — what tooltipRef.current?.redraw() accepts:
interface ChartTooltipRendererArgs {
    hovered: TooltipDataChunk[];
    xAxis?: ChartXAxis | null;
    yAxis?: ChartYAxis;
    headerFormat?: ValueFormat | CustomFormat;
    hoveredPlotLines?: AxisPlotLine[];
    hoveredPlotBands?: AxisPlotBand[];
}
```

---

## Task 1: Implement `getDataAtX` in gravity-ui/charts

**Repo:** `/Users/alaev89/Desktop/gh-yandex/charts`

**Files:**
- Create: `src/utils/chart/get-data-at-x.ts`
- Create: `src/utils/chart/__tests__/get-data-at-x.test.ts`

### Step 1: Write the failing tests

Create `src/utils/chart/__tests__/get-data-at-x.test.ts`:

```ts
import {getDataAtX} from '../get-data-at-x';
import type {ChartSeries} from '../../../types';

const lineSeries: ChartSeries[] = [
    {
        type: 'line',
        id: 's1',
        name: 'Series 1',
        data: [
            {x: 1, y: 10},
            {x: 2, y: 20},
            {x: 3, y: 30},
        ],
    } as ChartSeries,
    {
        type: 'line',
        id: 's2',
        name: 'Series 2',
        data: [
            {x: 1, y: 5},
            {x: 2, y: 15},
            {x: 3, y: 25},
        ],
    } as ChartSeries,
];

describe('getDataAtX', () => {
    it("returns points at first x for x='first'", () => {
        const result = getDataAtX({series: lineSeries, x: 'first'});
        expect(result).toHaveLength(2);
        expect(result[0].data).toEqual({x: 1, y: 10});
        expect(result[1].data).toEqual({x: 1, y: 5});
    });

    it("returns points at last x for x='last'", () => {
        const result = getDataAtX({series: lineSeries, x: 'last'});
        expect(result).toHaveLength(2);
        expect(result[0].data).toEqual({x: 3, y: 30});
        expect(result[1].data).toEqual({x: 3, y: 25});
    });

    it('returns closest points for a specific numeric x', () => {
        const result = getDataAtX({series: lineSeries, x: 2});
        expect(result).toHaveLength(2);
        expect(result[0].data).toEqual({x: 2, y: 20});
        expect(result[1].data).toEqual({x: 2, y: 15});
    });

    it('finds nearest point when x is between data points', () => {
        const result = getDataAtX({series: lineSeries, x: 1.4});
        // 1.4 is closer to 1 than to 2
        expect(result).toHaveLength(2);
        expect(result[0].data).toEqual({x: 1, y: 10});
    });

    it('returns empty array for non-cartesian series (pie)', () => {
        const pieSeries: ChartSeries[] = [
            {
                type: 'pie',
                id: 'p1',
                name: 'Pie',
                data: [{value: 10, name: 'A'}],
            } as ChartSeries,
        ];
        const result = getDataAtX({series: pieSeries, x: 'first'});
        expect(result).toHaveLength(0);
    });

    it('returns empty array for empty series list', () => {
        const result = getDataAtX({series: [], x: 'first'});
        expect(result).toHaveLength(0);
    });

    it('skips data points with null x values', () => {
        const seriesWithNull: ChartSeries[] = [
            {
                type: 'line',
                id: 's1',
                name: 'S1',
                data: [
                    {x: null, y: 10},
                    {x: 2, y: 20},
                ],
            } as unknown as ChartSeries,
        ];
        const result = getDataAtX({series: seriesWithNull, x: 'first'});
        expect(result).toHaveLength(1);
        expect(result[0].data).toEqual({x: 2, y: 20});
    });

    it('sets closest:true on the series with the nearest point', () => {
        const mixedSeries: ChartSeries[] = [
            {
                type: 'line', id: 's1', name: 'S1',
                data: [{x: 1, y: 10}, {x: 3, y: 30}],
            } as ChartSeries,
            {
                type: 'line', id: 's2', name: 'S2',
                data: [{x: 2, y: 20}, {x: 4, y: 40}],
            } as ChartSeries,
        ];
        // x=2.4: series s1 closest point is x=3 (dist 0.6), s2 closest point is x=2 (dist 0.4)
        const result = getDataAtX({series: mixedSeries, x: 2.4});
        const s2Point = result.find((r) => r.series.id === 's2');
        const s1Point = result.find((r) => r.series.id === 's1');
        expect(s2Point?.closest).toBe(true);
        expect(s1Point?.closest).toBeFalsy();
    });
});
```

### Step 2: Run tests to confirm they fail

```bash
cd /Users/alaev89/Desktop/gh-yandex/charts
npm test -- --testPathPattern="get-data-at-x"
```

Expected: FAIL — module not found.

### Step 3: Implement `getDataAtX`

Create `src/utils/chart/get-data-at-x.ts`:

```ts
import {bisector, sort} from 'd3';

import type {ChartSeries, TooltipDataChunk} from '../../types';

// Series types that have a meaningful x-axis in raw data
const CARTESIAN_X_SERIES_TYPES = new Set(['line', 'area', 'bar-x', 'waterfall']);

type XValue = number | Date;

function toNumber(x: XValue): number {
    return x instanceof Date ? x.getTime() : x;
}

function resolveX(series: ChartSeries[], hint: number | Date | 'first' | 'last'): XValue | null {
    if (hint !== 'first' && hint !== 'last') {
        return hint;
    }

    let resolved: number | null = null;

    for (const s of series) {
        if (!CARTESIAN_X_SERIES_TYPES.has(s.type)) continue;
        const data = s.data as Array<{x?: XValue | null}>;

        for (const point of data) {
            if (point.x == null) continue;
            const n = toNumber(point.x as XValue);
            if (resolved === null) {
                resolved = n;
            } else if (hint === 'first' && n < resolved) {
                resolved = n;
            } else if (hint === 'last' && n > resolved) {
                resolved = n;
            }
        }
    }

    return resolved;
}

function findClosestPoint<T extends {x?: XValue | null}>(
    points: T[],
    targetX: number,
): T | undefined {
    const valid = points.filter((p) => p.x != null) as Array<T & {x: XValue}>;
    if (valid.length === 0) return undefined;

    const sorted = sort(valid, (p) => toNumber(p.x));
    const idx = bisector<T & {x: XValue}, number>((p) => toNumber(p.x)).center(sorted, targetX);
    return sorted[idx];
}

export function getDataAtX(params: {
    series: ChartSeries[];
    x: number | Date | 'first' | 'last';
}): TooltipDataChunk[] {
    const {series, x} = params;

    const targetX = resolveX(series, x);
    if (targetX === null) return [];

    const targetN = toNumber(targetX);
    const result: TooltipDataChunk[] = [];

    let globalMinDist = Infinity;

    // First pass: collect closest point per series and track global min distance
    const candidates: Array<{chunk: TooltipDataChunk; dist: number}> = [];

    for (const s of series) {
        if (!CARTESIAN_X_SERIES_TYPES.has(s.type)) continue;

        const data = s.data as Array<{x?: XValue | null; [key: string]: unknown}>;
        const closest = findClosestPoint(data, targetN);
        if (!closest || closest.x == null) continue;

        const dist = Math.abs(toNumber(closest.x as XValue) - targetN);
        if (dist < globalMinDist) globalMinDist = dist;

        candidates.push({
            chunk: {data: closest, series: s} as unknown as TooltipDataChunk,
            dist,
        });
    }

    // Second pass: set closest:true on series whose point is at the global minimum distance
    for (const {chunk, dist} of candidates) {
        result.push({...chunk, closest: dist === globalMinDist});
    }

    return result;
}
```

### Step 4: Run tests to confirm they pass

```bash
cd /Users/alaev89/Desktop/gh-yandex/charts
npm test -- --testPathPattern="get-data-at-x"
```

Expected: All tests PASS.

### Step 5: Commit

```bash
cd /Users/alaev89/Desktop/gh-yandex/charts
git add src/utils/chart/get-data-at-x.ts src/utils/chart/__tests__/get-data-at-x.test.ts
git commit -m "feat: add getDataAtX pure utility function"
```

---

## Task 2: Export `getDataAtX` from public API

**Repo:** `/Users/alaev89/Desktop/gh-yandex/charts`

**Files:**
- Modify: `src/utils/chart/index.ts`

### Step 1: Add export

In `src/utils/chart/index.ts`, add at the end of the `export *` block (around line 28, after `export * from './zoom'`):

```ts
export * from './get-data-at-x';
```

### Step 2: Verify typecheck passes

```bash
cd /Users/alaev89/Desktop/gh-yandex/charts
npm run typecheck
```

Expected: no errors.

### Step 3: Verify `getDataAtX` is accessible from root import

```bash
cd /Users/alaev89/Desktop/gh-yandex/charts
node -e "const {getDataAtX} = require('./src/index.ts'); console.log(typeof getDataAtX)"
```

If that doesn't work (ESM), verify manually that `src/index.ts` re-exports via `export * from './utils'` → `export * from './utils/chart'` chain. Check that the chain is unbroken:

```bash
grep "utils" /Users/alaev89/Desktop/gh-yandex/charts/src/index.ts
grep "chart" /Users/alaev89/Desktop/gh-yandex/charts/src/utils/index.ts
```

Both should have `export *` lines that propagate the export.

### Step 4: Build the library

```bash
cd /Users/alaev89/Desktop/gh-yandex/charts
npm run build
```

Expected: build completes without errors.

### Step 5: Commit

```bash
cd /Users/alaev89/Desktop/gh-yandex/charts
git add src/utils/chart/index.ts
git commit -m "feat: export getDataAtX from public API"
```

---

## Task 3: Link local gravity-ui/charts into chartkit

**Context:** chartkit depends on `@gravity-ui/charts: ^1.38.4`. To test the new function locally before publishing, use `npm link` (or `yalc` if available in the project).

### Step 1: Check if yalc is available

```bash
which yalc
```

**If yalc is available** (preferred — avoids npm link hoisting issues):

```bash
cd /Users/alaev89/Desktop/gh-yandex/charts
yalc publish

cd /Users/alaev89/Desktop/gh-yandex/chartkit
yalc add @gravity-ui/charts
```

**If yalc is NOT available**, use npm link:

```bash
cd /Users/alaev89/Desktop/gh-yandex/charts
npm link

cd /Users/alaev89/Desktop/gh-yandex/chartkit
npm link @gravity-ui/charts
```

### Step 2: Verify the new function is importable in chartkit

```bash
cd /Users/alaev89/Desktop/gh-yandex/chartkit
node -e "const c = require('./node_modules/@gravity-ui/charts'); console.log(typeof c.getDataAtX)"
```

Expected: `function`

---

## Task 4: Update `withSplitPane` in chartkit

**Repo:** `/Users/alaev89/Desktop/gh-yandex/chartkit`

**Files:**
- Modify: `src/plugins/gravity-charts/renderer/withSplitPane/withSplitPane.tsx`

### Step 1: Add import

In `withSplitPane.tsx` line 2, extend the existing `@gravity-ui/charts` import:

```ts
// Before:
import {Chart, getDefaultTooltipHeaderFormat} from '@gravity-ui/charts';

// After:
import {Chart, getDataAtX, getDefaultTooltipHeaderFormat} from '@gravity-ui/charts';
```

### Step 2: Add `useMemo` for initial hovered data

In `SplitPaneContent`, after the `headerFormat` useMemo (around line 93), add:

```ts
const initialHovered = React.useMemo(() => {
    return getDataAtX({series: data.series.data, x: 'first'});
}, [data.series.data]);
```

### Step 3: Add `useEffect` to pre-populate tooltip on mount

After the `initialHovered` useMemo, add:

```ts
React.useEffect(() => {
    if (initialHovered.length > 0) {
        shouldShowTooltip.current = true;
        tooltipRef.current?.redraw({hovered: initialHovered, headerFormat});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
}, []); // intentional: runs only on mount, refs are stable
```

**Why empty deps is correct here:** `tooltipRef` and `shouldShowTooltip` are refs (stable), `initialHovered` and `headerFormat` are memoized and available synchronously before first render. The effect must only fire once — on mount — to set the initial state. Subsequent updates come through the real `pointermove` handler.

### Step 4: Run typecheck

```bash
cd /Users/alaev89/Desktop/gh-yandex/chartkit
npm run ts
```

Expected: no errors. If `getDataAtX` is not recognized, verify the local link from Task 3.

### Step 5: Run unit tests

```bash
cd /Users/alaev89/Desktop/gh-yandex/chartkit
npm run test:unit
```

Expected: all existing tests pass (no regressions).

### Step 6: Manual smoke test

Start the storybook and open a story that uses the `gravity-charts` plugin with split-pane view on a mobile viewport. Verify:
- Tooltip panel is visible immediately on load with data from the first data point
- Resizer is visible
- Chart height is already adjusted (no layout shift)
- Hovering/tapping updates the tooltip normally

```bash
cd /Users/alaev89/Desktop/gh-yandex/chartkit
npm run storybook
```

### Step 7: Commit

```bash
cd /Users/alaev89/Desktop/gh-yandex/chartkit
git add src/plugins/gravity-charts/renderer/withSplitPane/withSplitPane.tsx
git commit -m "feat(gravity-charts): pre-populate split-pane tooltip with initial data on mount"
```

---

## Task 5: Restore chartkit to published package

After verifying the implementation works end-to-end with the local link:

### Step 1: Bump `@gravity-ui/charts` dependency

Once the new version of `gravity-ui/charts` is published with `getDataAtX`, update `chartkit/package.json`:

```bash
cd /Users/alaev89/Desktop/gh-yandex/chartkit
npm install @gravity-ui/charts@<new-version>
```

Or if still on local link, remove it:

```bash
# yalc:
yalc remove @gravity-ui/charts && npm install

# npm link:
npm unlink @gravity-ui/charts && npm install
```

### Step 2: Run full test suite

```bash
cd /Users/alaev89/Desktop/gh-yandex/chartkit
npm run test:unit
```

Expected: all pass.

---

## Notes for the implementer

- `getDataAtX` deliberately does **not** handle `bar-y`, `pie`, `treemap`, `heatmap`, `scatter`, `sankey`, `radar`, `funnel` — these don't have a meaningful x-axis for "first/last" semantics. The function returns `[]` for charts composed entirely of these types, and `withSplitPane` will simply not pre-populate the tooltip.
- The `closest` field semantics differ slightly from real hover (where it marks the physically nearest point to the cursor). For `getDataAtX`, `closest: true` is set on whichever series has the minimum distance to the target x. For `x: 'first'` all series will typically tie (same x), so `closest` will be `true` for all — this is fine.
- The `useEffect` in `withSplitPane` intentionally has empty deps. The eslint-disable comment is required because `initialHovered` and `headerFormat` are technically referenced but we deliberately don't want to re-run on their changes (subsequent updates are handled by `pointermove`).

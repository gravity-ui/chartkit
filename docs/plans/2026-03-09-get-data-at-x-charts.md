# `getDataAtX` Implementation Plan (gravity-ui/charts)

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add and export a pure function `getDataAtX` that, given raw `ChartSeries[]` and an x-position hint, returns the closest data points per series as `TooltipDataChunk[]`.

**Architecture:** New file `src/utils/chart/get-data-at-x.ts` with a single exported function. Exported via the existing `src/utils/chart/index.ts` → `src/index.ts` chain. No changes to existing code except one `export *` line.

**Tech Stack:** TypeScript, `d3` (`bisector`, `sort`), Jest

---

## Context

### Why this function, not reusing `getClosestPoints`

The internal `getClosestPoints` (in `src/utils/chart/get-closest-data.ts`) works with **rendered/prepared data** — it expects pixel coordinates from D3 scales and `PreparedLineData`/`PreparedBarXData` etc., which are internal types not available outside a mounted chart. `getDataAtX` operates one layer below, on raw `ChartSeries[]` as provided by the library consumer.

### Return type

`TooltipDataChunk` is defined in `src/types/chart/tooltip.ts`. It's a union of per-series-type interfaces, all shaped as `{data: SeriesData; series: SeriesConfig; closest?: boolean}`. This is the same type that `pointermove.hovered` carries — consumers already know how to handle it.

### Supported series types

Only cartesian series with an x-axis make sense for x-based lookup:
- `line`, `area`, `bar-x`, `waterfall`

Skipped (no meaningful x-axis for `'first'`/`'last'` semantics):
- `bar-y`, `pie`, `treemap`, `heatmap`, `scatter`, `sankey`, `radar`, `funnel`

### `closest` field semantics

In real hover, `closest: true` marks the point physically nearest to the cursor. Here, `closest: true` is set on whichever series' nearest point has the minimum distance to the target x. For `x: 'first'` all series typically tie (same x), so all get `closest: true` — this is acceptable.

---

## Task 1: Implement `getDataAtX` with tests

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
        expect(result[1].data).toEqual({x: 1, y: 5});
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

    it('sets closest:true on the series with the nearest point to target x', () => {
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
        // x=2.4: s1 nearest is x=3 (dist 0.6), s2 nearest is x=2 (dist 0.4) — s2 wins
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
npm test -- --testPathPattern="get-data-at-x"
```

Expected: FAIL — `Cannot find module '../get-data-at-x'`

### Step 3: Implement `getDataAtX`

Create `src/utils/chart/get-data-at-x.ts`:

```ts
import {bisector, sort} from 'd3';

import type {ChartSeries, TooltipDataChunk} from '../../types';

const CARTESIAN_X_SERIES_TYPES = new Set(['line', 'area', 'bar-x', 'waterfall']);

type XValue = number | Date;

function toNumber(x: XValue): number {
    return x instanceof Date ? x.getTime() : x;
}

function resolveTargetX(
    series: ChartSeries[],
    hint: number | Date | 'first' | 'last',
): number | null {
    if (hint !== 'first' && hint !== 'last') {
        return toNumber(hint);
    }

    let resolved: number | null = null;

    for (const s of series) {
        if (!CARTESIAN_X_SERIES_TYPES.has(s.type)) continue;
        const data = s.data as Array<{x?: XValue | null}>;

        for (const point of data) {
            if (point.x == null) continue;
            const n = toNumber(point.x as XValue);
            if (
                resolved === null ||
                (hint === 'first' && n < resolved) ||
                (hint === 'last' && n > resolved)
            ) {
                resolved = n;
            }
        }
    }

    return resolved;
}

function findNearestPoint<T extends {x?: XValue | null}>(
    data: T[],
    targetN: number,
): (T & {x: XValue}) | undefined {
    const valid = data.filter((p): p is T & {x: XValue} => p.x != null);
    if (valid.length === 0) return undefined;

    const sorted = sort(valid, (p) => toNumber(p.x));
    const idx = bisector<T & {x: XValue}, number>((p) => toNumber(p.x)).center(sorted, targetN);
    return sorted[idx];
}

export function getDataAtX(params: {
    series: ChartSeries[];
    x: number | Date | 'first' | 'last';
}): TooltipDataChunk[] {
    const {series, x} = params;

    const targetN = resolveTargetX(series, x);
    if (targetN === null) return [];

    const candidates: Array<{chunk: TooltipDataChunk; dist: number}> = [];
    let globalMinDist = Infinity;

    for (const s of series) {
        if (!CARTESIAN_X_SERIES_TYPES.has(s.type)) continue;

        const data = s.data as Array<{x?: XValue | null}>;
        const nearest = findNearestPoint(data, targetN);
        if (!nearest) continue;

        const dist = Math.abs(toNumber(nearest.x) - targetN);
        if (dist < globalMinDist) globalMinDist = dist;

        candidates.push({
            chunk: {data: nearest, series: s} as unknown as TooltipDataChunk,
            dist,
        });
    }

    return candidates.map(({chunk, dist}) => ({
        ...chunk,
        closest: dist === globalMinDist,
    }));
}
```

### Step 4: Run tests to confirm they pass

```bash
npm test -- --testPathPattern="get-data-at-x"
```

Expected: All 8 tests PASS.

### Step 5: Run full test suite to check for regressions

```bash
npm test
```

Expected: all existing tests still pass.

### Step 6: Commit

```bash
git add src/utils/chart/get-data-at-x.ts src/utils/chart/__tests__/get-data-at-x.test.ts
git commit -m "feat: add getDataAtX pure utility function"
```

---

## Task 2: Export from public API and build

**Files:**
- Modify: `src/utils/chart/index.ts`

### Step 1: Add export line

In `src/utils/chart/index.ts`, add after the last `export *` line in the re-export block (currently after `export * from './zoom'` around line 28):

```ts
export * from './get-data-at-x';
```

### Step 2: Verify export chain is unbroken

```bash
grep "utils" src/index.ts
grep "chart" src/utils/index.ts
```

Both should contain `export *` lines. If the chain is already `src/index.ts → src/utils/index.ts → src/utils/chart/index.ts`, no further changes are needed.

### Step 3: Run typecheck

```bash
npm run typecheck
```

Expected: no errors.

### Step 4: Build

```bash
npm run build
```

Expected: build completes without errors. The `getDataAtX` symbol will be present in the compiled output.

### Step 5: Commit

```bash
git add src/utils/chart/index.ts
git commit -m "feat: export getDataAtX from public API"
```

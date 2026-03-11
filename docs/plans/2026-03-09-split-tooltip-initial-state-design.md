# Design: Split Tooltip Initial State

**Date:** 2026-03-09
**Status:** Approved

## Problem

In `withSplitPane` (gravity-charts plugin), the tooltip panel is empty and hidden until the first user interaction. On mobile devices this causes a visible layout shift: the first tap reveals the tooltip and collapses the chart area, which feels unexpected.

## Goal

Pre-populate the tooltip with data from the first (leftmost) data point so that the split layout is fully established before the user interacts with the chart.

## Constraint

No imperative API on `ChartRef` (no `chartRef.current.doSomething()`). Solution must use pure functions.

## Chosen Approach: `getDataAtX` pure function

### Repository 1: `gravity-ui/charts`

New exported pure function that operates on raw series data — not on rendered/prepared chart internals.

**Why a new function, not reusing `getClosestPoints`:**
`getClosestPoints` works with `PreparedLineData` and pixel coordinates from D3 scales. It is internal and cannot be called without a mounted chart. `getDataAtX` works one layer below — directly on `ChartSeries[]`.

**Signature:**

```ts
export function getDataAtX(params: {
    series: ChartSeries[];
    x: number | Date | 'first' | 'last';
}): TooltipDataChunk[]
```

**Behavior:**
- `'first'` — resolves to the minimum x-value found across all supported series
- `'last'` — resolves to the maximum x-value
- `number | Date` — finds the closest point to that x-value
- Supported series types: `line`, `area`, `bar-x`, `waterfall` (cartesian with x-axis)
- Unsupported types (`pie`, `treemap`, `scatter`, `bar-y`, `heatmap`, `sankey`, `radar`, `funnel`) are skipped and contribute nothing to the result
- `closest: true` is set on the point whose x-value is nearest to the target

**File:** `src/utils/chart/get-data-at-x.ts` (new file)
**Export chain:** `src/utils/chart/index.ts` → `src/index.ts` (already proxied)

---

### Repository 2: `chartkit` (`withSplitPane.tsx`)

Two additions to `SplitPaneContent`:

```ts
// 1. Compute initial hovered data — memoized by series data
const initialHovered = React.useMemo(() => {
    return getDataAtX({series: data.series.data, x: 'first'});
}, [data.series.data]);

// 2. Pre-populate tooltip on mount, before first user interaction
React.useEffect(() => {
    if (initialHovered.length > 0) {
        shouldShowTooltip.current = true;
        tooltipRef.current?.redraw({hovered: initialHovered, headerFormat});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
}, []); // intentional: runs only on mount
```

No other logic changes. The existing `pointermove` handler overwrites the initial state on real hover.

**UX flow after fix:**
1. Mount → `useEffect` fires → tooltip pre-populated
2. `shouldShowTooltip.current = true` → resizer visible immediately
3. Resize observer on `tooltipContainerRef` fires → `setTooltipHeight(nonZeroValue)`
4. Existing condition `prevTooltipHeight === 0 && tooltipHeight !== 0` triggers → `setSize(containerHeight - RESIZER_HEIGHT - tooltipHeight)` + `chartRef.current?.reflow()`
5. Full layout established **before the user sees the chart** — no layout shift

## Files to Change

| Repository | File | Change |
|---|---|---|
| `gravity-ui/charts` | `src/utils/chart/get-data-at-x.ts` | New file — `getDataAtX` implementation |
| `gravity-ui/charts` | `src/utils/chart/index.ts` | Export `getDataAtX` |
| `chartkit` | `src/plugins/gravity-charts/renderer/withSplitPane/withSplitPane.tsx` | Import + `useMemo` + `useEffect` |

## Out of Scope

- Series types without a meaningful x-axis (`pie`, `treemap`, etc.) — return empty array, no initial tooltip
- Custom `x` values other than `'first'` — supported by the function signature but not used by `withSplitPane`
- Storybook/visual tests for the new function — separate task

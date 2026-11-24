# Indicator configuration migration (Draft)

**Draft: ChartKit 10 has not been released.**

## Indicator configuration

| v9                | v10           |
| ----------------- | ------------- |
| `content.current` | `value`       |
| Item `color`      | `value.color` |

Before:

```ts
const data: IndicatorWidgetData = {
  data: [
    {
      title: 'Revenue',
      content: {current: {value: 1539577}},
      color: 'var(--g-color-text-positive)',
    },
  ],
};
```

After (v10):

```ts
const data: IndicatorWidgetData = {
  data: [
    {
      title: 'Revenue',
      value: {
        value: 1539577,
        color: 'var(--g-color-text-positive)',
      },
    },
  ],
};
```

## Public types in v10

Keep `IndicatorWidgetData` and `IndicatorWidgetDataItem` as the public names for
the configuration without deprecated fields. Their imports from
`@gravity-ui/chartkit/indicator` do not need to change.

The v10 migration tooling plans to use `LegacyIndicatorWidgetData` and
`LegacyIndicatorWidgetDataItem` for the configuration it accepts as input.

In v9, `IndicatorWidgetData` and `IndicatorWidgetDataItem` keep the legacy
contract with required `content.current`. Existing interfaces can still extend
them, and existing code can read `item.content.current` without a guard.

Use `ChartKitProps<'indicator'>['data']` for input containing `value`
or a mix of new and legacy items. The types without deprecated fields remain
internal until the major release.

`title`, `size`, `nowrap`, `defaultColor`, and `formatNumber` use the same options.

In v9 configurations containing both forms, `value` takes precedence over
`content.current`. If `value.color` is omitted, the item-level `color` is
used; an explicitly empty `value.color` uses `defaultColor`.

The main-value formatter receives `value` instead of `content.current`.
The new `value` configuration declares `value`, `color`, `formatNumber`, and `numberFormat`.
In v9, arbitrary formatter metadata remains supported through the legacy
`content.current` configuration.

When converting an item that uses `content.current`, migration removes or replaces
metadata named `color`, `formatNumber`, or `numberFormat`. When an item also
supplies `value`, the legacy metadata is already ignored.

When migrating in a ChartKit source checkout, call the internal
[`migrateIndicatorData`](../src/plugins/indicator/migration/migrate-indicator-data.ts)
adapter and read its `warnings` array. It reports a `resolution: 'review'` warning
with the path to each affected field. In projects using the v9 npm package, check
`content.current` for these fields on items that have no `value`. Update any widget
`formatNumber` callback that reads those fields before using the migrated configuration.

See the [indicator guide](../docs/indicator.md) for configuration and formatting options.

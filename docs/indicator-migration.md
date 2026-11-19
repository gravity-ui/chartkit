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

Use `LegacyIndicatorWidgetData` and `LegacyIndicatorWidgetDataItem` for the old
configuration accepted by the migration adapter.

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

When converting legacy data, metadata named `color`, `formatNumber`, or
`numberFormat` is removed or replaced. The adapter reports `resolution: 'review'`
for each field; update any widget formatter that depends on it before using the
migrated configuration. Legacy metadata is ignored when `value` is also supplied.

`migrateIndicatorData` is internal and is not exported from the package.
See the [indicator guide](indicator.md) for configuration and formatting options.

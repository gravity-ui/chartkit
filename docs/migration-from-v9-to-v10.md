# Migrating from v9 to v10 (Draft)

**Draft: ChartKit 10 has not been released.**

## Indicator configuration

| v9                | v10                  |
| ----------------- | -------------------- |
| `content.current` | `primaryValue`       |
| Item `color`      | `primaryValue.color` |

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
      primaryValue: {
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

In v9, only the shared `IndicatorWidgetData` and `IndicatorWidgetDataItem` types
are public. They accept both forms, with the old fields marked as deprecated.
The types without deprecated fields remain internal until the major release.

`title`, `size`, `nowrap`, `defaultColor`, and `formatNumber` use the same options.

In v9 configurations containing both forms, `primaryValue` takes precedence over
`content.current`. If `primaryValue.color` is omitted, the item-level `color` is
used; an explicitly empty `primaryValue.color` uses `defaultColor`.

The main-value formatter receives `primaryValue` instead of `content.current`.
Copy any application metadata used by the formatter into `primaryValue`, renaming
fields that conflict with the display options `color` and `numberFormat`.

`migrateIndicatorDataFromV9ToV10` is internal and is not exported from the package.
See the [indicator guide](indicator.md) for configuration and formatting options.

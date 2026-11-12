# Migrating from v9 to v10 (Draft)

**Draft: ChartKit 10 has not been released.**

## Indicator configuration

| v9                        | v10                         |
| ------------------------- | --------------------------- |
| `IndicatorWidgetData`     | `IndicatorWidgetConfig`     |
| `IndicatorWidgetDataItem` | `IndicatorWidgetConfigItem` |
| `content.current`         | `primaryValue`              |
| Item `color`              | `primaryValue.color`        |

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

After:

```ts
const data: IndicatorWidgetConfig = {
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

Import the configuration types from `@gravity-ui/chartkit/indicator`.
`title`, `size`, `nowrap`, `defaultColor`, and `formatNumber` use the same options.

In configurations containing both forms, `primaryValue` takes precedence over
`content.current`. If `primaryValue.color` is omitted, the item-level `color` is
used; an explicitly empty `primaryValue.color` uses `defaultColor`.

The main-value formatter receives `primaryValue` instead of `content.current`.
Copy any application metadata used by the formatter into `primaryValue`, renaming
fields that conflict with the display options `color` and `numberFormat`.

`migrateIndicatorDataFromV9ToV10` is internal and is not exported from the package.
See the [indicator guide](indicator.md) for configuration and formatting options.

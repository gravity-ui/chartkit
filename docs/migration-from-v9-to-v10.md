# Migrating from v9 to v10 (Draft)

**Draft: ChartKit 10 has not been released.** This guide describes the planned
removal of deprecated indicator aliases in the next major version. ChartKit 9
accepts both configurations, so applications can update their data now.

## Indicator configuration

The main value now has an explicit `primaryValue` object. The replacements are:

| v9 alias          | Replacement          |
| ----------------- | -------------------- |
| `content.current` | `primaryValue`       |
| Item `color`      | `primaryValue.color` |

### Before

```ts
import type {IndicatorWidgetData} from '@gravity-ui/chartkit/indicator';

const data: IndicatorWidgetData = {
  defaultColor: 'var(--g-color-text-primary)',
  data: [
    {
      title: 'Revenue',
      size: 'm',
      nowrap: true,
      content: {
        current: {
          value: 1539577,
        },
      },
      color: 'var(--g-color-text-primary)',
    },
  ],
};
```

### After

```ts
import type {IndicatorWidgetConfig} from '@gravity-ui/chartkit/indicator';

const data: IndicatorWidgetConfig = {
  defaultColor: 'var(--g-color-text-primary)',
  data: [
    {
      title: 'Revenue',
      size: 'm',
      nowrap: true,
      primaryValue: {
        value: 1539577,
        color: 'var(--g-color-text-primary)',
      },
    },
  ],
};
```

The value types, sizes, title wrapping, formatter callback, and `defaultColor`
behavior are preserved. Strings render as supplied; numbers use `formatNumber`
when it is provided and otherwise render as plain text.

New configurations can also use `primaryValue.numberFormat` and an optional
`secondaryValue` with its own number format, caption, color, badge, and arrow
object (`{direction, ariaLabel}`). See the [indicator guide](indicator.md) for
these options and their defaults.

## Partially migrated configurations

In v9, an item can contain both forms. The following precedence rules apply:

- `primaryValue` replaces the entire `content.current` object. Its fields are not
  merged with the legacy value's fields.
- An explicitly supplied `primaryValue.color`, including an empty string, takes
  precedence over the item `color`. If absent, the legacy item color is used.
  The existing fallback from an empty color to `defaultColor` is preserved.

Fields inside `content.current` other than `value` remain application-owned
formatter metadata. In particular, `content.current.color` and
`content.current.numberFormat` do not become display options automatically.
The widget preserves their original values in the legacy formatter context.
When updating a configuration manually, rename metadata that conflicts with the
new `primaryValue.color` and `primaryValue.numberFormat` options.

## TypeScript compatibility in v9

The old exported types retain their original property types. In particular,
`IndicatorWidgetDataItem.content` remains required, indexed access through
`['content']['current']` remains valid. Arbitrary fields on `current` retain the
type `unknown`. The old configuration types and fields are deprecated.

For new configurations use `IndicatorWidgetConfig`, `IndicatorWidgetConfigItem`,
`IndicatorPrimaryValue`, `IndicatorSecondaryValue`, and `IndicatorArrow`.
The config types accept both forms for gradual migration.
Use `IndicatorProps` or `ChartKitProps<'indicator'>` for wrappers that accept either
form. `ChartKitWidget['indicator']['data']` is `IndicatorWidgetConfig`, so the
public widget types and the `ChartKit` component accept both APIs. When reading
an item through these types, check whether `primaryValue` or `content` is present.
The widget uses internal `NormalizedIndicatorWidgetConfig` and
`NormalizedIndicatorWidgetConfigItem` types after migration; they are not exported.

The primary-value `formatNumber` callback continues to receive the original
`content.current` object for legacy input, including custom metadata and its
original object identity. With `primaryValue`, it receives the original
`primaryValue` object. The secondary callback still receives `{value}`.

## Migration adapter (planned public API)

ChartKit 9 uses `migrateIndicatorDataFromV9ToV10` internally to normalize data before
rendering. It is **not exported** from the package. Its public export is planned
for the v10 release; applications should update their configurations directly
until then.

The adapter returns `{data, warnings}`. It does not mutate input, execute
callbacks, or print warnings to the console. Already migrated configurations and
unchanged objects retain their references; repeated migration preserves the
result. The widget normalizes data when its configuration changes and preserves
the legacy formatter context separately.

Each diagnostic describes the original input with `code`, `path`, `message`,
`replacement`, and `resolution: 'automatic'`. Codes are `indicator-content` and
`indicator-color`. Paths include
the item index, for example `['data', 0, 'content']`. Diagnostics are returned to
the caller; normal rendering does not log them. Callback bodies and application
metadata are not scanned.

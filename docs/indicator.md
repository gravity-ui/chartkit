# Indicator

The indicator displays one or more values with optional titles.

Register `IndicatorPlugin` from `@gravity-ui/chartkit/indicator` and pass the
configuration to `<ChartKit type="indicator" data={data} />`:

```tsx
import ChartKit, {settings} from '@gravity-ui/chartkit';
import {IndicatorPlugin, type IndicatorWidgetConfig} from '@gravity-ui/chartkit/indicator';

settings.set({plugins: [IndicatorPlugin]});

const data: IndicatorWidgetConfig = {
  data: [
    {
      title: 'Revenue',
      primaryValue: {
        value: 1539577,
        numberFormat: {precision: 0, showRankDelimiter: true},
      },
      size: 'm',
      secondaryValue: {
        value: 0.124,
        numberFormat: {
          format: 'percent',
          precision: 1,
          signDisplay: 'exceptZero',
        },
        caption: 'vs the previous month',
        position: 'right',
        color: 'var(--g-color-text-positive)',
        view: 'badge',
        arrow: {direction: 'up', ariaLabel: 'Increase'},
      },
    },
  ],
};

<ChartKit type="indicator" data={data} />;
```

With the English locale, this example displays `1,539,577` as the main value and
`+12.4%` as the secondary value. Strings render as supplied, including strings that look like numbers.
The application computes differences, chooses colors and localizes captions.

## Configuration

The widget configuration contains a `data` array with one entry per indicator.
Use `IndicatorWidgetConfig` for the configuration type and
`IndicatorWidgetConfigItem` for an individual item. Use `ChartKitProps<'indicator'>`
for the props of a wrapper around `<ChartKit type="indicator" />`.

| Item property    | Description                                                               | Default  |
| ---------------- | ------------------------------------------------------------------------- | -------- |
| `primaryValue`   | Main value (`IndicatorPrimaryValue`)                                      | Required |
| `secondaryValue` | Additional value (`IndicatorSecondaryValue`)                              | None     |
| `title`          | Text displayed above the main value                                       | None     |
| `size`           | `s`, `m`, `l`, or `xl`; controls both values                              | `m`      |
| `nowrap`         | Truncate the title to one line and show its full text in a native tooltip | `false`  |

Both values accept `value`, `numberFormat`, and `color`. Primary values can also
carry application metadata for the `formatNumber` callback.

Set the widget's `defaultColor` to provide a fallback color for primary values.
`primaryValue.color` overrides it. Secondary values have their own `color`.

## Secondary value

| Secondary value property | Description                                                                      | Default            |
| ------------------------ | -------------------------------------------------------------------------------- | ------------------ |
| `value`                  | A number or an already formatted string                                          | Required           |
| `numberFormat`           | `FormatNumberOptions` applied to this value                                      | None               |
| `caption`                | A caption (`ReactNode`); string captions also have a native tooltip              | None               |
| `position`               | `bottom` or `right`                                                              | `bottom`           |
| `color`                  | A CSS color for the value and arrow, including theme variables                   | Primary text color |
| `view`                   | `text` or `badge`; the badge background is a 15% tint of `color`                 | `text`             |
| `arrow.direction`        | `up` or `down`, chosen explicitly by the application                             | None               |
| `arrow.ariaLabel`        | A localized accessible label for the arrow, for example `Increase` or `Decrease` | None               |

Provide `arrow.ariaLabel` when the arrow conveys information beyond the displayed
value. The application localizes this label. Without a label, the arrow is
decorative, so its meaning should be conveyed by the value or caption as well.

## Number formatting

Set `primaryValue.numberFormat` for the main value and
`secondaryValue.numberFormat` for the secondary value. The two configurations are
independent and use `FormatNumberOptions`, exported from `@gravity-ui/chartkit/indicator`:

| Option              | Description                                                                                | Default              |
| ------------------- | ------------------------------------------------------------------------------------------ | -------------------- |
| `format`            | `number` or `percent`; percent multiplies the value by 100                                 | `number`             |
| `precision`         | Fraction digits, or `auto` for adaptive precision                                          | No fixed precision   |
| `showRankDelimiter` | Group thousands                                                                            | `true`               |
| `unit`              | `auto`, `k`, `m`, `b`, `t`, or `null` for no scaling                                       | No scaling           |
| `unitRate`          | Scale index: `0` for units, `1` for thousands, through `4` for trillions; overrides `unit` | Determined by `unit` |
| `multiplier`        | Multiply the number before formatting                                                      | `1`                  |
| `prefix`            | Text prepended to the formatted value                                                      | Empty string         |
| `postfix`           | Text appended to the formatted value                                                       | Empty string         |
| `lang`              | Locale override                                                                            | `settings.lang`      |
| `signDisplay`       | `auto`, `always`, `never` or `exceptZero`                                                  | `auto`               |

With `format: 'percent'`, the multiplier is always `100`; a supplied `multiplier`
is ignored.

For each numeric value, formatting priority is:

1. Explicit `numberFormat` options are applied by ChartKit's built-in formatter,
   even when the widget has a `formatNumber` callback. An empty object `{}` selects
   the built-in defaults. Its locale defaults to `settings.lang`, with an optional
   `numberFormat.lang` override.
2. Without explicit options, the widget's `formatNumber` callback is called. For
   the main value it receives the number and the complete `primaryValue`
   object, including application metadata. For the secondary value it receives the number and `{value}`, where
   `value` is the secondary value. The callback controls formatting, including the sign.
3. With neither callback nor options, the number is rendered as plain text.

You can configure just one value and let the other use the widget callback.
Strings bypass both formatters. To display a missing value, supply a string such
as `value: '—'` and omit `arrow`.

`numberFormat.signDisplay` follows `Intl.NumberFormat` semantics: `auto`, `always`,
`never` or `exceptZero`. For example, `exceptZero` shows a plus sign for positive
values and omits the sign for values rounded to zero.

## Legacy configuration

The legacy form supplies the main value through `content.current.value` and its
color through the item-level `color` property. Use `IndicatorWidgetData` for the
configuration type and `IndicatorWidgetDataItem` for an individual item:

```tsx
import type {IndicatorWidgetData} from '@gravity-ui/chartkit/indicator';

const data: IndicatorWidgetData = {
  data: [
    {
      title: 'Revenue',
      content: {current: {value: 1539577}},
      color: 'var(--g-color-text-positive)',
    },
  ],
};

<ChartKit type="indicator" data={data} formatNumber={(value) => value.toLocaleString('en-US')} />;
```

The item also accepts `title`, `size`, `nowrap`, and `secondaryValue` as described
above. The widget's `defaultColor` is used when the item has no color.

For a numeric main value, `formatNumber` receives the number and the complete
`content.current` object, including application metadata. Fields inside
`content.current` other than `value`, including `color` and `numberFormat`, are
formatter metadata and do not configure the display. Strings render as supplied.

When an item supplies both forms, `primaryValue` determines the main value.
If `primaryValue.color` is omitted, the item-level `color` is used. An explicitly
empty `primaryValue.color` uses `defaultColor`.

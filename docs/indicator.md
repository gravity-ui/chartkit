# Indicator

Register `IndicatorPlugin` from `@gravity-ui/chartkit/indicator` and render
`<ChartKit type="indicator" data={data} />`. Each item has a `primaryValue` and an
optional `secondaryValue`. Existing configurations keep their layout, colors,
title wrapping and number formatting.

An item can optionally include `secondaryValue`, an additional value with a
caption, arrow and badge. For example, an application can calculate a
comparison and pass the result to the indicator:

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

| Secondary value property | Description                                                                      | Default            |
| ------------------------ | -------------------------------------------------------------------------------- | ------------------ |
| `value`                  | A number or an already formatted string                                          | Required           |
| `numberFormat`           | `IndicatorNumberFormat` options applied to this value                            | None               |
| `caption`                | A caption (`ReactNode`); string captions also have a native tooltip              | None               |
| `position`               | `bottom` or `right`                                                              | `bottom`           |
| `color`                  | A CSS color for the value and arrow, including theme variables                   | Primary text color |
| `view`                   | `text` or `badge`; the badge background is a 15% tint of `color`                 | `text`             |
| `arrow.direction`        | `up` or `down`, chosen explicitly by the application                             | None               |
| `arrow.ariaLabel`        | A localized accessible label for the arrow, for example `Increase` or `Decrease` | None               |

`primaryValue` accepts `value`, `numberFormat`, and `color`. Both values use the
exported `IndicatorValue` base type. Primary values can also carry application
metadata for the `formatNumber` callback. `primaryValue.color` takes precedence
over the widget's `defaultColor`; both affect only the primary value.

Use `IndicatorWidgetConfig`, `IndicatorWidgetConfigItem`, `IndicatorPrimaryValue`,
`IndicatorSecondaryValue`, and `IndicatorArrow` for new configurations.
`IndicatorWidgetConfig` accepts legacy fields as well, including partially migrated items.
Use `IndicatorProps` when typing a wrapper around `<ChartKit type="indicator" />`.
The existing `IndicatorWidgetData` and `IndicatorWidgetDataItem` retain their
legacy property types throughout v9. `ChartKitProps<'indicator'>` and
`ChartKitWidget['indicator']['data']` accept both forms through `IndicatorWidgetConfig`.

## Number formatting

Set `primaryValue.numberFormat` for the main value and
`secondaryValue.numberFormat` for the secondary value. The two configurations are
independent and use the exported `IndicatorNumberFormat` type:

| Option              | Description                                                | Default            |
| ------------------- | ---------------------------------------------------------- | ------------------ |
| `format`            | `number` or `percent`; percent multiplies the value by 100 | `number`           |
| `precision`         | Fraction digits, or `auto` for adaptive precision          | No fixed precision |
| `showRankDelimiter` | Group thousands                                            | `true`             |
| `unit`              | `auto`, `k`, `m`, `b`, `t`, or `null` for no scaling       | No scaling         |
| `prefix`            | Text prepended to the formatted value                      | Empty string       |
| `postfix`           | Text appended to the formatted value                       | Empty string       |
| `lang`              | Locale override                                            | `settings.lang`    |
| `signDisplay`       | `auto`, `always`, `never` or `exceptZero`                  | `auto`             |

For each numeric value, formatting priority is:

1. Explicit `numberFormat` options are applied by ChartKit's built-in formatter,
   even when the widget has a `formatNumber` callback. An empty object `{}` selects
   the built-in defaults. Its locale defaults to `settings.lang`, with an optional
   `numberFormat.lang` override.
2. Without explicit options, the widget's `formatNumber` callback is called. For
   the main value it receives the number and the complete `primaryValue`
   object, including application metadata. Legacy configurations still pass the
   original `content.current` object. For the secondary value it receives the number and `{value}`, where
   `value` is the secondary value. The callback controls formatting, including the sign.
3. With neither callback nor options, the number is rendered as plain text.

For legacy configurations, fields inside `content.current` other than `value`
remain application-owned formatter metadata. Set `primaryValue.numberFormat`
to use the built-in primary-value formatter.

You can configure just one value and let the other use the widget callback.
Strings bypass both formatters. To display a missing value, supply a string such
as `value: '—'` and omit `arrow`.

`numberFormat.signDisplay` follows `Intl.NumberFormat` semantics: `auto`, `always`,
`never` or `exceptZero`. For example, `exceptZero` shows a plus sign for positive
values and omits the sign for values rounded to zero.

Provide `arrow.ariaLabel` when the arrow conveys information beyond the displayed
value. The application localizes this label. Without a label, the arrow is
decorative, so its meaning should be conveyed by the value or caption as well.

The item `size` controls both values. `title` and `nowrap` retain their existing
behavior; `nowrap` truncates the title to one line and provides its native tooltip.

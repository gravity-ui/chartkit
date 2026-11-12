# Indicator

Register `IndicatorPlugin` from `@gravity-ui/chartkit/indicator` and render
`<ChartKit type="indicator" data={data} />`. Existing configurations keep their
layout, colors, title wrapping and number formatting.

An item can optionally include `secondaryValue`, an additional value with a
caption, arrow and badge. For example, an application can calculate a
comparison and pass the result to the indicator:

```tsx
import ChartKit, {settings} from '@gravity-ui/chartkit';
import {IndicatorPlugin, type IndicatorWidgetData} from '@gravity-ui/chartkit/indicator';

settings.set({plugins: [IndicatorPlugin]});

const data: IndicatorWidgetData = {
  data: [
    {
      title: 'Revenue',
      content: {
        current: {
          value: 1539577,
          numberFormat: {precision: 0, showRankDelimiter: true},
        },
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
        arrow: 'up',
        arrowLabel: 'Increase',
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
| `arrow`                  | `up` or `down`, chosen explicitly by the application                             | None               |
| `arrowLabel`             | A localized accessible label for the arrow, for example `Increase` or `Decrease` | None               |

## Number formatting

Set `content.current.numberFormat` for the main value and
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
   the main value it receives the number and the complete `content.current`
   object. For the secondary value it receives the number and `{value}`, where
   `value` is the secondary value. The callback controls formatting, including the sign.
3. With neither callback nor options, the number is rendered as plain text.

You can configure just one value and let the other use the widget callback.
Strings bypass both formatters. To display a missing value, supply a string such
as `value: '—'` and omit `arrow`.

`numberFormat.signDisplay` follows `Intl.NumberFormat` semantics: `auto`, `always`,
`never` or `exceptZero`. For example, `exceptZero` shows a plus sign for positive
values and omits the sign for values rounded to zero.

Provide `arrowLabel` when the arrow conveys information beyond the displayed
value. The application localizes this label. Without a label, the arrow is
decorative, so its meaning should be conveyed by the value or caption as well.

The item `size` controls both values. Existing `color` and `defaultColor` continue
to apply only to the main value.

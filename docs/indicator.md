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
      content: {current: {value: 1539577}},
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
      },
    },
  ],
};

<ChartKit type="indicator" data={data} />;
```

The secondary value in this example is displayed as `+12.4%` with the English
locale. Strings render as supplied, including strings that look like numbers.
The application computes differences, chooses colors and localizes captions.

| Secondary value property | Description                                                                                      | Default            |
| ------------------------ | ------------------------------------------------------------------------------------------------ | ------------------ |
| `value`                  | A number or an already formatted string                                                          | Required           |
| `numberFormat`           | Shared `FormatNumberOptions`: precision, percent display, grouping, locale, units, affixes, sign | None               |
| `caption`                | A caption (`ReactNode`); string captions also have a native tooltip                              | None               |
| `position`               | `bottom` or `right`                                                                              | `bottom`           |
| `color`                  | A CSS color for the value and arrow, including theme variables                                   | Primary text color |
| `view`                   | `text` or `badge`; the badge background is a 15% tint of `color`                                 | `text`             |
| `arrow`                  | `up` or `down`, chosen explicitly by the application                                             | None               |

For numeric secondary values, formatting priority is:

1. If the widget has a `formatNumber` callback, it receives the number and
   `{...numberFormat, value}`, where `value` is always the secondary value.
   The callback controls formatting, including the sign.
2. Otherwise, `numberFormat` is applied by ChartKit's shared number formatter.
   Its locale defaults to `settings.lang`, with an optional `numberFormat.lang` override.
3. With neither callback nor options, the number is rendered as plain text.

Strings bypass both formatters. To display a missing value, supply a string such
as `value: '—'` and omit `arrow`.

`numberFormat.signDisplay` follows `Intl.NumberFormat` semantics: `auto`, `always`,
`never` or `exceptZero`. For example, `exceptZero` shows a plus sign for positive
values and omits the sign for values rounded to zero.

The main value keeps its original contract: numeric values are passed to
`formatNumber` with the complete `content.current` object, and strings render as
supplied. The item `size` controls both values. Existing `color` and `defaultColor`
continue to apply only to the main value.

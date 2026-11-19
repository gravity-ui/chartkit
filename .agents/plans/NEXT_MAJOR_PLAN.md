# Next major release plan

Planned breaking changes and migration notes for ChartKit 10.

## Indicator types

Remove deprecated `content.current` and item-level `color` from the widget contract;
use required `value` and `value.color`. Make `IndicatorWidgetData` describe the modern
configuration and align `ChartKitWidget['indicator']['data']` with
`ChartKitProps<'indicator'>['data']` without a compatibility union.

Clean up all indicator types, including duplicate config/normalized shapes,
value types, formatter contracts, and exports. Keep legacy types and conversion
in migration tooling, separate from the renderer. Update the adapter, stories,
[indicator guide](../../docs/indicator.md), and
[migration guide](../../docs/indicator-migration.md); verify public declarations,
migration, and rendering before release.

## Single indicator configuration — discuss

Consider accepting one config directly: `<ChartKit type="indicator" data={config} />`
instead of `data={{data: [config]}}`. **Open question; discuss before implementing.**
Check consumers with multiple items, define their migration and empty-input
behavior, and decide where `defaultColor` belongs. Never silently select the first
item. If deferred, retain the array and complete the type cleanup independently.

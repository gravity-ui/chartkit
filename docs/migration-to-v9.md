# Migration to v9

ChartKit 9 moves to `@gravity-ui/uikit` 8, `@gravity-ui/charts` 2 and a dual CommonJS/ESM build compiled to ES2022. This guide lists what changes for an application that upgrades from ChartKit 8.

## Requirements

- React 18 or 19. React 16 and 17 are no longer supported, as required by `@gravity-ui/uikit` 8.
- `@gravity-ui/uikit` 8 as the peer dependency. Follow the [uikit migration guide](https://github.com/gravity-ui/uikit/blob/main/docs/migration-to-v8.md) first; in particular, `ThemeProvider` becomes `Provider`.
- A runtime or a build that supports ES2022 syntax. The package is no longer downleveled to ES2017.

```sh
npm install @gravity-ui/chartkit@^9 @gravity-ui/uikit@^8
```

## Package layout

The package ships real CommonJS in `build/cjs` and strict ESM in `build/esm`; `main` points to the CommonJS build and `module` to the ESM build, and every entry point of `exports` has `import` and `require` conditions with types. Deep imports of `build/*` files must be updated: import from `@gravity-ui/chartkit` or one of the plugin subpaths (`@gravity-ui/chartkit/gravity-charts`, `@gravity-ui/chartkit/highcharts`, `@gravity-ui/chartkit/indicator`, `@gravity-ui/chartkit/yagr`). Load the package in one format per process: `settings` and the i18n instance are module singletons, so plugins registered through the CommonJS copy are unknown to the ESM copy and `ChartKit` reports `UNKNOWN_PLUGIN`.

## `gravity-charts` data from charts 1

The `gravity-charts` plugin renders with `@gravity-ui/charts` 2, and `ChartData` (the type of the widget's `data`) is now the charts 2 type. These v1 options are removed and ignored at runtime without a warning:

| Setting              | v1                    | v2                        |
| -------------------- | --------------------- | ------------------------- |
| Tick spacing         | `ticks.pixelInterval` | `ticks.interval` (pixels) |
| Numeric units        | `numberFormat.unit`   | `numberFormat.units`      |
| Bar-X / Bar-Y labels | `dataLabels.inside`   | `dataLabels.placement`    |
| Axis padding         | `maxPadding: 0.25`    | `padding: {max: '25%'}`   |

See the [charts migration guide](https://github.com/gravity-ui/charts/blob/main/docs/diplodoc/pages/migration/v2.md) for the replacement options and their behaviour.

The charts migration adapter is re-exported from the plugin entry, so you do not need `@gravity-ui/charts` in your own dependencies:

```tsx
import {migrateChartDataV1} from '@gravity-ui/chartkit/gravity-charts';
import type {ChartDataV1} from '@gravity-ui/chartkit/gravity-charts';

const {data, warnings} = migrateChartDataV1(legacyData as ChartDataV1);

<ChartKit type="gravity-charts" data={data} />;
```

Run the adapter when the configuration changes, not on every render. It does not mutate the input, execute callbacks or print to the console; `warnings` lists the converted options with their paths and suggested replacements. `inspectChartDataV1` reports the same warnings without changing the configuration.

## TypeScript module resolution

The declaration files are resolved through the `exports` conditions, so `moduleResolution` set to `bundler`, `node16` or `nodenext` finds every type. The package keeps `typesVersions` for the legacy `node` (node10) resolution, which ignores `exports` and sees a subpath only through `typesVersions`. The entry points resolve that way, but the declarations of `@gravity-ui/chartkit/gravity-charts` import `@gravity-ui/charts/migration/v1`, and `@gravity-ui/charts` 2 ships no `typesVersions`. Under `moduleResolution: node` that import fails with TS2307 when `skipLibCheck` is off, and every re-export of the migration adapter (`migrateChartDataV1`, `inspectChartDataV1`, `ChartDataV1`, `MigrationV1Result`, `MigrationV1Warning`) becomes `any` when it is on. The `yagr` plugin declarations have the same limitation with `@gravity-ui/yagr/react` (the type of `YagrReactRef`), as in ChartKit 8. The root entry, `highcharts` and `indicator` are unaffected. Switch to `bundler`, `node16` or `nodenext` to get the full types.

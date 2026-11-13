#!/usr/bin/env node
// Run after npm run build. Check the published v8 declarations with bundler and legacy
// node resolution, including the legacy indicator contract and the new value configuration.
import {spawnSync} from 'node:child_process';
import {mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import {tmpdir} from 'node:os';
import {dirname, join, resolve} from 'node:path';
import {execPath, exit, stderr, stdout} from 'node:process';

const ROOT = resolve(import.meta.dirname, '..');
const {name} = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'));
const require = createRequire(import.meta.url);
let failed = false;

const CONSUMER_BASE = `import ChartKit, {settings} from '${name}';
import type {ChartKitProps, ChartKitWidget} from '${name}';
import {GravityChartsPlugin} from '${name}/gravity-charts';
import {HighchartsPlugin} from '${name}/highcharts';
import type {HighchartsWidgetData} from '${name}/highcharts';
import {IndicatorPlugin} from '${name}/indicator';
import type {IndicatorWidgetData, IndicatorWidgetDataItem} from '${name}/indicator';
import {YagrPlugin} from '${name}/yagr';

settings.set({plugins: [GravityChartsPlugin, HighchartsPlugin, IndicatorPlugin, YagrPlugin]});

interface AppIndicator extends IndicatorWidgetDataItem {appId: string}
interface AppIndicatorData extends IndicatorWidgetData {appId: string}
type LegacyCurrent = IndicatorWidgetDataItem['content']['current'];
function readLegacyIndicator(item: IndicatorWidgetDataItem): string | number {
    const current: LegacyCurrent = item.content.current;
    return current.value;
}
function readLegacyWidget(data: ChartKitWidget['indicator']['data']): string | number | undefined {
    return data.data?.[0].content.current.value;
}
function forwardLegacyData<T extends keyof ChartKitWidget>(data: ChartKitWidget[T]['data']): ChartKitProps<T>['data'] {
    return data;
}
const legacyIndicator: IndicatorWidgetDataItem = {content: {current: {value: 42, numberFormat: 'application metadata', formatNumber: 'application metadata', customMetadata: 'legacy'}}};
const legacyIndicatorValue: string | number = legacyIndicator.content.current.value;
const legacyIndicatorData: IndicatorWidgetData = {data: [legacyIndicator]};
ChartKit({type: 'indicator', data: legacyIndicatorData});
type IndicatorInput = ChartKitProps<'indicator'>['data'];
type IndicatorInputItem = NonNullable<IndicatorInput['data']>[number];
const numberFormat = {unitRate: 1, multiplier: 1000, precision: 1};
const indicatorData: IndicatorInput = {data: [{value: {value: 42, numberFormat}, secondaryValue: {value: 1, arrow: {direction: 'up', ariaLabel: 'Increase'}}}]};
const indicatorWithCallbacks: IndicatorInput = {data: [{value: {value: 42, formatNumber: (value) => String(value), numberFormat}, secondaryValue: {value: 1, formatNumber: (value) => String(value), numberFormat}}]};
ChartKit({type: 'indicator', data: indicatorWithCallbacks});
const publicIndicatorData: ChartKitWidget['indicator']['data'] = legacyIndicatorData;
const indicatorInput: IndicatorInput = {data: [legacyIndicator, ...indicatorData.data!]};
const indicatorProps: ChartKitProps<'indicator'> = {type: 'indicator', data: indicatorInput};
ChartKit(indicatorProps);
ChartKit({type: 'indicator', data: indicatorData});

type TooltipLine = Parameters<NonNullable<HighchartsWidgetData['config']['manageTooltipConfig']>>[0]['lines'][number];
const tooltipFormat: Pick<TooltipLine, 'chartKitFormat' | 'chartKitPrecision' | 'chartKitUnit'> = {chartKitFormat: 'number', chartKitPrecision: 'auto', chartKitUnit: 'k'};
export {ChartKit};
`;

const CONSUMER_CHECKS = `
// @ts-expect-error the normalized indicator configuration is internal
import type {NormalizedIndicatorWidgetConfig} from '${name}/indicator';
// @ts-expect-error the shared value shape is internal
import type {IndicatorValue} from '${name}/indicator';
// @ts-expect-error clean configuration types are internal
import type {IndicatorWidgetConfig} from '${name}/indicator';
// @ts-expect-error clean configuration item types are internal
import type {IndicatorWidgetConfigItem} from '${name}/indicator';
// @ts-expect-error standalone formatting types are internal
import type {FormatNumberOptions} from '${name}/indicator';
// @ts-expect-error the indicator value type must not degrade to any
const invalidIndicator: IndicatorInput = {data: [{value: {value: false}}]};
// @ts-expect-error the new value configuration does not accept arbitrary metadata
const invalidValueMetadata: IndicatorInput = {data: [{value: {value: 42, customMetadata: 'new'}}]};
// @ts-expect-error the new value configuration must reject misspelled display options
const invalidValueColor: IndicatorInput = {data: [{value: {value: 42, colour: 'green'}}]};
// @ts-expect-error local callbacks must return strings
const invalidValueCallback: IndicatorInput = {data: [{value: {value: 42, formatNumber: () => 42}}]};
// @ts-expect-error secondary callbacks must return strings
const invalidSecondaryCallback: IndicatorInput = {data: [{value: {value: 42}, secondaryValue: {value: 1, formatNumber: () => 1}}]};
// @ts-expect-error the legacy value type must retain its original contract
const invalidLegacyValue: IndicatorWidgetDataItem['content']['current']['value'] = false;
// @ts-expect-error the legacy item type must keep content required
const invalidLegacyItem: IndicatorWidgetDataItem = {value: {value: 42}};
// @ts-expect-error each indicator requires value or content.current
const emptyIndicator: IndicatorInput = {data: [{}]};
// @ts-expect-error the extended indicator input must not widen other plugins' data
const invalidHighchartsInput: ChartKitProps<'highcharts'>['data'] = indicatorData;
// @ts-expect-error arrows use an object with a direction
const invalidArrow: NonNullable<IndicatorWidgetDataItem['secondaryValue']> = {value: 1, arrow: 'up'};
// @ts-expect-error arrow directions are restricted to up and down
const invalidDirection: NonNullable<IndicatorWidgetDataItem['secondaryValue']> = {value: 1, arrow: {direction: 'left'}};
// @ts-expect-error labelMode is not an indicator formatting option
const invalidNumberFormat: IndicatorInputItem = {value: {value: 1, numberFormat: {labelMode: 'percent'}}};
// @ts-expect-error Highcharts tooltip precision must retain its original type
const invalidTooltipPrecision: TooltipLine['chartKitPrecision'] = true;
`;

const CONSUMER = CONSUMER_BASE + CONSUMER_CHECKS;

const CONSUMER_MODES = [
    {
        label: 'moduleResolution bundler',
        type: 'module',
        options: {module: 'esnext', moduleResolution: 'bundler'},
        source: CONSUMER,
    },
    {
        label: 'moduleResolution node',
        type: 'commonjs',
        options: {module: 'commonjs', moduleResolution: 'node', esModuleInterop: true},
        source: CONSUMER,
    },
];

function typecheckConsumers() {
    const tsc = require.resolve('typescript/bin/tsc');
    const dir = mkdtempSync(join(tmpdir(), 'chartkit-consumer-'));
    try {
        // The package resolves through a symlink to the repository, and its dependencies from the
        // repository's node_modules (TypeScript resolves the symlink to its real path).
        mkdirSync(join(dir, 'node_modules', dirname(name)), {recursive: true});
        symlinkSync(ROOT, join(dir, 'node_modules', name), 'dir');
        for (const [index, mode] of CONSUMER_MODES.entries()) {
            const project = join(dir, `mode-${index}`);
            mkdirSync(project);
            writeFileSync(join(project, 'package.json'), JSON.stringify({type: mode.type}));
            writeFileSync(join(project, 'consumer.ts'), mode.source);
            // skipLibCheck as in a typical application: the check is on what the consumer sees.
            // No @types are picked up: the scratch project has none.
            writeFileSync(
                join(project, 'tsconfig.json'),
                JSON.stringify({
                    compilerOptions: {
                        strict: true,
                        noEmit: true,
                        target: 'es2022',
                        skipLibCheck: true,
                        types: [],
                        ...mode.options,
                    },
                    files: ['consumer.ts'],
                }),
            );
            const result = spawnSync(execPath, [tsc, '-p', project], {
                cwd: project,
                encoding: 'utf8',
            });
            if (result.status === 0) {
                stdout.write(`consumer (${mode.label}): types resolve\n`);
            } else {
                stderr.write(
                    `consumer (${mode.label}) fails to type-check:\n${result.stdout}${result.stderr}`,
                );
                failed = true;
            }
        }
    } finally {
        rmSync(dir, {recursive: true, force: true});
    }
}

typecheckConsumers();

if (failed) {
    exit(1);
}
stdout.write('The built package preserves the indicator API in both resolution modes.\n');

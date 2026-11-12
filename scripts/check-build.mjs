#!/usr/bin/env node
// Loads the built package in Node (run `npm run build` first): `require` of build/cjs and
// `import` of build/esm for every entry point of the `exports` map, through the package's own
// name. Node resolves chartkit's files strictly, so a missing extension, a directory import or
// a CommonJS file with ESM syntax fails here. CSS and JSON keysets are handled the way bundlers
// handle them: Node cannot import CSS, and imports JSON only with an import attribute.
// Extensionless imports inside the dependencies get `.js` or `/index.js` the way bundlers do
// (a safeguard: none of the current dependencies needs it); the fallback never applies to
// chartkit's files.
// Both builds must export the same names.
//
// A scratch consumer is then type-checked against the package in the resolution modes TypeScript
// offers for `exports`: an ESM and a CommonJS project under `nodenext`, and `bundler`. The
// consumer asserts with `@ts-expect-error` that a wrong value is rejected, so a type that
// silently degrades to `any` (a declaration that does not resolve under `skipLibCheck`) fails
// the check. The legacy `node` resolution is checked with the entry points only: see
// docs/migration-to-v9.md for what degrades there.
//
// The plugin renderers sit behind `React.lazy`, so a load never evaluates them: every emitted
// `.js` is also scanned for ESM syntax (CommonJS build) and extensionless relative specifiers
// (ESM build).
import {spawnSync} from 'node:child_process';
import {
    existsSync,
    mkdirSync,
    mkdtempSync,
    readFileSync,
    readdirSync,
    rmSync,
    statSync,
    symlinkSync,
    writeFileSync,
} from 'node:fs';
import {createRequire, registerHooks} from 'node:module';
import {tmpdir} from 'node:os';
import {dirname, join, relative, resolve} from 'node:path';
import {execPath, exit, stderr, stdout} from 'node:process';
import {pathToFileURL} from 'node:url';

const ROOT = resolve(import.meta.dirname, '..');
const BUILD = join(ROOT, 'build');
const {name, exports: packageExports} = JSON.parse(
    readFileSync(join(ROOT, 'package.json'), 'utf8'),
);

if (!registerHooks) {
    stderr.write('check-build needs Node.js 22.15 or later (module.registerHooks).\n');
    exit(1);
}

const BUILD_URL = `${pathToFileURL(BUILD).href}/`;

// Everything but chartkit's own build: the dependencies, wherever they are installed.
function isDependencyFile(url) {
    return url !== undefined && !url.startsWith(BUILD_URL);
}

const RESOLUTION_ERRORS = ['ERR_MODULE_NOT_FOUND', 'ERR_UNSUPPORTED_DIR_IMPORT'];

// Bundlers append `.js` or `/index.js` to an extensionless specifier; Node does not. The
// dependencies get that here as a safeguard; chartkit's own files, never under node_modules,
// are resolved strictly.
function resolveLikeBundlers(specifier, context, nextResolve) {
    const candidates = [specifier];
    if (isDependencyFile(context.parentURL)) {
        candidates.push(`${specifier}.js`, `${specifier}/index.js`);
    }
    let firstError;
    for (const candidate of candidates) {
        try {
            return nextResolve(candidate, context);
        } catch (error) {
            firstError ??= error;
            if (candidate === specifier && !RESOLUTION_ERRORS.includes(error.code)) {
                throw error;
            }
        }
    }
    throw firstError;
}

registerHooks({
    resolve: resolveLikeBundlers,
    load(url, context, nextLoad) {
        if (url.endsWith('.css')) {
            const format = context.format === 'module' ? 'module' : 'commonjs';
            return {format, source: '', shortCircuit: true};
        }
        if (url.endsWith('.json') && !context.importAttributes?.type) {
            const source = readFileSync(new URL(url), 'utf8');
            return {format: 'json', source, shortCircuit: true};
        }
        return nextLoad(url, context);
    },
});

// The names, with `default` only when the module has a default export: the CommonJS build
// has the key only when TypeScript emitted one, like the ESM build.
function exportNames(module) {
    return Object.keys(module)
        .filter((key) => key !== '__esModule')
        .sort();
}

async function load(label, loadModule) {
    try {
        const names = exportNames(await loadModule());
        stdout.write(`${label}: ${names.length} exports\n`);
        return names;
    } catch (error) {
        stderr.write(`${label} failed to load: ${error.code ?? ''} ${error.message}\n`);
        return undefined;
    }
}

const require = createRequire(import.meta.url);
let failed = false;

for (const entry of Object.keys(packageExports)) {
    if (entry === './package.json') {
        continue;
    }
    const id = entry === '.' ? name : `${name}/${entry.slice(2)}`;
    const cjs = await load(`require('${id}')`, () => require(id));
    const esm = await load(`import('${id}')`, () => import(id));
    if (!cjs || !esm) {
        failed = true;
        continue;
    }
    const onlyCjs = cjs.filter((key) => !esm.includes(key));
    const onlyEsm = esm.filter((key) => !cjs.includes(key));
    if (onlyCjs.length || onlyEsm.length) {
        stderr.write(
            `${id}: the builds export different names. Only CommonJS: ${onlyCjs.join(', ') || '-'}. ` +
                `Only ESM: ${onlyEsm.join(', ') || '-'}.\n`,
        );
        failed = true;
    }
}

function* jsFiles(dir) {
    for (const item of readdirSync(dir)) {
        const file = join(dir, item);
        if (statSync(file).isDirectory()) {
            yield* jsFiles(file);
        } else if (file.endsWith('.js')) {
            yield file;
        }
    }
}

// Specifiers of static imports, re-exports, dynamic imports and `require` calls.
const SPECIFIER =
    /(?:\b(?:import|export)\b[^'"`;]*?\bfrom\s*|\bimport\s*\(?\s*|\brequire\s*\(\s*)['"]([^'"]+)['"]/g;
const RESOLVED_EXTENSIONS = ['.js', '.css', '.json'];

function relativeSpecifiers(code) {
    return [...code.matchAll(SPECIFIER)]
        .map(([, specifier]) => specifier)
        .filter((specifier) => specifier.startsWith('.'));
}

// A relative specifier must point to a file that exists: this is the only check the renderer
// subtrees get, and a failed `.scss` compile leaves a `.css` import without its file.
function missingFiles(code, file) {
    const missing = relativeSpecifiers(code).filter(
        (specifier) => !existsSync(resolve(dirname(file), specifier)),
    );
    return missing.length ? `relative import of a missing file: ${missing.join(', ')}` : undefined;
}

function scanBuild(format, check) {
    const problems = [];
    for (const file of jsFiles(join(BUILD, format))) {
        const code = readFileSync(file, 'utf8')
            .split('\n')
            .filter((line) => !/^\s*(\/\/|\*|\/\*)/.test(line))
            .join('\n');
        const problem = check(code, file);
        if (problem) {
            problems.push(`${relative(ROOT, file)}: ${problem}`);
        }
    }
    if (problems.length) {
        stderr.write(`build/${format} has ${problems.length} problem file(s):\n`);
        problems.forEach((problem) => stderr.write(`  ${problem}\n`));
        failed = true;
    } else {
        stdout.write(`build/${format}: all files pass the static scan\n`);
    }
}

scanBuild('cjs', (code, file) => {
    if (/^(import|export)\b/m.test(code)) {
        return 'ESM syntax in the CommonJS build';
    }
    if (/\bimport\s*\(/.test(code)) {
        return 'native import() in the CommonJS build';
    }
    return missingFiles(code, file);
});

scanBuild('esm', (code, file) => {
    const bad = relativeSpecifiers(code).filter(
        (specifier) => !RESOLVED_EXTENSIONS.some((extension) => specifier.endsWith(extension)),
    );
    if (bad.length) {
        return `relative import without an extension: ${bad.join(', ')}`;
    }
    return missingFiles(code, file);
});

const CONSUMER_BASE = `import ChartKit, {settings} from '${name}';
import type {ChartKitProps, ChartKitWidget} from '${name}';
import {GravityChartsPlugin, migrateChartDataV1} from '${name}/gravity-charts';
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
const legacyIndicator: IndicatorWidgetDataItem = {content: {current: {value: 42, numberFormat: 'application metadata'}}};
const legacyIndicatorValue: string | number = legacyIndicator.content.current.value;
const legacyIndicatorData: IndicatorWidgetData = {data: [legacyIndicator]};
ChartKit({type: 'indicator', data: legacyIndicatorData});
type IndicatorInput = ChartKitProps<'indicator'>['data'];
type IndicatorInputItem = NonNullable<IndicatorInput['data']>[number];
const numberFormat = {unitRate: 1, multiplier: 1000, precision: 1};
const indicatorData: IndicatorInput = {data: [{primaryValue: {value: 42, numberFormat}, secondaryValue: {value: 1, arrow: {direction: 'up', ariaLabel: 'Increase'}}}]};
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
// @ts-expect-error a number is not a chart instance: the yagr types must not degrade to any
export const widget: ChartKitWidget['yagr']['widget'] = 123;
// @ts-expect-error a number is not a charts configuration: the adapter types must not degrade to any
export const migrated = migrateChartDataV1(123);
// @ts-expect-error the indicator adapter is internal
import {migrateIndicatorDataFromV9ToV10} from '${name}/indicator';
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
const invalidIndicator: IndicatorInput = {data: [{primaryValue: {value: false}}]};
// @ts-expect-error the legacy value type must retain its original contract
const invalidLegacyValue: IndicatorWidgetDataItem['content']['current']['value'] = false;
// @ts-expect-error the legacy item type must keep content required
const invalidLegacyItem: IndicatorWidgetDataItem = {primaryValue: {value: 42}};
// @ts-expect-error each indicator requires a primary or legacy value
const emptyIndicator: IndicatorInput = {data: [{}]};
// @ts-expect-error the extended indicator input must not widen other plugins' data
const invalidHighchartsInput: ChartKitProps<'highcharts'>['data'] = indicatorData;
// @ts-expect-error arrows use an object with a direction
const invalidArrow: NonNullable<IndicatorWidgetDataItem['secondaryValue']> = {value: 1, arrow: 'up'};
// @ts-expect-error arrow directions are restricted to up and down
const invalidDirection: NonNullable<IndicatorWidgetDataItem['secondaryValue']> = {value: 1, arrow: {direction: 'left'}};
// @ts-expect-error labelMode is not a public formatting option
const invalidNumberFormat: IndicatorInputItem = {primaryValue: {value: 1, numberFormat: {labelMode: 'percent'}}};
// @ts-expect-error Highcharts tooltip precision must retain its original type
const invalidTooltipPrecision: TooltipLine['chartKitPrecision'] = true;
`;

const CONSUMER = CONSUMER_BASE + CONSUMER_CHECKS;
const CONSUMER_NODE10 = CONSUMER_BASE;

const CONSUMER_MODES = [
    {
        label: 'ESM, moduleResolution nodenext',
        type: 'module',
        options: {module: 'nodenext', moduleResolution: 'nodenext'},
        source: CONSUMER,
    },
    {
        label: 'CommonJS, moduleResolution nodenext',
        type: 'commonjs',
        options: {module: 'nodenext', moduleResolution: 'nodenext'},
        source: CONSUMER,
    },
    {
        label: 'moduleResolution bundler',
        type: 'module',
        options: {module: 'esnext', moduleResolution: 'bundler'},
        source: CONSUMER,
    },
    {
        label: 'moduleResolution node (entry points only)',
        type: 'commonjs',
        options: {module: 'commonjs', moduleResolution: 'node', esModuleInterop: true},
        source: CONSUMER_NODE10,
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
stdout.write('Both builds load through the package exports and export the same names.\n');
// A dependency leaves a MessagePort open after loading, which would keep the process alive.
exit(0);

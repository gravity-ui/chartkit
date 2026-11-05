#!/usr/bin/env node
// Loads the built package in Node (run `npm run build` first): `require` of build/cjs and
// `import` of build/esm for every entry point of the `exports` map, through the package's own
// name. Node resolves chartkit's files strictly, so a missing extension, a directory import or
// a CommonJS file with ESM syntax fails here. CSS and JSON keysets are handled the way bundlers
// handle them: Node cannot import CSS, and imports JSON only with an import attribute.
// Extensionless imports inside the dependencies get `.js` or `/index.js` the way bundlers do
// (`@gravity-ui/charts` 1.x has them in its own build); the fallback never applies to
// chartkit's files.
// Both builds must export the same names.
//
// The plugin renderers sit behind `React.lazy`, so a load never evaluates them: every emitted
// `.js` is also scanned for ESM syntax (CommonJS build) and extensionless relative specifiers
// (ESM build).
import {readFileSync, readdirSync, statSync} from 'node:fs';
import {createRequire, registerHooks} from 'node:module';
import {join, relative, resolve} from 'node:path';
import {exit, stderr, stdout} from 'node:process';
import {fileURLToPath} from 'node:url';

const ROOT = resolve(import.meta.dirname, '..');
const BUILD = join(ROOT, 'build');
const {name, exports: packageExports} = JSON.parse(
    readFileSync(join(ROOT, 'package.json'), 'utf8'),
);

if (!registerHooks) {
    stderr.write('check-build needs Node.js 22.15 or later (module.registerHooks).\n');
    exit(1);
}

function isDependencyFile(url) {
    return url?.startsWith('file:') && fileURLToPath(url).includes('/node_modules/');
}

const RESOLUTION_ERRORS = ['ERR_MODULE_NOT_FOUND', 'ERR_UNSUPPORTED_DIR_IMPORT'];

// Bundlers append `.js` or `/index.js` to an extensionless specifier; Node does not. The
// dependencies get that here (`@gravity-ui/charts` 1.x needs it); chartkit's own files, never
// under node_modules, are resolved strictly.
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
            if (!RESOLUTION_ERRORS.includes(error.code)) {
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

function exportNames(module) {
    return Object.keys(module)
        .filter((key) => key !== 'default' && key !== '__esModule')
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

// Specifiers of static imports, re-exports and dynamic imports.
const SPECIFIER = /(?:\b(?:import|export)\b[^'"`;]*?\bfrom\s*|\bimport\s*\(?\s*)['"]([^'"]+)['"]/g;
const RESOLVED_EXTENSIONS = ['.js', '.css', '.json'];

function scanBuild(format, check) {
    const problems = [];
    for (const file of jsFiles(join(BUILD, format))) {
        const code = readFileSync(file, 'utf8')
            .split('\n')
            .filter((line) => !/^\s*(\/\/|\*|\/\*)/.test(line))
            .join('\n');
        const problem = check(code);
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

scanBuild('cjs', (code) => {
    if (/^(import|export)\b/m.test(code)) {
        return 'ESM syntax in the CommonJS build';
    }
    if (/\bimport\s*\(/.test(code)) {
        return 'native import() in the CommonJS build';
    }
    return undefined;
});

scanBuild('esm', (code) => {
    const bad = [...code.matchAll(SPECIFIER)]
        .map(([, specifier]) => specifier)
        .filter(
            (specifier) =>
                specifier.startsWith('.') &&
                !RESOLVED_EXTENSIONS.some((extension) => specifier.endsWith(extension)),
        );
    return bad.length ? `relative import without an extension: ${bad.join(', ')}` : undefined;
});

if (failed) {
    exit(1);
}
stdout.write('Both builds load through the package exports and export the same names.\n');
// A dependency leaves a MessagePort open after loading, which would keep the process alive.
exit(0);

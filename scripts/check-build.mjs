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
// The plugin renderers sit behind `React.lazy`, so a load never evaluates them: every emitted
// `.js` is also scanned for ESM syntax (CommonJS build) and extensionless relative specifiers
// (ESM build).
import {existsSync, readFileSync, readdirSync, statSync} from 'node:fs';
import {createRequire, registerHooks} from 'node:module';
import {dirname, join, relative, resolve} from 'node:path';
import {exit, stderr, stdout} from 'node:process';
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

if (failed) {
    exit(1);
}
stdout.write('Both builds load through the package exports and export the same names.\n');
// A dependency leaves a MessagePort open after loading, which would keep the process alive.
exit(0);

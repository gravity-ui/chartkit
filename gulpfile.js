const fs = require('node:fs');
const path = require('node:path');
const {Transform} = require('node:stream');

const utils = require('@gravity-ui/gulp-utils');
const {task, src, dest, series, parallel} = require('gulp');
const sass = require('gulp-dart-sass');
const rimraf = require('rimraf');
const ts = require('typescript');

const {version, sideEffects} = require('./package.json');

const BUILD_DIR = path.resolve('build');

task('clean', (done) => {
    rimraf.sync(BUILD_DIR);
    rimraf.sync('styles/**/*.css');
    done();
});

// gulp's own source maps leave out the sources and a way back to them: this embeds the sources
// and sets `sourceRoot` from each map to `src`. The final newline puts the `sourceMappingURL`
// comment that gulp appends on a line of its own.
function completeSourceMaps(outDir) {
    return new Transform({
        objectMode: true,
        transform(file, _encoding, callback) {
            const map = file.sourceMap;
            if (map) {
                if (!file.contents.toString('utf8').endsWith('\n')) {
                    file.contents = Buffer.concat([file.contents, Buffer.from('\n')]);
                }
                map.file = path.basename(file.relative);
                map.sourceRoot = path.relative(
                    path.dirname(path.join(outDir, file.relative)),
                    file.base,
                );
                map.sourcesContent = map.sources.map((source) =>
                    fs.readFileSync(path.join(file.base, source), 'utf8'),
                );
            }
            callback(null, file);
        },
    });
}

// `import('./module')` → `Promise.resolve().then(() => require('./module'))`, for the CommonJS
// build only. With `module: nodenext` TypeScript leaves a dynamic import native. Node runs it,
// but Jest without `--experimental-vm-modules` does not, and in Node the namespace of a
// CommonJS file wraps `module.exports` once more under `default`. `require` gives the consumer
// the same shape in both builds. The ESM build keeps `import()`: that is where the bundlers
// split the chunk. Ported from `@gravity-ui/uikit` 8 (build-utils/transform-dynamic-import.js).
function createDynamicImportTransformer() {
    return (context) => {
        const {factory} = context;

        const visitor = (node) => {
            if (ts.isCallExpression(node) && node.expression.kind === ts.SyntaxKind.ImportKeyword) {
                const specifier = ts.visitNode(node.arguments[0], visitor);
                const load = factory.createArrowFunction(
                    undefined,
                    undefined,
                    [],
                    undefined,
                    factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
                    factory.createCallExpression(factory.createIdentifier('require'), undefined, [
                        specifier,
                    ]),
                );
                const resolved = factory.createCallExpression(
                    factory.createPropertyAccessExpression(
                        factory.createIdentifier('Promise'),
                        'resolve',
                    ),
                    undefined,
                    [],
                );
                const result = factory.createCallExpression(
                    factory.createPropertyAccessExpression(resolved, 'then'),
                    undefined,
                    [load],
                );
                ts.setSourceMapRange(result, ts.getSourceMapRange(node));
                return result;
            }
            return ts.visitEachChild(node, visitor, context);
        };

        return (sourceFile) => ts.visitNode(sourceFile, visitor);
    };
}

async function compileTs(modules = false) {
    const outDir = path.resolve(BUILD_DIR, modules ? 'esm' : 'cjs');
    const tsProject = await utils.createTypescriptProject({
        compilerOptions: {
            declaration: true,
            module: modules ? 'esnext' : 'nodenext',
            moduleResolution: modules ? 'bundler' : 'nodenext',
            ...(modules ? undefined : {verbatimModuleSyntax: false}),
        },
    });

    // Local imports get relative paths with extensions, and `.scss` imports point to the
    // compiled `.css`.
    const transformers = [
        tsProject.customTransformers.transformScssImports,
        tsProject.customTransformers.transformLocalModules,
    ];
    // The ESM build keeps `import()` for the bundlers to split; CommonJS loads with `require`.
    const codeTransformers = modules
        ? transformers
        : [...transformers, createDynamicImportTransformer()];

    return new Promise((resolve, reject) => {
        src(
            [
                'src/**/*.{js,jsx,ts,tsx}',
                '!src/**/__tests__/**',
                '!src/**/__stories__/**',
                '!src/**/mocks/**',
                '!src/**/*.test.{ts,tsx}',
                '!src/**/*.visual.test.{ts,tsx}',
                '!src/**/*.stories.{ts,tsx}',
            ],
            {sourcemaps: true},
        )
            .pipe(
                tsProject({
                    customTransformers: {
                        before: codeTransformers,
                        afterDeclarations: transformers,
                    },
                }),
            )
            .on('error', reject)
            .pipe(completeSourceMaps(outDir))
            // Bundlers read `sideEffects` from the closest package.json, so it repeats the root one.
            .pipe(
                utils.addVirtualFile({
                    fileName: 'package.json',
                    text: JSON.stringify({
                        version,
                        type: modules ? 'module' : 'commonjs',
                        sideEffects,
                    }),
                }),
            )
            .pipe(dest(outDir, {sourcemaps: '.'}))
            .on('error', reject)
            .on('end', resolve);
    });
}

task('compile-to-esm', () => {
    return compileTs(true);
});

task('compile-to-cjs', () => {
    return compileTs();
});

task('copy-js-declarations', () => {
    return src(['src/**/*.d.ts'])
        .pipe(dest(path.resolve(BUILD_DIR, 'esm')))
        .pipe(dest(path.resolve(BUILD_DIR, 'cjs')));
});

task('copy-i18n', () => {
    return src(['src/**/*.json'])
        .pipe(dest(path.resolve(BUILD_DIR, 'esm')))
        .pipe(dest(path.resolve(BUILD_DIR, 'cjs')));
});

task('styles-components', () => {
    return src('src/**/*.scss')
        .pipe(
            sass({
                includePaths: ['node_modules'],
            }).on('error', sass.logError),
        )
        .pipe(dest(path.resolve(BUILD_DIR, 'esm')))
        .pipe(dest(path.resolve(BUILD_DIR, 'cjs')));
});

// Bundles the AI-facing docs tree (cleaned README + docs/ guides) into build/docs so it
// ships in the npm tarball.
task('copy-docs', (done) => {
    const {buildDocs} = require('@gravity-ui/readme-validator');
    buildDocs({
        rootDir: __dirname,
        outDir: path.join(__dirname, 'build', 'docs'),
        sources: [
            {
                title: 'Guides',
                kind: 'markdown',
                baseDir: 'docs',
                outPrefix: 'guides',
                nameFromTitle: true,
            },
        ],
    });
    done();
});

task(
    'build',
    series([
        'clean',
        parallel(['compile-to-esm', 'compile-to-cjs']),
        'copy-js-declarations',
        'copy-i18n',
        'styles-components',
        'copy-docs',
    ]),
);

task('default', series(['build']));

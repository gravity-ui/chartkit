const path = require('path');

const {task, src, dest, series} = require('gulp');
const sass = require('gulp-dart-sass');
const replace = require('gulp-replace');
const ts = require('gulp-typescript');
const rimraf = require('rimraf');

const BUILD_DIR = path.resolve('build');

task('clean', (done) => {
    rimraf.sync(BUILD_DIR);
    rimraf.sync('styles/**/*.css');
    done();
});

function compileTs() {
    const tsProject = ts.createProject('tsconfig.json', {
        declaration: true,
        module: 'esnext',
    });

    return src([
        'src/**/*.{js,jsx,ts,tsx}',
        '!src/**/__tests__/**',
        '!src/**/__stories__/**',
        '!src/**/*.test.{ts,tsx}',
        '!src/**/*.visual.test.{ts,tsx}',
        '!src/**/*.stories.{ts,tsx}',
    ])
        .pipe(replace(/import '.+\.scss';/g, (match) => match.replace('.scss', '.css')))
        .pipe(tsProject())
        .pipe(dest(path.resolve(BUILD_DIR)));
}

task('compile-to-esm', () => {
    return compileTs();
});

task('copy-js-declarations', () => {
    return src(['src/**/*.d.ts']).pipe(dest(path.resolve(BUILD_DIR)));
});

task('copy-i18n', () => {
    return src(['src/**/*.json']).pipe(dest(path.resolve(BUILD_DIR)));
});

task('styles-components', () => {
    return src('src/**/*.scss')
        .pipe(
            sass({
                includePaths: ['node_modules'],
            }),
        )
        .pipe(sass().on('error', sass.logError))
        .pipe(dest(path.resolve(BUILD_DIR)));
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
        'compile-to-esm',
        'copy-js-declarations',
        'copy-i18n',
        'styles-components',
        'copy-docs',
    ]),
);

task('default', series(['build']));

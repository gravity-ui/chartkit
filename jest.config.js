const esModules = [
    '@gravity-ui/date-utils',
    '@gravity-ui/yagr',
    'uplot',
    'd3',
    'd3-array',
    'internmap',
    'delaunator',
    'robust-predicates',
].join('|');

module.exports = {
    verbose: true,
    preset: 'ts-jest',
    testEnvironment: 'jsdom',
    transform: {
        '^.+\\.(js|ts)?$': 'ts-jest',
    },
    modulePathIgnorePatterns: ['<rootDir>/build/', '<rootDir>/node_modules/'],
    transformIgnorePatterns: [`<rootDir>/node_modules/(?!${esModules})`],
    moduleNameMapper: {
        '^.+\\.(css|scss)$': '<rootDir>/test-utils/style.mock.ts',
    },
    setupFiles: ['<rootDir>/test-utils/globals.mock.ts'],
    testPathIgnorePatterns: ['.visual.'],
};

import type {Config} from '@jest/types';

const esModules = ['@gravity-ui/yagr', 'uplot'].join('|');

const cfg: Config.InitialOptions = {
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
};

export default cfg;

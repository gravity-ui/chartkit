import type {Config} from '@jest/types';

const cfg: Config.InitialOptions = {
    verbose: true,
    preset: 'ts-jest',
    testEnvironment: 'jsdom',
    modulePathIgnorePatterns: ['<rootDir>/build/', '<rootDir>/node_modules/'],
    moduleNameMapper: {
        '^.+\\.(css|scss)$': '<rootDir>/test-utils/style.mock.ts',
    },
    setupFiles: ['<rootDir>/test-utils/globals.mock.ts'],
};

export default cfg;

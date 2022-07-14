import type {Config} from '@jest/types';

const cfg: Config.InitialOptions = {
    verbose: true,
    preset: 'ts-jest',
    testEnvironment: 'jsdom',
    modulePathIgnorePatterns: ['<rootDir>/build/', '<rootDir>/node_modules/'],
};

export default cfg;

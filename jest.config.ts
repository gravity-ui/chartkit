import type {Config} from '@jest/types';

const cfg: Config.InitialOptions = {
    preset: 'ts-jest',
    testEnvironment: 'jsdom',
};

export default cfg;

import {INTERNAL_DEFAULT_PROJECT_ANNOTATIONS, setProjectAnnotations} from '@storybook/react-vite';
import {beforeAll, expect} from 'vitest';
import type {ExpectStatic} from 'vitest';

import * as projectAnnotations from './preview';

declare global {
    var vitestExpect: ExpectStatic | undefined;
}

const annotations = setProjectAnnotations([
    INTERNAL_DEFAULT_PROJECT_ANNOTATIONS,
    projectAnnotations as any,
]);

beforeAll(async () => {
    globalThis.vitestExpect = expect;
    await annotations.beforeAll?.();
});

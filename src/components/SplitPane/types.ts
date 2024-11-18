import type {SplitLayout} from './constants';

export type SplitLayoutType = (typeof SplitLayout)[keyof typeof SplitLayout];

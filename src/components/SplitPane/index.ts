import {ScreenOrientationType} from '../../constants';

import {SplitLayoutType} from './types';

export {SplitLayout} from './constants';
export * from './Pane';
export * from './SplitPane';
export * from './StyledSplitPane';
export * from './types';

export function mapScreenOrientationTypeToSplitLayout(
    type: ScreenOrientationType,
): SplitLayoutType {
    switch (type) {
        case 'landscape-primary':
        case 'landscape-secondary': {
            return 'vertical';
        }
        case 'portrait-primary':
        case 'portrait-secondary':
        default: {
            return 'horizontal';
        }
    }
}

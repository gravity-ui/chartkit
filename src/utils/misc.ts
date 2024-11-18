import {AVAILABLE_SCREEN_ORIENTATIONS} from '../constants';
import type {ScreenOrientationType} from '../constants';

export function isScreenOrientationEventType(value: unknown): value is ScreenOrientationType {
    if (typeof value !== 'string') {
        return false;
    }

    return AVAILABLE_SCREEN_ORIENTATIONS.includes(value as ScreenOrientationType);
}

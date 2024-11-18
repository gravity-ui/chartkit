function checkWindowAvailability() {
    return typeof window === 'object';
}

export const IS_WINDOW_AVAILABLE = checkWindowAvailability();

function checkScreenOrientationAvailability() {
    // W3C spec implementation
    return (
        IS_WINDOW_AVAILABLE &&
        typeof window.ScreenOrientation === 'function' &&
        typeof screen.orientation.addEventListener === 'function' &&
        typeof screen.orientation.type === 'string'
    );
}

export const IS_SCREEN_ORIENTATION_AVAILABLE = checkScreenOrientationAvailability();

export const ScreenOrientation = {
    PORTRAIT_PRIMARY: 'portrait-primary',
    PORTRAIT_SECONDARY: 'portrait-secondary',
    LANDSCAPE_PRIMARY: 'landscape-primary',
    LANDSCAPE_SECONDARY: 'landscape-secondary',
} as const;

export type ScreenOrientationType = (typeof ScreenOrientation)[keyof typeof ScreenOrientation];

export const AVAILABLE_SCREEN_ORIENTATIONS = Object.values(ScreenOrientation);

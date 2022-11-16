export type ChartKitErrorArgs = {
    code?: number | string;
    originalError?: Error;
    message?: string;
};

export const CHARTKIT_ERROR_CODE = {
    NO_DATA: 'ERR.CK.NO_DATA',
    UNKNOWN: 'ERR.CK.UNKNOWN_ERROR',
    UNKNOWN_PLUGIN: 'ERR.CK.UNKNOWN_PLUGIN',
    TOO_MANY_LINES: 'ERR.CK.TOO_MANY_LINES',
};

export class ChartKitError extends Error {
    readonly code: number | string;
    readonly isCustomError = true;

    constructor({
        originalError,
        message,
        code = CHARTKIT_ERROR_CODE.UNKNOWN,
    }: ChartKitErrorArgs = {}) {
        super(message);

        this.code = code;

        if (originalError) {
            this.name = originalError.name;
            this.stack = originalError.stack;
        }
    }
}

export const isChartKitError = (error: unknown): error is ChartKitError => {
    return error instanceof Error && 'isCustomError' in error;
};

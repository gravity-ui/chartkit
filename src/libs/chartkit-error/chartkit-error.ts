export type ChartKitErrorArgs = {
    code?: number | string;
    originalError?: Error;
    message?: string;
};

export const CHARTKIT_ERROR_CODE = {
    UNKNOWN: 'ERR.CK.UNKNOWN_ERROR',
    UNKNOWN_PLUGIN: 'ERR.CK.UNKNOWN_PLUGIN',
    NO_DATA: 'ERR.CK.NO_DATA',
};

export class ChartKitError extends Error {
    readonly code: number | string;
    readonly isChartKitError = true;

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
    return error instanceof Error && 'isChartKitError' in error;
};

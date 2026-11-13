export type MigrationWarning<TCode extends string = string> = {
    code: TCode;
    path: (string | number)[];
    message: string;
    replacement?: string;
    resolution: 'automatic' | 'review';
};

export type MigrationResult<TData, TWarning extends MigrationWarning = MigrationWarning> = {
    data: TData;
    warnings: TWarning[];
};

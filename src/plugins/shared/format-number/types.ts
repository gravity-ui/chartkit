export type FormatOptions = {
    precision?: number | 'auto';
    unitRate?: number;
    showRankDelimiter?: boolean;
    signDisplay?: Intl.NumberFormatOptions['signDisplay'];
    lang?: string;
    labelMode?: string;
};

export type FormatNumberOptions = FormatOptions & {
    format?: 'number' | 'percent';
    multiplier?: number;
    prefix?: string;
    postfix?: string;
    unit?: 'auto' | 'k' | 'm' | 'b' | 't' | null;
};

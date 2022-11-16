export type NavigatorPeriod = {
    type: string;
    value: string;
    period: Period;
};

export type Period = 'month' | 'year' | 'day' | 'hour' | 'week' | 'quarter';

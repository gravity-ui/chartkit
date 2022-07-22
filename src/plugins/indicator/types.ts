import type {ChartKitFormatNumber} from '../../types';

export type IndicatorWidgetDataItem = {
    content: {
        current: {
            value: string | number;
        } & Record<string, unknown>;
    };
    color?: string;
    size?: 's' | 'm' | 'l' | 'xl';
    title?: string;
    nowrap?: boolean;
};

export type IndicatorWidgetData = {
    data?: IndicatorWidgetDataItem[];
    defaultColor?: string;
};

export type IndicatorWidgetProps = {
    data: IndicatorWidgetData;
    onLoad?: () => void;
    formatNumber?: ChartKitFormatNumber;
};

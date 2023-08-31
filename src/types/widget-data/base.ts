export type BaseSeries = {
    /** Initial visibility of the series */
    visible?: boolean;
    /**
     * Options for the series data labels, appearing next to each data point.
     *
     * Note: now this option is supported only for `pie` charts.
     * */
    dataLabels?: {
        /**
         * Enable or disable the data labels
         * @default true
         */
        enabled?: boolean;

        style?: Partial<BaseTextStyle>;
    };
};

export type BaseSeriesData<T = any> = {
    /**
     * A reserved subspace to store options and values for customized functionality
     *
     * Here you can add additional data for your own event callbacks and formatter callbacks
     */
    custom?: T;
};

export type BaseTextStyle = {
    fontSize: string;
    fontWeight?: string;
    fontColor?: string;
};

export type BaseSeries = {
    /** Initial visibility of the series */
    visible?: boolean;
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
};

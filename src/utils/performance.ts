export const markChartPerformance = (name: string) => {
    window.performance.mark(`${name}-mark`);
};

export const getChartPerformanceDuration = (name: string) => {
    const measureName = `${name}-measure`;

    window.performance.measure(measureName, `${name}-mark`);

    const entry = window.performance.getEntriesByName(measureName)[0];

    if (entry) {
        return entry.duration;
    }

    console.warn(
        'ChartKit',
        'Performance',
        'getDuration',
        `Measure name '${measureName}' does not exist`,
    );

    return undefined;
};

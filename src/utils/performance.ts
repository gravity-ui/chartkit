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

    return undefined;
};

export function measurePerformance() {
    const timestamp = performance.now();

    return {
        end() {
            return performance.now() - timestamp;
        },
    };
}

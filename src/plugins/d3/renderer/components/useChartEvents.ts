import React from 'react';

export const useChartEvents = () => {
    const [chartHovered, setChartHovered] = React.useState(false);

    const handleMouseEnter = React.useCallback(() => {
        setChartHovered(true);
    }, []);

    const handleMouseLeave = React.useCallback(() => {
        setChartHovered(false);
    }, []);

    return {
        chartHovered,
        handleMouseEnter,
        handleMouseLeave,
    };
};

import React from 'react';
import block from 'bem-cn-lite';

import type {ChartKitWidgetData} from '../../../../types/widget-data';

import {AxisY} from './AxisY';
import {AxisX} from './AxisX';
import {Legend} from './Legend';
import {useChartDimensions} from './useChartDimensions';
import {useChartEvents} from './useChartEvents';
import {useChartOptions} from './useChartOptions';
import {useLegend} from './useLegend';
import {useScales} from './useScales';
import {useSeries} from './useSeries';
import {useShapes} from './useShapes';
import {isAxisRelatedSeries} from './utils';

import './styles.scss';

const b = block('chartkit-d3');

type Props = {
    width: number;
    height: number;
    data: ChartKitWidgetData;
};

export const Chart = ({width, height, data}: Props) => {
    // FIXME: add data validation
    const {series} = data;
    const hasAxisRelatedSeries = series.some(isAxisRelatedSeries);
    const {chartHovered, handleMouseEnter, handleMouseLeave} = useChartEvents();
    const {chart, legend, xAxis, yAxis} = useChartOptions(data);
    const {boundsWidth, boundsHeight, legendHeight} = useChartDimensions({
        width,
        height,
        margin: chart.margin,
        legend,
    });
    const {activeLegendItems, handleLegendItemClick} = useLegend({series});
    const {chartSeries} = useSeries({activeLegendItems, series});
    const {xScale, yScale} = useScales({
        boundsWidth,
        boundsHeight,
        series: chartSeries,
        xAxis,
        yAxis,
    });
    const {shapes} = useShapes({series: chartSeries, xAxis, xScale, yAxis, yScale});

    return (
        <svg
            className={b({hovered: chartHovered})}
            width={width}
            height={height}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <g
                width={boundsWidth}
                height={boundsHeight}
                transform={`translate(${[chart.margin.left, chart.margin.top].join(',')})`}
            >
                {hasAxisRelatedSeries && (
                    <React.Fragment>
                        <AxisY
                            axises={yAxis}
                            width={boundsWidth}
                            height={boundsHeight}
                            offsetTop={chart.margin.top}
                            scale={yScale}
                        />
                        <g transform={`translate(0, ${boundsHeight})`}>
                            <AxisX
                                axis={xAxis}
                                width={width}
                                height={boundsHeight}
                                scale={xScale}
                            />
                        </g>
                    </React.Fragment>
                )}
                {shapes}
            </g>
            {legend.enabled && (
                <Legend
                    width={boundsWidth}
                    offsetWidth={chart.margin.left}
                    height={legendHeight}
                    offsetHeight={height - legendHeight / 2}
                    chartSeries={chartSeries}
                    onItemClick={handleLegendItemClick}
                />
            )}
        </svg>
    );
};

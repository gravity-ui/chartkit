import React from 'react';
import block from 'bem-cn-lite';

import type {ChartKitWidgetData} from '../../../../types/widget-data';

import {AxisY} from './AxisY';
import {AxisX} from './AxisX';
import {Legend} from './Legend';
import {Title} from './Title';
import {Tooltip} from './Tooltip';
import {
    useChartDimensions,
    useChartEvents,
    useChartOptions,
    useLegend,
    useScales,
    useSeries,
    useShapes,
    useTooltip,
} from '../hooks';
import {isAxisRelatedSeries} from '../utils';

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
    const svgRef = React.createRef<SVGSVGElement>();
    const hasAxisRelatedSeries = series.some(isAxisRelatedSeries);
    const {chartHovered, handleMouseEnter, handleMouseLeave} = useChartEvents();
    const {chart, legend, title, tooltip, xAxis, yAxis} = useChartOptions(data);
    const {boundsWidth, boundsHeight, legendHeight} = useChartDimensions({
        width,
        height,
        margin: chart.margin,
        legend,
        title,
        xAxis,
        yAxis,
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
    const {hovered, pointerPosition, handleSeriesMouseMove, handleSeriesMouseLeave} = useTooltip({
        tooltip,
    });
    const {shapes} = useShapes({
        series: chartSeries,
        xAxis,
        xScale,
        yAxis,
        yScale,
        svgContainer: svgRef.current,
        onSeriesMouseMove: handleSeriesMouseMove,
        onSeriesMouseLeave: handleSeriesMouseLeave,
    });

    return (
        <React.Fragment>
            <svg
                ref={svgRef}
                className={b({hovered: chartHovered})}
                width={width}
                height={height}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
            >
                {title && <Title {...title} chartWidth={width} />}
                <g
                    width={boundsWidth}
                    height={boundsHeight}
                    transform={`translate(${[
                        chart.margin.left,
                        chart.margin.top + (title?.height || 0),
                    ].join(',')})`}
                >
                    {hasAxisRelatedSeries && (
                        <React.Fragment>
                            <AxisY
                                axises={yAxis}
                                width={boundsWidth}
                                height={boundsHeight}
                                scale={yScale}
                            />
                            <g transform={`translate(0, ${boundsHeight})`}>
                                <AxisX
                                    axis={xAxis}
                                    width={boundsWidth}
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
            <Tooltip
                hovered={hovered}
                pointerPosition={pointerPosition}
                tooltip={tooltip}
                xAxis={xAxis}
                yAxis={yAxis[0]}
            />
        </React.Fragment>
    );
};

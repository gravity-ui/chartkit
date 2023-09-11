import React from 'react';

import type {ChartKitWidgetData} from '../../../../types';
import {block} from '../../../../utils/cn';

import {AxisY} from './AxisY';
import {AxisX} from './AxisX';
import {Legend} from './Legend';
import {Title} from './Title';
import {Tooltip} from './Tooltip';
import {
    useChartDimensions,
    useChartEvents,
    useChartOptions,
    useAxisScales,
    useSeries,
    useShapes,
    useTooltip,
} from '../hooks';

import './styles.scss';

const b = block('d3');

type Props = {
    top: number;
    left: number;
    width: number;
    height: number;
    data: ChartKitWidgetData;
};

export const Chart = (props: Props) => {
    const {top, left, width, height, data} = props;
    // FIXME: add data validation
    const svgRef = React.createRef<SVGSVGElement>();
    const {chartHovered, handleMouseEnter, handleMouseLeave} = useChartEvents();
    const {chart, legend, title, tooltip, xAxis, yAxis} = useChartOptions(data);
    const {boundsWidth, boundsHeight} = useChartDimensions({
        width,
        height,
        margin: chart.margin,
        yAxis,
    });
    const {preparedSeries, handleLegendItemClick} = useSeries({series: data.series, legend});
    const {xScale, yScale} = useAxisScales({
        boundsWidth,
        boundsHeight,
        series: preparedSeries,
        xAxis,
        yAxis,
    });
    const {hovered, pointerPosition, handleSeriesMouseMove, handleSeriesMouseLeave} = useTooltip({
        tooltip,
    });
    const {shapes} = useShapes({
        top,
        left,
        boundsWidth,
        boundsHeight,
        series: preparedSeries,
        seriesOptions: data.series.options,
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
                    transform={`translate(${[chart.margin.left, chart.margin.top].join(',')})`}
                >
                    {xScale && yScale && (
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
                                    chartWidth={width}
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
                        height={legend.height}
                        legend={legend}
                        offsetHeight={height - legend.height / 2}
                        chartSeries={preparedSeries}
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

import React from 'react';

import type {ChartKitWidgetData} from '../../../../types';
import {block} from '../../../../utils/cn';

import {
    useAxisScales,
    useChartDimensions,
    useChartEvents,
    useChartOptions,
    useSeries,
    useShapes,
    useTooltip,
} from '../hooks';
import {AxisY} from './AxisY';
import {AxisX} from './AxisX';
import {Legend} from './Legend';
import {Title} from './Title';
import {Tooltip} from './Tooltip';

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
    // FIXME: add data validation
    const {top, left, width, height, data} = props;
    const svgRef = React.createRef<SVGSVGElement>();
    const {chartHovered, handleMouseEnter, handleMouseLeave} = useChartEvents();
    const {chart, title, tooltip, xAxis, yAxis} = useChartOptions({
        data,
    });
    const {legendItems, legendConfig, preparedSeries, preparedLegend, handleLegendItemClick} =
        useSeries({
            chartWidth: width,
            chartHeight: height,
            chartMargin: chart.margin,
            series: data.series,
            legend: data.legend,
            preparedYAxis: yAxis,
        });
    const {boundsWidth, boundsHeight} = useChartDimensions({
        width,
        height,
        margin: chart.margin,
        preparedLegend,
        preparedXAxis: xAxis,
        preparedYAxis: yAxis,
        preparedSeries: preparedSeries,
    });
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
                {preparedLegend.enabled && (
                    <Legend
                        chartSeries={preparedSeries}
                        boundsWidth={boundsWidth}
                        legend={preparedLegend}
                        items={legendItems}
                        config={legendConfig}
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

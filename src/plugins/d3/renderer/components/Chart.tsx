import React from 'react';

import type {ChartKitWidgetData} from '../../../../types';
import {block} from '../../../../utils/cn';

import {getD3Dispatcher} from '../d3-dispatcher';
import {
    useAxisScales,
    useChartDimensions,
    useChartOptions,
    useSeries,
    useShapes,
    useTooltip,
} from '../hooks';
import {AxisY} from './AxisY';
import {AxisX} from './AxisX';
import {Legend} from './Legend';
import {Title} from './Title';
import {Tooltip, TooltipTriggerArea} from './Tooltip';
import {getPreparedXAxis} from '../hooks/useChartOptions/x-axis';

import './styles.scss';
import {getWidthOccupiedByYAxis} from '../hooks/useChartDimensions/utils';

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
    const dispatcher = React.useMemo(() => {
        return getD3Dispatcher();
    }, []);
    const {chart, title, tooltip, yAxis} = useChartOptions({
        data,
    });
    const xAxis = React.useMemo(
        () => getPreparedXAxis({xAxis: data.xAxis, width, series: data.series.data}),
        [data, width],
    );
    const {
        legendItems,
        legendConfig,
        preparedSeries,
        preparedSeriesOptions,
        preparedLegend,
        handleLegendItemClick,
    } = useSeries({
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
    const {hovered, pointerPosition} = useTooltip({dispatcher, tooltip});
    const {shapes, shapesData} = useShapes({
        top,
        left,
        boundsWidth,
        boundsHeight,
        dispatcher,
        series: preparedSeries,
        seriesOptions: preparedSeriesOptions,
        xAxis,
        xScale,
        yAxis,
        yScale,
        svgContainer: svgRef.current,
    });

    const boundsOffsetTop = chart.margin.top;
    const boundsOffsetLeft = chart.margin.left + getWidthOccupiedByYAxis({preparedAxis: yAxis});

    return (
        <React.Fragment>
            <svg ref={svgRef} className={b()} width={width} height={height}>
                {title && <Title {...title} chartWidth={width} />}
                <g
                    width={boundsWidth}
                    height={boundsHeight}
                    transform={`translate(${[boundsOffsetLeft, boundsOffsetTop].join(',')})`}
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
                                />
                            </g>
                        </React.Fragment>
                    )}
                    {shapes}
                    {tooltip?.enabled && Boolean(shapesData.length) && (
                        <TooltipTriggerArea
                            boundsWidth={boundsWidth}
                            boundsHeight={boundsHeight}
                            dispatcher={dispatcher}
                            offsetLeft={left}
                            offsetTop={top}
                            shapesData={shapesData}
                            svgContainer={svgRef.current}
                        />
                    )}
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
                dispatcher={dispatcher}
                tooltip={tooltip}
                xAxis={xAxis}
                yAxis={yAxis[0]}
                hovered={hovered}
                pointerPosition={pointerPosition}
            />
        </React.Fragment>
    );
};

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
import {getWidthOccupiedByYAxis} from '../hooks/useChartDimensions/utils';
import {getPreparedXAxis} from '../hooks/useChartOptions/x-axis';
import {getPreparedYAxis} from '../hooks/useChartOptions/y-axis';

import {AxisX} from './AxisX';
import {AxisY} from './AxisY';
import {Legend} from './Legend';
import {Title} from './Title';
import {Tooltip, TooltipTriggerArea} from './Tooltip';

import './styles.scss';

const b = block('d3');

type Props = {
    width: number;
    height: number;
    data: ChartKitWidgetData;
};

export const Chart = (props: Props) => {
    const {width, height, data} = props;
    const svgRef = React.useRef<SVGSVGElement>(null);
    const dispatcher = React.useMemo(() => {
        return getD3Dispatcher();
    }, []);
    const {chart, title, tooltip} = useChartOptions({
        data,
    });
    const xAxis = React.useMemo(
        () => getPreparedXAxis({xAxis: data.xAxis, width, series: data.series.data}),
        [data, width],
    );
    const yAxis = React.useMemo(
        () => getPreparedYAxis({series: data.series.data, yAxis: data.yAxis}),
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

    const clickHandler = data.chart?.events?.click;
    React.useEffect(() => {
        if (clickHandler) {
            dispatcher.on('click-chart', clickHandler);
        }

        return () => {
            dispatcher.on('click-chart', null);
        };
    }, [dispatcher, clickHandler]);

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
                svgContainer={svgRef.current}
                xAxis={xAxis}
                yAxis={yAxis[0]}
                hovered={hovered}
                pointerPosition={pointerPosition}
            />
        </React.Fragment>
    );
};

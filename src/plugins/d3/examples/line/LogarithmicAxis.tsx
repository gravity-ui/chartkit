import React from 'react';

import {Col, Container, Row, Text} from '@gravity-ui/uikit';
import {randomNormal} from 'd3';

import {ChartKit} from '../../../../components/ChartKit';
import {ChartKitWidgetData} from '../../../../types';
import {ExampleWrapper} from '../ExampleWrapper';

export const LineWithLogarithmicAxis = () => {
    const randomY = randomNormal(0, 100);
    const widgetData: ChartKitWidgetData = {
        series: {
            data: [
                {
                    type: 'line',
                    name: 'Line series',
                    data: new Array(25).fill(null).map((_, index) => ({
                        x: index,
                        y: Math.abs(randomY()),
                    })),
                },
            ],
        },
    };
    const lineWidgetData: ChartKitWidgetData = {...widgetData, title: {text: 'line'}};
    const logarithmicWidgetData: ChartKitWidgetData = {
        ...widgetData,
        title: {text: 'logarithmic'},
        yAxis: [
            {
                type: 'logarithmic',
            },
        ],
    };

    return (
        <Container spaceRow={5}>
            <Row space={1}>
                <Text variant="header-2">logarithmic VS line</Text>
            </Row>
            <Row space={3}>
                <Col s={12} m={6}>
                    <ExampleWrapper>
                        <ChartKit type="d3" data={lineWidgetData} />
                    </ExampleWrapper>
                </Col>
                <Col s={12} m={6}>
                    <ExampleWrapper>
                        <ChartKit type="d3" data={logarithmicWidgetData} />
                    </ExampleWrapper>
                </Col>
            </Row>
        </Container>
    );
};

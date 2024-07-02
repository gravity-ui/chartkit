import React from 'react';

import {Col, Container, Row, Text} from '@gravity-ui/uikit';

import {ChartKit} from '../../../../components/ChartKit';
import {ChartKitWidgetAxis, ChartKitWidgetData} from '../../../../types';
import {ExampleWrapper} from '../ExampleWrapper';

export const AxisTitle = () => {
    const getWidgetData = (title: ChartKitWidgetAxis['title']): ChartKitWidgetData => ({
        yAxis: [
            {
                title,
            },
        ],
        xAxis: {
            title,
        },
        series: {
            data: [
                {
                    type: 'line',
                    name: 'Line series',
                    data: [
                        {x: 1, y: 10},
                        {x: 2, y: 100},
                    ],
                },
            ],
        },
    });

    return (
        <Container spaceRow={5}>
            <Row space={1}>
                <Text variant="subheader-3">Axis title alignment</Text>
            </Row>
            <Row space={3}>
                <Col s={4}>
                    <ExampleWrapper>
                        <ChartKit type="d3" data={getWidgetData({text: 'Left', align: 'left'})} />
                    </ExampleWrapper>
                </Col>
                <Col s={4}>
                    <ExampleWrapper>
                        <ChartKit
                            type="d3"
                            data={getWidgetData({text: 'Center', align: 'center'})}
                        />
                    </ExampleWrapper>
                </Col>
                <Col s={4}>
                    <ExampleWrapper>
                        <ChartKit type="d3" data={getWidgetData({text: 'Right', align: 'right'})} />
                    </ExampleWrapper>
                </Col>
            </Row>
        </Container>
    );
};

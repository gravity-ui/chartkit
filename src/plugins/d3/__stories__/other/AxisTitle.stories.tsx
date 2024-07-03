import React from 'react';

import {Col, Container, Row, Text} from '@gravity-ui/uikit';
import type {StoryObj} from '@storybook/react';

import {ChartKit} from '../../../../components/ChartKit';
import {Loader} from '../../../../components/Loader/Loader';
import {settings} from '../../../../libs';
import type {ChartKitWidgetAxis, ChartKitWidgetData} from '../../../../types';
import {ExampleWrapper} from '../../examples/ExampleWrapper';
import {D3Plugin} from '../../index';

const AxisTitle = () => {
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        settings.set({plugins: [D3Plugin]});
        setLoading(false);
    }, []);

    if (loading) {
        return <Loader />;
    }

    const longText = `One dollar and eighty-seven cents. That was all.
    And sixty cents of it was in pennies. Pennies saved one and two at a time by bulldozing
    the grocer and the vegetable man and the butcher until one's cheeks burned with the silent
    imputation of parsimony that such close dealing implied. Three times Della counted it.
    One dollar and eighty - seven cents.`;
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
                <Text variant="subheader-3">Text alignment</Text>
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
            <Row space={1}>
                <Text variant="subheader-3">Long text</Text>
            </Row>
            <Row space={3}>
                <Col s={6}>
                    <ExampleWrapper>
                        <ChartKit
                            type="d3"
                            data={{
                                ...getWidgetData({text: longText}),
                                title: {text: 'default behaviour'},
                            }}
                        />
                    </ExampleWrapper>
                </Col>
                <Col s={6}>
                    <ExampleWrapper>
                        <ChartKit
                            type="d3"
                            data={{
                                ...getWidgetData({text: longText, maxRowCount: 0}),
                                title: {text: 'multiline'},
                            }}
                        />
                    </ExampleWrapper>
                </Col>
            </Row>
        </Container>
    );
};

export const AxisTitleStory: StoryObj<typeof AxisTitle> = {
    name: 'Axis title',
};

export default {
    title: 'Plugins/D3/other',
    component: AxisTitle,
};

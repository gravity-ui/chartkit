import React from 'react';

import {Col, Container, Row} from '@gravity-ui/uikit';
import type {StoryObj} from '@storybook/react';

import {ChartKit} from '../../../../components/ChartKit';
import {Loader} from '../../../../components/Loader/Loader';
import {settings} from '../../../../libs';
import type {ChartKitWidgetData} from '../../../../types';
import {ExampleWrapper} from '../../examples/ExampleWrapper';
import {D3Plugin} from '../../index';

const BarYWithHtmlLabels = () => {
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        settings.set({plugins: [D3Plugin]});
        setLoading(false);
    }, []);

    if (loading) {
        return <Loader />;
    }

    const getLabelData = (value: string, color: string) => {
        const labelStyle = `background: ${color};color: #fff;padding: 4px;border-radius: 4px;border: 1px solid #fff;`;
        return {
            label: `<span style="${labelStyle}">${value}</span>`,
            color,
        };
    };

    const widgetData: ChartKitWidgetData = {
        series: {
            data: [
                {
                    type: 'bar-y',
                    name: 'Series 1',
                    dataLabels: {
                        enabled: true,
                        html: true,
                    },
                    data: [
                        {
                            y: 0,
                            x: Math.random() * 1000,
                            ...getLabelData('First', '#4fc4b7'),
                        },
                        {
                            y: 1,
                            x: Math.random() * 1000,
                            ...getLabelData('Last', '#8ccce3'),
                        },
                    ],
                },
            ],
        },
        yAxis: [{type: 'category', categories: ['First', 'Second']}],
        title: {text: 'Bar-y with html labels'},
    };

    return (
        <Container spaceRow={5}>
            <Row space={1}>
                <Col s={4}>
                    <ExampleWrapper>
                        <ChartKit type="d3" data={widgetData} />
                    </ExampleWrapper>
                </Col>
            </Row>
        </Container>
    );
};

export const BarYWithHtmlLabelsStory: StoryObj<typeof BarYWithHtmlLabels> = {
    name: 'Html in labels',
};

export default {
    title: 'Plugins/D3/Bar-y',
    component: BarYWithHtmlLabels,
};

import React from 'react';

import {Col, Container, Row} from '@gravity-ui/uikit';
import type {StoryObj} from '@storybook/react';

import {ChartKit} from '../../../../components/ChartKit';
import {Loader} from '../../../../components/Loader/Loader';
import {settings} from '../../../../libs';
import type {ChartKitWidgetData} from '../../../../types';
import {ExampleWrapper} from '../../examples/ExampleWrapper';
import {D3Plugin} from '../../index';

const PieWithHtmlLabels = () => {
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        settings.set({plugins: [D3Plugin]});
        setLoading(false);
    }, []);

    if (loading) {
        return <Loader />;
    }

    const getPieSegmentData = (name: string, color: string) => {
        const labelStyle = `background: ${color};color: #fff;padding: 4px;border-radius: 4px;`;
        return {
            name: name,
            value: Math.random() * 10,
            label: `<span style="${labelStyle}">${name}</span>`,
            color: color,
        };
    };

    const getWidgetData = (): ChartKitWidgetData => ({
        series: {
            data: [
                {
                    type: 'pie',
                    dataLabels: {
                        enabled: true,
                        html: true,
                        connectorPadding: 8,
                    },
                    data: [
                        getPieSegmentData('One', '#4fc4b7'),
                        getPieSegmentData('Two', '#59abc9'),
                        getPieSegmentData('Three', '#8ccce3'),
                    ],
                },
            ],
        },
        title: {text: 'Pie with html labels'},
        legend: {enabled: true},
    });

    return (
        <Container spaceRow={5}>
            <Row space={1}>
                <Col s={4}>
                    <ExampleWrapper>
                        <ChartKit type="d3" data={getWidgetData()} />
                    </ExampleWrapper>
                </Col>
            </Row>
        </Container>
    );
};

export const PieWithHtmlLabelsStory: StoryObj<typeof PieWithHtmlLabels> = {
    name: 'Html in labels',
};

export default {
    title: 'Plugins/D3/Pie',
    component: PieWithHtmlLabels,
};

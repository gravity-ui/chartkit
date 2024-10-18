import React from 'react';

import {Col, Container, Row} from '@gravity-ui/uikit';
import type {StoryObj} from '@storybook/react';

import {ChartKit} from '../../../../components/ChartKit';
import {Loader} from '../../../../components/Loader/Loader';
import {settings} from '../../../../libs';
import type {ChartKitWidgetData} from '../../../../types';
import {TreemapSeries} from '../../../../types';
import {ExampleWrapper} from '../../examples/ExampleWrapper';
import {D3Plugin} from '../../index';

const TreemapWithHtmlLabels = () => {
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        settings.set({plugins: [D3Plugin]});
        setLoading(false);
    }, []);

    if (loading) {
        return <Loader />;
    }

    const styledLabel = (label: string) =>
        `<span style="padding: 2px; background-color: #0a3069;color: #fff;">${label}</span>`;
    const treemapSeries: TreemapSeries = {
        type: 'treemap',
        name: 'Example',
        dataLabels: {
            enabled: true,
            html: true,
            align: 'right',
        },
        layoutAlgorithm: 'binary',
        levels: [
            {index: 1, padding: 3},
            {index: 2, padding: 1},
        ],
        data: [
            {name: styledLabel('One'), value: 15},
            {name: styledLabel('Two'), id: 'Two'},
            {name: [styledLabel('Two'), '1'], value: 2, parentId: 'Two'},
            {name: [styledLabel('Two'), '2'], value: 8, parentId: 'Two'},
        ],
    };

    const getWidgetData = (): ChartKitWidgetData => ({
        series: {
            data: [treemapSeries],
        },
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

export const TreemapWithHtmlLabelsStory: StoryObj<typeof TreemapWithHtmlLabels> = {
    name: 'Html in labels',
};

export default {
    title: 'Plugins/D3/Treemap',
    component: TreemapWithHtmlLabels,
};

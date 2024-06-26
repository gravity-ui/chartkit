import React from 'react';

import {Col, Container, Row, Text} from '@gravity-ui/uikit';
import {withKnobs} from '@storybook/addon-knobs';
import {StoryObj} from '@storybook/react';

import {Loader} from '../../../components/Loader/Loader';
import {settings} from '../../../libs';
import {Basic as BasicArea} from '../examples/area/Basic';
import {NegativeValues as AreaNegativeValues} from '../examples/area/NegativeValues';
import {PercentStackingArea} from '../examples/area/PercentStacking';
import {StackedArea} from '../examples/area/StackedArea';
import {TwoYAxis as AreaTwoYAxis} from '../examples/area/TwoYAxis';
import {BasicBarXChart} from '../examples/bar-x/Basic';
import {DataLabels as BarXDataLabels} from '../examples/bar-x/DataLabels';
import {GroupedColumns} from '../examples/bar-x/GroupedColumns';
import {NegativeValues as BarXNegativeValues} from '../examples/bar-x/NegativeValues';
import {PercentStackColumns} from '../examples/bar-x/PercentStack';
import {StackedColumns} from '../examples/bar-x/StackedColumns';
import {TwoYAxis as BarXTwoYAxis} from '../examples/bar-x/TwoYAxis';
import {Basic as BasicBarY} from '../examples/bar-y/Basic';
import {GroupedColumns as GroupedColumnsBarY} from '../examples/bar-y/GroupedColumns';
import {NegativeValues as BarYNegativeValues} from '../examples/bar-y/NegativeValues';
import {PercentStackingBars} from '../examples/bar-y/PercentStacking';
import {StackedColumns as StackedColumnsBarY} from '../examples/bar-y/StackedColumns';
import {LineAndBarXCombinedChart} from '../examples/combined/LineAndBarX';
import {Basic as BasicLine} from '../examples/line/Basic';
import {DataLabels as LineWithDataLabels} from '../examples/line/DataLabels';
import {LineWithMarkers} from '../examples/line/LineWithMarkers';
import {LinesWithShapes} from '../examples/line/Shapes';
import {TwoYAxis as LineTwoYAxis} from '../examples/line/TwoYAxis';
import {BasicPie} from '../examples/pie/Basic';
import {Donut} from '../examples/pie/Donut';
import {Basic as BasicScatter} from '../examples/scatter/Basic';
import {TwoYAxis as ScatterTwoYAxis} from '../examples/scatter/TwoYAxis';
import {D3Plugin} from '../index';

const ShowcaseStory = () => {
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        settings.set({plugins: [D3Plugin]});
        setLoading(false);
    }, []);

    return (
        <div style={{width: '100%', height: '100%'}}>
            {loading ? (
                <Loader />
            ) : (
                <Container spaceRow={5}>
                    <Row space={1}>
                        <Text variant="header-2">Line charts</Text>
                    </Row>
                    <Row space={3}>
                        <Col s={12} m={6}>
                            <Text variant="subheader-1">Basic line chart</Text>
                            <BasicLine />
                        </Col>
                        <Col s={12} m={6}>
                            <Text variant="subheader-1">With markers</Text>
                            <LineWithMarkers />
                        </Col>
                        <Col s={12} m={12} l={6}>
                            <Text variant="subheader-1">With data labels</Text>
                            <LineWithDataLabels />
                        </Col>
                        <Col s={12} m={6} l={6}>
                            <Text variant="subheader-1">Lines with different shapes</Text>
                            <LinesWithShapes />
                        </Col>
                        <Col s={12} m={6} l={6}>
                            <Text variant="subheader-1">Line with two Y axis</Text>
                            <LineTwoYAxis />
                        </Col>
                    </Row>
                    <Row space={1}>
                        <Text variant="header-2">Area charts</Text>
                    </Row>
                    <Row space={3}>
                        <Col s={12} m={6}>
                            <Text variant="subheader-1">Basic area chart</Text>
                            <BasicArea />
                        </Col>
                        <Col s={12} m={6}>
                            <Text variant="subheader-1">Stacked area</Text>
                            <StackedArea />
                        </Col>
                        <Col s={12} m={6}>
                            <Text variant="subheader-1">Stacked percentage areas</Text>
                            <PercentStackingArea />
                        </Col>
                        <Col s={12} m={6}>
                            <Text variant="subheader-1">Dual Y axis</Text>
                            <AreaTwoYAxis />
                        </Col>
                        <Col s={12} m={6}>
                            <Text variant="subheader-1">With negative values</Text>
                            <AreaNegativeValues />
                        </Col>
                    </Row>
                    <Row space={1}>
                        <Text variant="header-2">Bar-x charts</Text>
                    </Row>
                    <Row space={3}>
                        <Col s={12} m={6}>
                            <Text variant="subheader-1">Basic column chart</Text>
                            <BasicBarXChart />
                        </Col>
                        <Col s={12} m={6}>
                            <Text variant="subheader-1">Grouped columns</Text>
                            <GroupedColumns />
                        </Col>
                        <Col s={12} m={6}>
                            <Text variant="subheader-1">Stacked columns(normal)</Text>
                            <StackedColumns />
                        </Col>
                        <Col s={12} m={6}>
                            <Text variant="subheader-1">Stacked percentage column</Text>
                            <PercentStackColumns />
                        </Col>
                        <Col s={12} m={6}>
                            <Text variant="subheader-1">Bar-x chart with data labels</Text>
                            <BarXDataLabels />
                        </Col>
                        <Col s={12} m={6}>
                            <Text variant="subheader-1">Dual Y axis</Text>
                            <BarXTwoYAxis />
                        </Col>
                        <Col s={12} m={6}>
                            <Text variant="subheader-1">Bar-x chart with negative values</Text>
                            <BarXNegativeValues />
                        </Col>
                    </Row>
                    <Row space={1}>
                        <Text variant="header-2">Bar-y charts</Text>
                    </Row>
                    <Row space={3}>
                        <Col s={12} m={6}>
                            <Text variant="subheader-1">Basic bar chart</Text>
                            <BasicBarY />
                        </Col>
                        <Col s={12} m={6}>
                            <Text variant="subheader-1">Grouped bars</Text>
                            <GroupedColumnsBarY />
                        </Col>
                        <Col s={12} m={6}>
                            <Text variant="subheader-1">Stacked bars</Text>
                            <StackedColumnsBarY />
                        </Col>
                        <Col s={12} m={6}>
                            <Text variant="subheader-1">Stacked percentage bars</Text>
                            <PercentStackingBars />
                        </Col>
                        <Col s={12} m={6}>
                            <Text variant="subheader-1">Bar-y chart with negative values</Text>
                            <BarYNegativeValues />
                        </Col>
                    </Row>
                    <Row space={1}>
                        <Text variant="header-2">Pie charts</Text>
                    </Row>
                    <Row space={3}>
                        <Col s={12} m={6}>
                            <Text variant="subheader-1">Basic pie chart</Text>
                            <BasicPie />
                        </Col>
                        <Col s={12} m={6}>
                            <Text variant="subheader-1">Donut chart</Text>
                            <Donut />
                        </Col>
                    </Row>
                    <Row space={1}>
                        <Text variant="header-2">Scatter charts</Text>
                    </Row>
                    <Row space={3}>
                        <Col s={12} m={6} l={6}>
                            <Text variant="subheader-1">Basic scatter</Text>
                            <BasicScatter />
                        </Col>
                        <Col s={12} m={6} l={6}>
                            <Text variant="subheader-1">Scatter chart with two Y axis</Text>
                            <ScatterTwoYAxis />
                        </Col>
                    </Row>
                    <Row space={1}>
                        <Text variant="header-2">Combined charts</Text>
                    </Row>
                    <Row space={3} style={{minHeight: 280}}>
                        <Col s={12}>
                            <Text variant="subheader-1">Line + Bar-X</Text>
                            <LineAndBarXCombinedChart />
                        </Col>
                    </Row>
                </Container>
            )}
        </div>
    );
};

export const D3ShowcaseStory: StoryObj<typeof ShowcaseStory> = {
    name: 'Showcase',
};

export default {
    title: 'Plugins/D3/Showcase',
    decorators: [withKnobs],
    component: ShowcaseStory,
};

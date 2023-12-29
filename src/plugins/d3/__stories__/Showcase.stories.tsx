import React from 'react';
import {Container, Row, Col, Text} from '@gravity-ui/uikit';
import {StoryObj} from '@storybook/react';
import {withKnobs} from '@storybook/addon-knobs';

import {settings} from '../../../libs';
import {Loader} from '../../../components/Loader/Loader';
import {D3Plugin} from '../index';
import {BasicBarXChart} from '../examples/bar-x/Basic';
import {GroupedColumns} from '../examples/bar-x/GroupedColumns';
import {StackedColumns} from '../examples/bar-x/StackedColumns';
import {DataLabels as BarXDataLabels} from '../examples/bar-x/DataLabels';
import {Basic as BasicBarY} from '../examples/bar-y/Basic';
import {GroupedColumns as GroupedColumnsBarY} from '../examples/bar-y/GroupedColumns';
import {StackedColumns as StackedColumnsBarY} from '../examples/bar-y/StackedColumns';
import {BasicPie} from '../examples/pie/Basic';
import {Basic as BasicScatter} from '../examples/scatter/Basic';
import {Basic as BasicLine} from '../examples/line/Basic';
import {Basic as BasicArea} from '../examples/area/Basic';
import {LinesWithShapes} from '../examples/line/Shapes';
import {DataLabels as LineWithDataLabels} from '../examples/line/DataLabels';
import {Donut} from '../examples/pie/Donut';
import {LineAndBarXCombinedChart} from '../examples/combined/LineAndBarX';
import {LineWithMarkers} from '../examples/line/LineWithMarkers';
import {StackedArea} from '../examples/area/StackedArea';

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
                        <Col s={12} m={12} l={6}>
                            <Text variant="subheader-1">Lines with different shapes</Text>
                            <LinesWithShapes />
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
                            <Text variant="subheader-1">Stacked columns</Text>
                            <StackedColumns />
                        </Col>
                        <Col s={12} m={6}>
                            <Text variant="subheader-1">Bar-x chart with data labels</Text>
                            <BarXDataLabels />
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
                        <Col s={12} m={12}>
                            <Text variant="subheader-1">Stacked bars</Text>
                            <StackedColumnsBarY />
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
                        <Col s={12}>
                            <Text variant="subheader-1">Basic scatter</Text>
                            <BasicScatter />
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

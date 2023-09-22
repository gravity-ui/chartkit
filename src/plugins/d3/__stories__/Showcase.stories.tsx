import React from 'react';
import {withKnobs} from '@storybook/addon-knobs';
import {BasicBarXChart} from '../examples/bar-x/Basic';
import {settings} from '../../../libs';
import {D3Plugin} from '../index';
import {Loader} from '../../../components/Loader/Loader';
import {GroupedColumns} from '../examples/bar-x/GroupedColumns';
import {StackedColumns} from '../examples/bar-x/StackedColumns';

type ChartWidgetProps = {
    title: string;
};
const ChartWidget: React.FC<ChartWidgetProps> = (props) => {
    const {children, title} = props;

    return (
        <div style={{height: 280}}>
            <div style={{fontSize: 16, marginBottom: 10, textAlign: 'center'}}>{title}</div>
            {children}
        </div>
    );
};

const BlockTitle: React.FC = ({children}) => {
    return <div style={{fontSize: 18, gridColumnStart: 'span 3'}}>{children}</div>;
};

export const Showcase = () => {
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
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3, 320px)',
                        gridGap: '40px',
                    }}
                >
                    <BlockTitle>Bar-x charts</BlockTitle>
                    <ChartWidget title="Basic column chart">
                        <BasicBarXChart />
                    </ChartWidget>
                    <ChartWidget title="Grouped columns">
                        <GroupedColumns />
                    </ChartWidget>
                    <ChartWidget title="Stacked columns">
                        <StackedColumns />
                    </ChartWidget>
                    <BlockTitle>Pie charts</BlockTitle>
                    <BlockTitle>Scatter charts</BlockTitle>
                </div>
            )}
        </div>
    );
};

export default {
    title: 'Plugins/D3/Showcase',
    decorators: [withKnobs],
};

import React, {ChangeEventHandler} from 'react';

import {ChartKit} from '../../../../components/ChartKit';
import {settings} from '../../../../libs';
import {GravityChartsPlugin} from '../../index';

export const TestStory = (props: any) => {
    const [chartData, setChartData] = React.useState(props.data);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        settings.set({plugins: [GravityChartsPlugin]});
        setLoading(false);
    }, []);

    const updateData: ChangeEventHandler<HTMLInputElement> = (event) => {
        const value = event.target.value;
        setChartData(JSON.parse(value));
    };

    if (loading) {
        return <span>loading</span>;
    }

    return (
        <div
            style={{
                height: '80vh',
                width: '100%',
            }}
        >
            <input value={JSON.stringify(chartData)} onChange={updateData} />
            <ChartKit id="chart" data={chartData} type="gravity-charts" />
        </div>
    );
};

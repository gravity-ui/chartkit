import React from 'react';

import {Button} from '@gravity-ui/uikit';
import {Meta, Story} from '@storybook/react';

import {ChartKit} from '../../../../components/ChartKit';
import {CHARTKIT_ERROR_CODE, settings} from '../../../../libs';
import {RenderError} from '../../../../types';
import {HighchartsPlugin} from '../../index';
import {filledData, noData} from '../../mocks/custom-error-render';
import holidays from '../../mocks/holidays';
import {ChartStory} from '../components/ChartStory';

export default {
    title: 'Plugins/Highcharts/CustomErrorRender',
    component: ChartKit,
} as Meta;

const Template: Story = () => {
    const [data, setData] = React.useState(noData);

    const renderErrorView: RenderError = React.useCallback(({error, message, resetError}) => {
        function renderFixButton() {
            if (!('code' in error)) {
                return null;
            }

            switch (error.code) {
                case CHARTKIT_ERROR_CODE.UNKNOWN_PLUGIN:
                    return (
                        <Button
                            onClick={() => {
                                settings.set({plugins: [HighchartsPlugin], extra: {holidays}});
                                resetError();
                            }}
                        >
                            Add highcharts plugin
                        </Button>
                    );
                case CHARTKIT_ERROR_CODE.NO_DATA:
                    return (
                        <Button
                            onClick={() => {
                                setData(filledData);
                            }}
                        >
                            Add data
                        </Button>
                    );
                default:
                    return null;
            }
        }

        return (
            <div>
                <h2>{message}</h2>
                {renderFixButton()}
            </div>
        );
    }, []);

    return (
        <div>
            <ChartStory
                withoutPlugin={true}
                data={data}
                visible={true}
                renderError={renderErrorView}
            />
        </div>
    );
};

export const CustomErrorRender = Template.bind({});

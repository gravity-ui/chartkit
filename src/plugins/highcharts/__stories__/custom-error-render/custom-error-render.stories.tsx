import React from 'react';
import {Meta, Story} from '@storybook/react';
import {ChartKit} from '../../../../components/ChartKit';
import {ChartStory} from '../components/ChartStory';
import {Button} from '@gravity-ui/uikit';
import {ErrorBoundaryRenderErrorView} from '../../../../components/ErrorBoundary/ErrorBoundary';
import {CHARTKIT_ERROR_CODE, settings} from '../../../../libs';
import {HighchartsPlugin} from '../../index';
import holidays from '../../mocks/holidays';
import {noData, filledData} from '../../mocks/custom-error-render';

export default {
    title: 'Plugins/Highcharts/CustomErrorRender',
    component: ChartKit,
} as Meta;

const Template: Story = () => {
    const [data, setData] = React.useState(noData);

    const renderErrorView: ErrorBoundaryRenderErrorView = React.useCallback(
        ({error, message, resetError}) => {
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
        },
        [],
    );

    return (
        <div>
            <ChartStory
                withoutPlugin={true}
                data={data}
                visible={true}
                renderErrorView={renderErrorView}
            />
        </div>
    );
};

export const CustomErrorRender = Template.bind({});

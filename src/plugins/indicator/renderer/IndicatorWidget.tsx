import React from 'react';
import block from 'bem-cn-lite';
import {isEmpty} from 'lodash';
import {i18n} from '../../../i18n';
import {CHARTKIT_ERROR_CODE, ChartKitError} from '../../../libs';
import {CHARTKIT_SCROLLABLE_NODE_CLASSNAME} from '../../../constants';
import {getChartPerformanceDuration, getRandomCKId, markChartPerformance} from '../../../utils';
import type {ChartKitWidgetRef, ChartKitProps} from '../../../types';
import {IndicatorItem} from './IndicatorItem';

import './IndicatorWidget.scss';

const b = block('chartkit-indicator');

const IndicatorWidget = React.forwardRef<ChartKitWidgetRef | undefined, ChartKitProps<'indicator'>>(
    // _ref needs to avoid this React warning:
    // "forwardRef render functions accept exactly two parameters: props and ref"
    function IndicatorWidgetInner(props, _ref) {
        const {
            onLoad,
            formatNumber,
            data: {data = [], defaultColor},
            id,
            onRender,
        } = props;

        const generatedId = React.useMemo(
            () => `${id}_${getRandomCKId()}`,
            [data, defaultColor, formatNumber, id],
        );

        markChartPerformance(generatedId);

        React.useLayoutEffect(() => {
            if (onRender) {
                onRender({renderTime: getChartPerformanceDuration(generatedId)});
                return;
            }
            onLoad?.({widgetRendering: getChartPerformanceDuration(generatedId)});
        }, [onLoad, onRender, generatedId]);

        if (isEmpty(data)) {
            throw new ChartKitError({
                code: CHARTKIT_ERROR_CODE.NO_DATA,
                message: i18n('error', 'label_no-data'),
            });
        }

        return (
            <div className={b()}>
                <div className={b('content', CHARTKIT_SCROLLABLE_NODE_CLASSNAME)}>
                    {data.map((item, index) => (
                        <IndicatorItem
                            {...item}
                            key={`${index}-ck-indicator-item`}
                            defaultColor={defaultColor}
                            formatNumber={formatNumber}
                        />
                    ))}
                </div>
            </div>
        );
    },
);

export default IndicatorWidget;

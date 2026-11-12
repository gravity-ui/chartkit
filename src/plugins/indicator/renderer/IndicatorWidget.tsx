import React from 'react';

import isEmpty from 'es-toolkit/compat/isEmpty';

import {CHARTKIT_SCROLLABLE_NODE_CLASSNAME} from '../../../constants';
import {i18n} from '../../../i18n';
import {CHARTKIT_ERROR_CODE, ChartKitError} from '../../../libs';
import type {ChartKitProps, ChartKitWidgetRef} from '../../../types';
import {getChartPerformanceDuration, getRandomCKId, markChartPerformance} from '../../../utils';
import {block} from '../../../utils/cn';
import type {IndicatorItemProps} from '../internal-types';
import {
    getPrimaryValueFormatOptions,
    migrateIndicatorDataFromV9ToV10,
} from '../migration/from-v9-to-v10';

import {IndicatorItem} from './IndicatorItem';
import {formatValue} from './utils';

import './IndicatorWidget.scss';

const b = block('indicator');

export const IndicatorWidget = React.forwardRef<
    ChartKitWidgetRef | undefined,
    ChartKitProps<'indicator'>
>(
    // _ref needs to avoid this React warning:
    // "forwardRef render functions accept exactly two parameters: props and ref"
    function IndicatorWidgetInner(props, _ref) {
        const {onLoad, formatNumber, data: config, id, onRender} = props;
        const {data = [], defaultColor} = config;

        const normalizedData = React.useMemo(
            () => migrateIndicatorDataFromV9ToV10(config).data.data ?? [],
            [config],
        );

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

        const items: IndicatorItemProps[] = normalizedData.map((item, index) => {
            const {primaryValue, secondaryValue, title, size, nowrap} = item;
            return {
                title,
                size,
                nowrap,
                primaryValue: {
                    value: formatValue(
                        primaryValue,
                        formatNumber,
                        getPrimaryValueFormatOptions(data[index]),
                    ),
                    color: primaryValue.color || defaultColor,
                },
                secondaryValue: secondaryValue
                    ? {
                          value: formatValue(secondaryValue, formatNumber),
                          color: secondaryValue.color,
                          caption: secondaryValue.caption,
                          position: secondaryValue.position,
                          view: secondaryValue.view,
                          arrow: secondaryValue.arrow,
                      }
                    : undefined,
            };
        });

        return (
            <div className={b()}>
                <div className={b('content', CHARTKIT_SCROLLABLE_NODE_CLASSNAME)}>
                    {items.map((item, index) => (
                        <IndicatorItem {...item} key={`${index}-ck-indicator-item`} />
                    ))}
                </div>
            </div>
        );
    },
);

import React from 'react';

import YagrComponent, {YagrChartProps, YagrReactRef} from '@gravity-ui/yagr/react';
import isEmpty from 'lodash/isEmpty';

import {i18n} from '../../../i18n';
import {CHARTKIT_ERROR_CODE, ChartKitError} from '../../../libs';
import type {ChartKitWidgetRef} from '../../../types';
import {Yagr, YagrWidgetProps} from '../types';

import './polyfills';
import {useWidgetData} from './useWidgetData';
import {checkFocus, detectClickOutside, synchronizeTooltipTablesCellsWidth} from './utils';

import '@gravity-ui/yagr/dist/index.css';
// We need to save order in such state
// eslint-disable-next-line import/order
import './YagrWidget.scss';

const YagrWidget = React.forwardRef<ChartKitWidgetRef | undefined, YagrWidgetProps>(
    function YagrWidget(props, forwardedRef) {
        const {
            id,
            data: {data},
            onLoad,
            onRender,
            onChartLoad,
            tooltip,
        } = props;

        const yagrRef = React.useRef<YagrReactRef>(null);
        const [yagr, setYagr] = React.useState<Yagr>();

        if (!data || isEmpty(data)) {
            throw new ChartKitError({
                code: CHARTKIT_ERROR_CODE.NO_DATA,
                message: i18n('error', 'label_no-data'),
            });
        }

        const {config, debug} = useWidgetData(props, id);

        const handleChartLoading: NonNullable<YagrChartProps['onChartLoad']> = React.useCallback(
            (chart, {renderTime}) => {
                onLoad?.({...data, widget: chart, widgetRendering: renderTime});
                onRender?.({renderTime});
                setYagr(chart);
            },
            [onLoad, onRender, data, setYagr],
        );

        const onWindowResize = React.useCallback(() => {
            if (yagr) {
                yagr.reflow();
            }
        }, []);

        React.useImperativeHandle(
            forwardedRef,
            () => ({
                reflow() {
                    onWindowResize();
                },
            }),
            [onWindowResize],
        );

        React.useEffect(() => {
            if (!yagr || yagr.config?.tooltip?.virtual) {
                return;
            }

            const handlers: Record<string, null | ((event: MouseEvent) => void)> = {
                mouseMove: null,
                mouseDown: null,
            };

            yagr.plugins.tooltip?.on('render', (tooltip) => {
                synchronizeTooltipTablesCellsWidth(tooltip);
            });

            yagr.plugins.tooltip?.on('pin', (tooltip, {actions}) => {
                handlers.mouseMove = checkFocus({tooltip, yagr});
                handlers.mouseDown = detectClickOutside({tooltip, actions, yagr});
                document.addEventListener('mousemove', handlers.mouseMove);
                document.addEventListener('mousedown', handlers.mouseDown);
            });

            yagr.plugins.tooltip?.on('unpin', () => {
                if (handlers.mouseMove) {
                    document.removeEventListener('mousemove', handlers.mouseMove);
                    handlers.mouseMove = null;
                }

                if (handlers.mouseDown) {
                    document.removeEventListener('mousedown', handlers.mouseDown);
                    handlers.mouseDown = null;
                }
            });
        }, [yagr]);

        React.useLayoutEffect(() => {
            onChartLoad?.({widget: yagr});
        }, [yagr, onChartLoad]);

        return (
            <React.Fragment>
                {tooltip &&
                    yagr &&
                    tooltip({
                        yagr,
                    })}
                <YagrComponent
                    ref={yagrRef}
                    id={id}
                    config={config}
                    debug={debug}
                    onChartLoad={handleChartLoading}
                />
            </React.Fragment>
        );
    },
);

export default YagrWidget;

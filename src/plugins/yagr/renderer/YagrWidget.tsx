import React from 'react';
import isEmpty from 'lodash/isEmpty';
import YagrComponent, {YagrChartProps, YagrReactRef} from '@gravity-ui/yagr/dist/react';

import {i18n} from '../../../i18n';
import type {ChartKitWidgetRef} from '../../../types';
import {CHARTKIT_ERROR_CODE, ChartKitError} from '../../../libs';
import {useWidgetData} from './useWidgetData';
import {checkFocus, detectClickOutside, synchronizeTooltipTablesCellsWidth} from './utils';
import {Yagr, YagrWidgetProps} from '../types';

import './polyfills';

import '@gravity-ui/yagr/dist/index.css';
import './YagrWidget.scss';

const YagrWidget = React.forwardRef<ChartKitWidgetRef | undefined, YagrWidgetProps>(
    (props, forwardedRef) => {
        const {
            id,
            data: {data},
            onLoad,
            onRender,
            onChartLoad,
            CustomTooltip,
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
                if (!yagr) {
                    setYagr(chart);
                }
            },
            [onLoad, onRender, data, setYagr, yagr],
        );

        const onWindowResize = React.useCallback(() => {
            if (yagrRef.current) {
                const chart = yagrRef.current.yagr();

                if (!chart) {
                    return;
                }

                chart.reflow();
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
            onChartLoad?.({widget: yagrRef.current?.yagr()});
        }, [yagrRef, onChartLoad]);

        return (
            <React.Fragment>
                {CustomTooltip && yagr && <CustomTooltip yagr={yagr} />}
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

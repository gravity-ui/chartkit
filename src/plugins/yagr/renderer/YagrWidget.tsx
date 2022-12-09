import React from 'react';
import isEmpty from 'lodash/isEmpty';
import YagrComponent, {YagrChartProps} from '@gravity-ui/yagr/dist/react';
import {i18n} from '../../../i18n';
import type {ChartKitWidgetRef, ChartKitProps} from '../../../types';
import {CHARTKIT_ERROR_CODE, ChartKitError} from '../../../libs';
import {useWidgetData} from './useWidgetData';
import {checkFocus, detectClickOutside, synchronizeTooltipTablesCellsWidth} from './utils';

import './polyfills';

import './YagrWidget.scss';

type Props = ChartKitProps<'yagr'> & {id: string};

const YagrWidget = React.forwardRef<ChartKitWidgetRef | undefined, Props>((props, forwardedRef) => {
    const {
        id,
        data: {data},
        onLoad,
    } = props;
    const yagrRef = React.useRef<YagrComponent>(null);

    if (!data || isEmpty(data)) {
        throw new ChartKitError({
            code: CHARTKIT_ERROR_CODE.NO_DATA,
            message: i18n('error', 'label_no-data'),
        });
    }

    const {config, debug} = useWidgetData({...props.data, id});

    const handleChartLoading: NonNullable<YagrChartProps['onChartLoad']> = React.useCallback(
        (chart, {renderTime}) => {
            onLoad?.({...data, widget: chart, widgetRendering: renderTime});
        },
        [onLoad, data],
    );

    const onWindowResize = React.useCallback(() => {
        if (yagrRef.current?.chart) {
            const chart = yagrRef.current.chart;
            const root = chart.root;
            const height = root.offsetHeight;
            const width = root.offsetWidth;
            chart.uplot.setSize({width, height});
            chart.uplot.redraw();
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

    React.useLayoutEffect(() => {
        const yagr = yagrRef.current?.chart;

        if (!yagr) {
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
    });

    return (
        <YagrComponent
            ref={yagrRef}
            id={id}
            config={config}
            debug={debug}
            onChartLoad={handleChartLoading}
        />
    );
});

export default YagrWidget;

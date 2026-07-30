import {ChartKit} from './components/ChartKit';
import {settings} from './libs';

export * from './libs/chartkit-error/chartkit-error';
export {SplitTooltip} from './components/SplitTooltip';
export type {
    SplitTooltipLayout,
    SplitTooltipProps,
    SplitTooltipRenderProps,
} from './components/SplitTooltip';

export type {
    ChartKitLang,
    ChartKitOnLoadData,
    ChartKitOnRenderData,
    ChartKitOnChartLoad,
    ChartKitOnError,
    ChartKitPlugin,
    ChartKitProps,
    ChartKitRef,
    ChartKitWidgetRef,
    ChartKitType,
    ChartKitWidget,
} from './types';

export {settings};

export default ChartKit;

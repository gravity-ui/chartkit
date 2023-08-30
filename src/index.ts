import {ChartKit} from './components/ChartKit';
import {settings} from './libs';

export * from './types/widget-data';
export * from './libs/chartkit-error/chartkit-error';

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

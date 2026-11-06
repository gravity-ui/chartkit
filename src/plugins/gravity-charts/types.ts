import type {ChartData} from '@gravity-ui/charts';

export type * from '@gravity-ui/charts';
export type {
    ChartDataV1,
    MigrationV1Result,
    MigrationV1Warning,
} from '@gravity-ui/charts/migration/v1';

export type GravityChartsWidgetData = {
    data: ChartData;
};

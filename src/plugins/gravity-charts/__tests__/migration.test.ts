import type {ChartDataV1} from '../index';
import {inspectChartDataV1, migrateChartDataV1} from '../index';

const legacyData: ChartDataV1 = {
    yAxis: [{ticks: {pixelInterval: 60}}],
    series: {data: [{type: 'line', name: 'Revenue', data: [{x: 1, y: 1}]}]},
};

describe('gravity-charts migration re-exports', () => {
    it('exposes the charts v1 adapter', () => {
        const {data, warnings} = migrateChartDataV1(legacyData);

        expect(data.yAxis?.[0].ticks).toEqual({interval: 60});
        expect(warnings.map((warning) => warning.code)).toEqual(['axis-pixel-interval']);
    });

    it('exposes the charts v1 inspector', () => {
        expect(inspectChartDataV1(legacyData).map((warning) => warning.path)).toEqual([
            ['yAxis', 0, 'ticks', 'pixelInterval'],
        ]);
    });
});

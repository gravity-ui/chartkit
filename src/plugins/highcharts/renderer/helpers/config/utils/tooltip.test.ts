import {HighchartsType} from '../../constants';
import {checkTooltipPinningAvailability, isTooltipShared} from './tooltip';

const chartTypes: [HighchartsType, boolean][] = [
    [HighchartsType.Sankey, false],
    [HighchartsType.Xrange, false],
    [HighchartsType.Line, true],
    [HighchartsType.Area, true],
    [HighchartsType.Arearange, true],
    [HighchartsType.Bar, true],
    [HighchartsType.Column, true],
    [HighchartsType.Columnrange, true],
    [HighchartsType.Funnel, true],
    [HighchartsType.Pie, true],
    [HighchartsType.Map, true],
    [HighchartsType.Scatter, true],
    [HighchartsType.Bubble, true],
    [HighchartsType.Heatmap, true],
    [HighchartsType.Treemap, true],
    [HighchartsType.Networkgraph, true],
    [HighchartsType.Variwide, true],
    [HighchartsType.Waterfall, true],
    [HighchartsType.Streamgraph, true],
    [HighchartsType.Wordcloud, true],
    [HighchartsType.Boxplot, true],
    [HighchartsType.Timeline, true],
];

describe('plugins/highcharts/config', () => {
    test.each(chartTypes)(`calculatePrecision for %s return %s`, (chartType, expected) => {
        expect(isTooltipShared(chartType)).toBe(expected);
    });

    test.each([
        [undefined, true],
        [{tooltip: {pin: {altKey: true}}, altKey: true}, true],
        [{tooltip: {pin: {metaKey: true}}, metaKey: true}, true],
        [{tooltip: {pin: {altKey: true, metaKey: true}}, altKey: true, metaKey: true}, true],
        [{tooltip: {pin: {enabled: false}}}, false],
        [{tooltip: {pin: {altKey: true}}, altKey: false}, false],
        [{tooltip: {pin: {metaKey: true}}, metaKey: false}, false],
        [{tooltip: {pin: {altKey: true, metaKey: true}}, altKey: false, metaKey: true}, false],
        [{tooltip: {pin: {altKey: true, metaKey: true}}, altKey: true, metaKey: false}, false],
    ])(`checkTooltipPinningAvailability (args: %j)`, (args, expected) => {
        const result = checkTooltipPinningAvailability(args);
        expect(result).toBe(expected);
    });
});

import {NavigatorLinesMode} from '../../constants';
import {addShowInNavigatorToSeries} from './addShowInNavigatorToSeries';

describe('plugins/highcharts/config/addShowInNavigatorToSeries', () => {
    let MOCKED_SERIES: Record<string, any>[];
    let MOCKED_PARAMS: Record<string, any>;

    beforeEach(() => {
        MOCKED_SERIES = [{name: 'Test1'}, {name: 'Test2'}, {name: 'Test3'}];
        MOCKED_PARAMS = {navigator: {}};
    });

    it("should set {showInNavigator: true} to all series in case of {linesMode: 'all'}", () => {
        const linesMode = NavigatorLinesMode.All;

        addShowInNavigatorToSeries({
            linesMode,
            graphs: MOCKED_SERIES,
            params: MOCKED_PARAMS,
            selectedLines: [],
            baseSeriesName: '',
        });

        const expectedResult = [
            {name: 'Test1', showInNavigator: true},
            {name: 'Test2', showInNavigator: true},
            {name: 'Test3', showInNavigator: true},
        ];

        expect(MOCKED_SERIES).toEqual(expectedResult);
    });

    it("should set {showInNavigator: false} to all series in case of {linesMode: 'selected'} and add min & max to params.navigator.xAxis", () => {
        const linesMode = NavigatorLinesMode.Selected;

        addShowInNavigatorToSeries({
            linesMode,
            graphs: MOCKED_SERIES,
            params: MOCKED_PARAMS,
            selectedLines: [],
            baseSeriesName: '',
        });

        const expectedSeries = [
            {name: 'Test1', showInNavigator: false},
            {name: 'Test2', showInNavigator: false},
            {name: 'Test3', showInNavigator: false},
        ];

        const expectedParams = {
            navigator: {
                xAxis: {
                    max: null,
                    min: null,
                },
            },
        };

        expect(MOCKED_SERIES).toEqual(expectedSeries);
        expect(MOCKED_PARAMS).toEqual(expectedParams);
    });

    it('should set {showInNavigator: true} in case of selectedLines contains series', () => {
        const linesMode = NavigatorLinesMode.Selected;

        addShowInNavigatorToSeries({
            linesMode,
            graphs: MOCKED_SERIES,
            params: MOCKED_PARAMS,
            selectedLines: ['Test3'],
            baseSeriesName: '',
        });

        const expectedSeries = [
            {name: 'Test1', showInNavigator: false},
            {name: 'Test2', showInNavigator: false},
            {name: 'Test3', showInNavigator: true},
        ];

        expect(MOCKED_SERIES).toEqual(expectedSeries);
    });

    it('should set {showInNavigator: true} in case of series equals to baseSeriesName', () => {
        const linesMode = NavigatorLinesMode.Selected;

        addShowInNavigatorToSeries({
            linesMode,
            graphs: MOCKED_SERIES,
            params: MOCKED_PARAMS,
            selectedLines: [],
            baseSeriesName: 'Test2',
        });

        const expectedSeries = [
            {name: 'Test1', showInNavigator: false},
            {name: 'Test2', showInNavigator: true},
            {name: 'Test3', showInNavigator: false},
        ];

        expect(MOCKED_SERIES).toEqual(expectedSeries);
    });

    it('should set {showInNavigator: true} in case of selectedLines and baseSeriesName', () => {
        const linesMode = NavigatorLinesMode.Selected;

        addShowInNavigatorToSeries({
            linesMode,
            graphs: MOCKED_SERIES,
            params: MOCKED_PARAMS,
            selectedLines: ['Test1'],
            baseSeriesName: 'Test2',
        });

        const expectedSeries = [
            {name: 'Test1', showInNavigator: true},
            {name: 'Test2', showInNavigator: true},
            {name: 'Test3', showInNavigator: false},
        ];

        expect(MOCKED_SERIES).toEqual(expectedSeries);
    });
});

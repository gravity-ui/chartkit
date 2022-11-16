import {buildNavigatorFallback} from './buildNavigatorFallback';

const MOCKED_GRAPHS = [{name: 'Test'}, {name: 'Test1'}, {name: 'Test2'}];
const baseSeriesName = 'Test2';
const missedSeriesName = 'Test3';

describe('plugins/highcharts/config/buildNavigatorFallback', () => {
    it('should set {showInNavigator: true} to current series in case of initialized baseSeriesName', () => {
        const expectedResult = [
            {name: 'Test', showInNavigator: false},
            {name: 'Test1', showInNavigator: false},
            {name: 'Test2', showInNavigator: true},
        ];
        buildNavigatorFallback(MOCKED_GRAPHS, baseSeriesName);

        expect(MOCKED_GRAPHS).toEqual(expectedResult);
    });

    it('should set {showInNavigator: true} to all series in case of baseSeriesName are not initialized', () => {
        const expectedResult = [
            {name: 'Test', showInNavigator: true},
            {name: 'Test1', showInNavigator: true},
            {name: 'Test2', showInNavigator: true},
        ];

        buildNavigatorFallback(MOCKED_GRAPHS);

        expect(MOCKED_GRAPHS).toEqual(expectedResult);
    });

    it('should not set {showInNavigator: true} to current series in case of baseSeriesName are not finded in graphs', () => {
        buildNavigatorFallback(MOCKED_GRAPHS, missedSeriesName);

        expect(MOCKED_GRAPHS).toEqual(MOCKED_GRAPHS);
    });
});

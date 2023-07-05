import Highcharts from 'highcharts';
import highchartsMore from 'highcharts/highcharts-more';
import ema from 'highcharts/indicators/ema';
import indicators from 'highcharts/indicators/indicators';
import annotations from 'highcharts/modules/annotations';
import bullet from 'highcharts/modules/bullet';
import drilldown from 'highcharts/modules/drilldown';
import funnel from 'highcharts/modules/funnel';
import heatmap from 'highcharts/modules/heatmap';
import histogramBellcurve from 'highcharts/modules/histogram-bellcurve';
import networkgraph from 'highcharts/modules/networkgraph';
import parallelCoordinates from 'highcharts/modules/parallel-coordinates';
import patternFill from 'highcharts/modules/pattern-fill';
import sankey from 'highcharts/modules/sankey';
import seriesLabel from 'highcharts/modules/series-label';
import solidGauge from 'highcharts/modules/solid-gauge';
import stock from 'highcharts/modules/stock';
import streamgraph from 'highcharts/modules/streamgraph';
import timeline from 'highcharts/modules/timeline';
import treemap from 'highcharts/modules/treemap';
import variwide from 'highcharts/modules/variwide';
import venn from 'highcharts/modules/venn';
import wordcloud from 'highcharts/modules/wordcloud';
import xrange from 'highcharts/modules/xrange';

export function initHighchartsModules() {
    highchartsMore(Highcharts);

    stock(Highcharts);

    solidGauge(Highcharts);
    funnel(Highcharts);
    histogramBellcurve(Highcharts);
    sankey(Highcharts);
    heatmap(Highcharts);
    treemap(Highcharts);
    variwide(Highcharts);
    streamgraph(Highcharts);
    drilldown(Highcharts);

    annotations(Highcharts);
    seriesLabel(Highcharts);
    parallelCoordinates(Highcharts);
    patternFill(Highcharts);
    wordcloud(Highcharts);
    xrange(Highcharts);
    networkgraph(Highcharts);
    timeline(Highcharts);
    bullet(Highcharts);
    venn(Highcharts);

    indicators(Highcharts);
    ema(Highcharts);
}

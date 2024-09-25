/* eslint-disable complexity */

import Highcharts from 'highcharts';
import get from 'lodash/get';

import {i18n} from '../../../../../i18n';
import {
    getTooltipPositioner,
    handleScroll,
    hideFixedTooltip,
    synchronizeTooltipTablesCellsWidth,
} from '../config/config';
import {
    TOOLTIP_CONTAINER_CLASS_NAME,
    TOOLTIP_FOOTER_CLASS_NAME,
    TOOLTIP_LIST_CLASS_NAME,
    TOOLTIP_ROW_CLASS_NAME,
    TOOLTIP_ROW_NAME_CLASS_NANE,
} from '../tooltip';

import colors from './colors';
import {calculateClosestPointManually} from './utils';

function formatQ(timestamp) {
    const date = new Date(timestamp);
    const month = date.getUTCMonth() + 1;
    return 'Q' + Math.ceil(month / 3);
}

const REST_SECTION_HEIGHT = 25;

Highcharts.dateFormats = {
    Q: formatQ,
    q: formatQ,
    quarter: formatQ,
};

Math.easeInQuint = function (pos) {
    return Math.pow(pos, 5);
};

Highcharts.setOptions({
    colors: colors,
    credits: {
        enabled: false,
    },
    chart: {
        animation: false,
        displayErrors: false,
        resetZoomButton: {
            relativeTo: 'chart',
            theme: {
                r: 6,
                width: 12,
                height: 12,
                'text-align': 'center',
                opacity: '0.8',
                cursor: 'pointer',
                style: {
                    fontSize: '20px',
                },
            },
            position: {
                y: 30,
            },
        },
    },
    title: {
        text: '',
        style: {
            fontSize: '15px',
            fontWeight: 'bold',
        },
    },
    legend: {
        enabled: true,
        itemStyle: {
            fontWeight: 'normal',
        },
        navigation: {
            animation: false,
        },
    },
    tooltip: {
        borderRadius: '0px',
        borderWidth: 0,
        useHTML: true,
        hideDelay: 0,
        animation: false,
        shadow: false,
    },
    xAxis: {
        gridLineColor: '#dbdbdb',
        gridLineWidth: 1,
        lineColor: '#dbdbdb',
    },
    yAxis: {
        title: {
            text: null,
        },
    },
    plotOptions: {
        series: {
            animation: false,
            shadow: false,
            connectNulls: false,
            dataGrouping: {
                enabled: false,
            },
            states: {
                normal: {
                    animation: false,
                },
                hover: {
                    animation: false,
                },
                inactive: {
                    animation: false,
                    opacity: 0.7,
                },
            },
            marker: {
                states: {
                    hover: {
                        animation: false,
                    },
                    normal: {
                        animation: false,
                    },
                },
            },
        },
    },
});

function initHighchartsLangOptions() {
    Highcharts.setOptions({
        lang: {
            resetZoom: '⟲',
            resetZoomTitle: i18n('highcharts', 'reset-zoom-title'),
            months: [
                i18n('highcharts', 'January'),
                i18n('highcharts', 'February'),
                i18n('highcharts', 'March'),
                i18n('highcharts', 'April'),
                i18n('highcharts', 'May'),
                i18n('highcharts', 'June'),
                i18n('highcharts', 'July'),
                i18n('highcharts', 'August'),
                i18n('highcharts', 'September'),
                i18n('highcharts', 'October'),
                i18n('highcharts', 'November'),
                i18n('highcharts', 'December'),
            ],
            shortMonths: [
                i18n('highcharts', 'Jan'),
                i18n('highcharts', 'Feb'),
                i18n('highcharts', 'Mar'),
                i18n('highcharts', 'Apr'),
                i18n('highcharts', 'May'),
                i18n('highcharts', 'Jun'),
                i18n('highcharts', 'Jul'),
                i18n('highcharts', 'Aug'),
                i18n('highcharts', 'Sep'),
                i18n('highcharts', 'Oct'),
                i18n('highcharts', 'Nov'),
                i18n('highcharts', 'Dec'),
            ],
            weekdays: [
                i18n('highcharts', 'Sun'),
                i18n('highcharts', 'Mon'),
                i18n('highcharts', 'Tue'),
                i18n('highcharts', 'Wed'),
                i18n('highcharts', 'Thu'),
                i18n('highcharts', 'Fri'),
                i18n('highcharts', 'Sat'),
            ],

            decimalPoint: i18n('highcharts', 'decimal-point'),
            thousandsSep: i18n('highcharts', 'thousands-sep'),

            numericSymbols: ['K', 'M', 'B', 'T', 'P', 'E'],
        },
    });
}

function initHighcharts({isMobile}) {
    initHighchartsLangOptions();

    // https://github.com/highcharts/highcharts/issues/11494
    (function (H) {
        H.wrap(H.Tooltip.prototype, 'getLabel', function (proceed, ...rest) {
            const t = proceed.apply(this, rest);

            if (this.container) {
                H.css(this.container, {
                    zIndex: 100001,
                });
            }

            return t;
        });
    })(Highcharts);

    Highcharts.wrap(Highcharts.Chart.prototype, 'redraw', function (proceed, ...rest) {
        if (this.tooltip.fixed) {
            hideFixedTooltip(this.tooltip, isMobile);
        }

        proceed.apply(this, rest);

        if (this.afterRedrawCallback) {
            this.afterRedrawCallback();
            delete this.afterRedrawCallback;
        }
    });

    Highcharts.wrap(Highcharts.Chart.prototype, 'destroy', function (proceed, ...rest) {
        if (this.tooltip.clickOutsideHandler) {
            window.document.removeEventListener('click', this.tooltip.clickOutsideHandler);
        }

        if (this.tooltip.fixed) {
            hideFixedTooltip(this.tooltip, isMobile);
        }

        proceed.apply(this, ...rest);
    });

    Highcharts.wrap(Highcharts.Point.prototype, 'setState', function (proceed, ...rest) {
        if (!this.series.chart.tooltip.fixed) {
            proceed.apply(this, rest);
        }
    });

    Highcharts.wrap(Highcharts.Tooltip.prototype, 'init', function (proceed, ...rest) {
        this.orientationChangeHandler = () => {
            if (isMobile) {
                const resizeHandler = () => {
                    this.update({
                        positioner: getTooltipPositioner(isMobile),
                    });

                    if (this.chart.hoverPoints) {
                        this.chart.hoverPoints.forEach((point) => {
                            point.setState('');
                        });

                        delete this.chart.hoverPoints;
                    }

                    if (this.chart.hoverPoint) {
                        this.chart.hoverPoint.setState('');
                        delete this.chart.hoverPoint;
                    }

                    window.removeEventListener('resize', resizeHandler);
                };

                window.addEventListener('resize', resizeHandler);
            }
        };

        window.addEventListener('orientationchange', this.orientationChangeHandler);

        proceed.apply(this, rest);
    });

    Highcharts.wrap(Highcharts.Tooltip.prototype, 'destroy', function (proceed, ...rest) {
        window.removeEventListener('orientationchange', this.orientationChangeHandler);
        window.removeEventListener('scroll', this.scrollHandler);

        proceed.apply(this, rest);
    });

    Highcharts.wrap(Highcharts.Tooltip.prototype, 'hide', function (proceed, ...rest) {
        if (this.lastVisibleRowIndex) {
            this.lastVisibleRowIndex = undefined;
        }

        if (this.scrollHandler && !this.fixed) {
            window.removeEventListener('scroll', this.scrollHandler);
            this.scrollHandler = null;
            this.chart.topPosition = null;
        }

        if (!this.fixed) {
            proceed.apply(this, rest);
        }
    });

    Highcharts.wrap(Highcharts.Tooltip.prototype, 'hideFixedTooltip', function () {
        if (this.fixed) {
            hideFixedTooltip(this, isMobile);
        }
    });

    Highcharts.wrap(Highcharts.Tooltip.prototype, 'refresh', function (proceed, points, ...rest) {
        const isNonBodyScroll = get(this.chart, 'userOptions._config.nonBodyScroll');
        const maxTooltipLines = get(this.chart, 'userOptions._config.maxTooltipLines');
        const chartType = this.chart.options.chart.type;

        if (isNonBodyScroll && !this.scrollHandler) {
            this.scrollHandler = handleScroll.bind(this);

            this.chart.topPosition = this.chart.container.getBoundingClientRect().top;
            window.addEventListener('scroll', this.scrollHandler, true);
        }

        if (this.chart.pointsForInitialRefresh) {
            delete this.chart.pointsForInitialRefresh;
        }

        if (chartType === 'map' && !this.fixed) {
            proceed.apply(this, [points, ...rest]);
        }

        const isFixation = rest[1];

        if ((!this.fixed || isFixation) && points) {
            if (isFixation) {
                this.lastVisibleRowIndex = undefined;
            }

            proceed.apply(this, [points, ...rest]);

            if (chartType === 'timeline') {
                return false;
            }

            if (this.container) {
                synchronizeTooltipTablesCellsWidth(this.container, isMobile);
            }

            if (isFixation) {
                const rowNames = this.container.querySelectorAll(`.${TOOLTIP_ROW_NAME_CLASS_NANE}`);

                for (let i = 0; i < rowNames.length; i++) {
                    const rowNameNode = rowNames[i];

                    if (rowNameNode.scrollWidth > rowNameNode.clientWidth) {
                        const rowNameNodeText = rowNameNode.innerText;
                        rowNameNode.setAttribute('title', rowNameNodeText);
                    }
                }

                return false;
            }
        }

        if (this.container && !this.fixed && !this.lastVisibleRowIndex) {
            const tooltipNode = this.container.querySelector(`.${TOOLTIP_CONTAINER_CLASS_NAME}`);

            if (!tooltipNode) {
                return false;
            }

            const hasScroll = tooltipNode.scrollHeight > tooltipNode.clientHeight;
            const moreThanMaxLines = maxTooltipLines && points.length > maxTooltipLines;

            if (hasScroll || moreThanMaxLines) {
                const footerNode = tooltipNode.querySelector(`.${TOOLTIP_FOOTER_CLASS_NAME}`);
                const {top, height} = tooltipNode.getBoundingClientRect();

                const footerNodeHeight = footerNode ? footerNode.clientHeight : 0;

                const bottomPadding = parseFloat(
                    window.getComputedStyle(tooltipNode, null).getPropertyValue('padding-bottom'),
                    10,
                );

                const containerBottomEdge = top + height;
                const rows = tooltipNode.querySelectorAll(
                    `.${TOOLTIP_LIST_CLASS_NAME} .${TOOLTIP_ROW_CLASS_NAME}`,
                );

                let lastVisibleRowIndex;

                const selectedSeriesIndex = this.chart.hoverPoints.indexOf(this.chart.hoverPoint);

                const rowForSelectedSeriesHeight =
                    selectedSeriesIndex >= 0
                        ? rows[selectedSeriesIndex].getBoundingClientRect().height
                        : 0;

                if (maxTooltipLines && rows.length > maxTooltipLines) {
                    lastVisibleRowIndex = maxTooltipLines - 1;
                } else {
                    for (let i = rows.length - 1; i > 0; i--) {
                        const row = rows[i];
                        const {top: rowTop, height: rowHeight} = row.getBoundingClientRect();
                        const rowBottomEdge = rowTop + rowHeight;
                        const containerBottomEdgeWithPadding = containerBottomEdge - bottomPadding;
                        const margin =
                            REST_SECTION_HEIGHT + footerNodeHeight + rowForSelectedSeriesHeight;
                        const rowBottomEdgeWithMargin = rowBottomEdge + margin;

                        if (rowBottomEdgeWithMargin <= containerBottomEdgeWithPadding) {
                            lastVisibleRowIndex = i;

                            break;
                        }
                    }
                }

                if (lastVisibleRowIndex) {
                    this.lastVisibleRowIndex = lastVisibleRowIndex;

                    this.refresh(points, ...rest);
                }
            }
        }
    });

    Highcharts.wrap(Highcharts.Axis.prototype, 'getClosest', function (proceed, ...rest) {
        const userOptions = this.userOptions || {};
        if (userOptions.calcClosestPointManually) {
            return calculateClosestPointManually.apply(this);
        } else {
            return proceed.apply(this, rest);
        }
    });
}

function initHighchartsMap() {
    Highcharts.wrap(Highcharts.ColorAxis.prototype, 'drawCrosshair', function (proceed, ...rest) {
        if (!this.chart.tooltip.fixed) {
            proceed.apply(this, rest);
        }
    });

    Highcharts.wrap(Highcharts.ColorAxis.prototype, 'hideCrosshair', function (proceed, ...rest) {
        if (!this.chart.tooltip.fixed) {
            proceed.apply(this, rest);
        }
    });
}

export {initHighcharts, initHighchartsMap, initHighchartsLangOptions};

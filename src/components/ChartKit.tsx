import React from 'react';
import moment from 'moment';
import {YagrWidget} from './components/YagrWidget/YagrWidget';
import {ErrorComponent} from './components/ErrorComponent/ErrorComponent';
import './ChartKit.scss';
import {ChartKitProps, OnLoadData} from '../types';

function init(lang = 'ru') {
    moment.updateLocale(lang, {week: {dow: 1, doy: 7}});
    moment.locale(lang);
}

export class ChartKit extends React.Component<ChartKitProps> {
    isInit = false;

    constructor(props: ChartKitProps) {
        super(props);

        if (!this.isInit) {
            init(this.props.lang);
            this.isInit = true;
        }
    }

    onLoad = ({widget = null, widgetRendering = null}: OnLoadData = {}) => {
        if (this.props.onLoad) {
            this.props.onLoad({
                widget,
                widgetRendering,
            });
        }
    };

    render() {
        if (this.props.type !== 'yagr') {
            return <ErrorComponent lang={this.props.lang} />;
        }

        return (
            <div className={'chartkit chartkit-theme'}>
                <YagrWidget
                    id={this.props.id}
                    lang={this.props.lang}
                    data={this.props.data}
                    onLoad={this.onLoad}
                />
            </div>
        );
    }
}

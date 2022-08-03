# @yandex-cloud/chartkit &middot; [![license](https://img.shields.io/badge/license-MIT-brightgreen.svg)](LICENSE) [![npm package](https://img.shields.io/npm/v/@yandex-cloud/chartkit)](https://www.npmjs.com/package/@yandex-cloud/chartkit)

React component used to render charts based on any sources you need

## Install

```shell
npm i --save-dev @yandex-cloud/chartkit @yandex-cloud/uikit @yandex-cloud/i18n
```

## Usage

```typescript
import {ThemeProvider} from '@yandex-cloud/uikit';
import ChartKit, {settings} from '@yandex-cloud/chartkit';
import {YagrPlugin, YagrWidgetData} from '@yandex-cloud/chartkit/build/plugins';

settings.set({plugins: [YagrPlugin]});

const data: YagrWidgetData = {
  data: {
    timeline: [
      1636838612441, 1636925012441, 1637011412441, 1637097812441, 1637184212441, 1637270612441,
      1637357012441, 1637443412441, 1637529812441, 1637616212441,
    ],
    graphs: [
      {
        id: '0',
        name: 'Serie 1',
        color: '#6c59c2',
        visible: true,
        data: [25, 52, 89, 72, 39, 49, 82, 59, 36, 5],
      },
      {
        id: '1',
        name: 'Serie 2',
        color: '#6e8188',
        visible: true,
        data: [37, 6, 51, 10, 65, 35, 72, 0, 94, 54],
      },
    ],
  },
  libraryConfig: {
    chart: {
      type: 'line',
    },
    title: {
      text: 'line: random 10 pts',
    },
  },
};

function App() {
  return (
    <ThemeProvider>
      <div className="app" style={{height: 500}}>
        <ChartKit type="yagr" data={data} />
      </div>
    </ThemeProvider>
  );
}

export default App;
```

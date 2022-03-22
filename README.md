# @yandex-cloud/ChartKit

Library for rendering Yandex Charts scripts

## Install

```bash
npm i @yandex-cloud/chartkit
```

## Mock data

`./mocks/line10.js`

## Usage

```jsx
import ChartKit, {ThemeProvider} from '@yandex-cloud/chartkit';
import {ThemeProvider} from '@yandex-cloud/uikit';

<ThemeProvider>
  <ChartKit id="1" type="yagr" data={data} lang="ru" />
</ThemeProvider>;
```

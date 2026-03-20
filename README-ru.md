# Gravity UI ChartKit · [![npm package](https://img.shields.io/npm/v/@gravity-ui/chartkit)](https://www.npmjs.com/package/@gravity-ui/chartkit) [![License](https://img.shields.io/github/license/gravity-ui/ChartKit)](LICENSE) [![CI](https://img.shields.io/github/actions/workflow/status/gravity-ui/ChartKit/.github/workflows/ci.yml?label=CI&logo=github)](https://github.com/gravity-ui/ChartKit/actions/workflows/ci.yml?query=branch:main) [![storybook](https://img.shields.io/badge/Storybook-deployed-ff4685)](https://preview.gravity-ui.com/chartkit/)

React-компонент с плагинной архитектурой и единым интерфейсом рендеринга для нескольких библиотек графиков. Зарегистрируйте плагины и рендерите графики через `<ChartKit type="..." data={...} />` — ChartKit сам направляет вызов нужному рендереру.

Каждый рендерер плагина подгружается лениво: код базовой библиотеки запрашивается только когда ChartKit впервые отображается в интерфейсе. Тултипы по умолчанию оптимизированы для мобильных устройств. Можно использовать встроенные плагины или написать свои.

**Когда подходит:**

- Нужны современные декларативные графики (`gravity-charts`) или временные ряды / мониторинг (`yagr`)
- Нужны разные типы графиков под одним согласованным API
- Вы строите продукт в экосистеме Gravity UI

**Когда лучше не использовать:**

- Нужна только одна конкретная библиотека графиков — лучше подключить [@gravity-ui/charts](https://github.com/gravity-ui/charts) напрямую

## Содержание

- [С чего начать](#get-started)
- [Разработка](#development)

<h2 id="get-started">С чего начать</h2>

### Требования

- React 16, 17 или 18
- [@gravity-ui/uikit](https://github.com/gravity-ui/uikit) — обязательная peer-зависимость (темизация и UI-примитивы)

### Установка

```shell
npm install @gravity-ui/chartkit @gravity-ui/uikit
```

### Стили

Подключите стили `@gravity-ui/uikit` в точке входа приложения:

```tsx
import '@gravity-ui/uikit/styles/fonts.css';
import '@gravity-ui/uikit/styles/styles.css';
```

Подробнее о настройке стилей — в [руководстве по стилям uikit](https://github.com/gravity-ui/uikit?tab=readme-ov-file#styles).

### Базовое использование

ChartKit использует глобальный реестр плагинов. Один раз при запуске приложения вызовите `settings.set` и передайте нужные плагины. При рендере `<ChartKit type="..." />` ChartKit ищет подходящий плагин — если плагин не найден, выбрасывается ошибка. Рендерер каждого плагина — компонент `React.lazy`, поэтому его код загружается только при появлении ChartKit в UI.

Можно зарегистрировать несколько плагинов за раз:

```ts
settings.set({plugins: [GravityChartsPlugin, YagrPlugin]});
```

Или вызывать `settings.set` несколько раз — список плагинов объединяется, а не заменяется целиком.

**Простой пример:**

```tsx
import {ThemeProvider} from '@gravity-ui/uikit';
import ChartKit, {settings} from '@gravity-ui/chartkit';
import {GravityChartsPlugin} from '@gravity-ui/chartkit/gravity-charts';

import '@gravity-ui/uikit/styles/fonts.css';
import '@gravity-ui/uikit/styles/styles.css';

settings.set({plugins: [GravityChartsPlugin]});

const data = {
  series: {
    data: [
      {
        type: 'line',
        name: 'Series',
        data: [
          {x: 0, y: 10},
          {x: 1, y: 25},
          {x: 2, y: 18},
          {x: 3, y: 30},
        ],
      },
    ],
  },
};

export default function App() {
  return (
    <ThemeProvider theme="light">
      <div style={{height: 300}}>
        <ChartKit type="gravity-charts" data={data} />
      </div>
    </ThemeProvider>
  );
}
```

`ChartKit` подстраивается под размер родителя — задайте контейнеру явную высоту.

<h2 id="development">Разработка</h2>

### Предварительные требования

- [Node.js](https://nodejs.org/) 22 (см. [.nvmrc](https://github.com/gravity-ui/ChartKit/blob/main/.nvmrc))
- [npm](https://www.npmjs.com/) 10 или новее

### Настройка

Клонируйте репозиторий и установите зависимости:

```shell
git clone https://github.com/gravity-ui/ChartKit.git
cd ChartKit
npm ci
```

### Запуск Storybook

```shell
npm run start
```

Storybook будет доступен по адресу `http://localhost:7007`.

### Разработка с локальной зависимостью

Чтобы править зависимость (например, `@gravity-ui/charts`) и сразу видеть изменения в Storybook без публикации в npm:

**1. Локальная ссылка на пакет**

```shell
# В локальной копии @gravity-ui/charts:
git clone https://github.com/gravity-ui/charts.git
cd charts
npm ci
# внесите изменения
npm run build
npm link

# В ChartKit:
npm link @gravity-ui/charts
```

**2. Настройка отслеживания локального пакета**

Создайте в корне ChartKit файл `.env.local` (он в `.gitignore`):

```shell
LOCAL_PKG=@gravity-ui/charts
```

Так Vite будет следить за этим пакетом в `node_modules` и не пребандлить его. После пересборки `@gravity-ui/charts` Storybook подхватит изменения с горячей перезагрузкой.

Для нескольких пакетов через запятую:

```shell
LOCAL_PKG=@gravity-ui/charts,@gravity-ui/uikit
```

**3. Запуск Storybook**

```shell
npm run start
```

**4. Вернуть обычный пакет**

Когда закончите:

1. Закомментируйте `LOCAL_PKG` в `.env.local`
2. Выполните в ChartKit `npm install` — симлинк заменится версией из реестра

```shell
# В ChartKit:
npm ci
```

### Запуск тестов

```shell
npm test
```

Визуальные регрессионные тесты запускаются в Docker для стабильных скриншотов в разных окружениях:

```shell
npm run test:docker
```

Чтобы обновить эталонные скриншоты после намеренных изменений UI:

```shell
npm run test:docker:update
```

### Участие в проекте

Перед отправкой pull request ознакомьтесь с [руководством для контрибьюторов](CONTRIBUTING.md).

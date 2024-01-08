---
sidebar_position: 4
---

import APITable from '@site/src/components/APITable';

# Runtime errors

## Why does ChartKit generate its own exceptions?

During the execution of the program, many different errors may occur, including due to incorrect settings or data that come to ChartKit. In order to make the debug of such problems more transparent, ChartKit throws exceptions itself when it realizes that the component will not be rendered and will break in the depths of its code or (even worse) will be rendered incorrectly.

The ChartKit exception is a wrapper over a native object [Error](https://developer.mozilla.org/ru/docs/Web/JavaScript/Reference/Global_Objects/Error), which adds the fields `code` and `isCustomError`.

:::info

All exceptions that occur inside the ChartKit component are caught in the internal `ErrorBoundary`.

:::

## Error codes

```mdx-code-block
<APITable>
```

| Код                     | Описание                                                                                                 |
| ----------------------- | -------------------------------------------------------------------------------------------------------- |
| `ERR.CK.NO_DATA`        | No data available.                                                                                       |
| `ERR.CK.INVALID_DATA`   | Incorrect settings or data. With this error code, as a rule, there is a description of the problem area. |
| `ERR.CK.UNKNOWN_PLUGIN` | Invalid `type'. As a rule, it occurs due to the fact that the plugin has not been registered.            |
| `ERR.CK.UNKNOWN_ERROR`  | Unknown error.                                                                                           |

```mdx-code-block
</APITable>
```

## Working with errors

### `onError` callback

Called when an error occurs within the ChartKit component, which has risen to an internal `ErrorBoundary`.

:::tip

This method, for example, can be used to show information that there is no data for the chart and draw instructions on how to get this data.

:::

Usage example:

```tsx
import {isChartKitError} from "@gravity-ui/chartkit";

...

<ChartKit
  type="d3"
  data={data}
  onError={({error}) => {
    if (isChartKitError(error)) {
        // This is where the type is narrowed down to ChartKitError,
        // so typescript will allow you to access error.code
    }
  }}
/>
```

### `renderError` method

It is used to render a custom error component. The error text is displayed by default.

Usage example:

```tsx
...

<ChartKit
  type="d3"
  data={data}
  renderError={({message, resetError}) => {
    const handleRetry = () => {
        // Application-side business logic that will help collect data in a new way
        ...
        // Resetting an error in the ChartKit component
        resetError();
    };
    return (
        <div>
            <div>{message}</div>
            <button onClick={handleRetry}></button>
        </div>
    );
  }}
/>
```

### Custom generation of the `ChartKitError` error

You can also throw a `ChartKitError` in your code, specifying the desired code and message. This can be useful when writing your own plugin.

Usage example:

```ts
import {ChartKitError, CHARTKIT_ERROR_CODE} from '@gravity-ui/chartkit';

...

throw new ChartKitError({
    // You can use any string here
    code: CHARTKIT_ERROR_CODE.INVALID_DATA,
    message: 'Invalid data',
});
```

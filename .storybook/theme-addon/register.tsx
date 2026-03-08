import * as React from 'react';

import {getThemeType} from '@gravity-ui/uikit';
import {FORCE_RE_RENDER} from 'storybook/internal/core-events';
import {API, addons, types, useGlobals} from 'storybook/manager-api';

import {themes} from '../theme';

const ADDON_ID = 'yc-theme-addon';
const TOOL_ID = `${ADDON_ID}tool`;

addons.register(ADDON_ID, (api) => {
    addons.add(TOOL_ID, {
        type: types.TOOL,
        title: 'Theme',
        render: () => {
            return React.createElement(Tool, {api});
        },
    });
});

function Tool({api}: {api: API}) {
    const [{theme}] = useGlobals();
    React.useEffect(() => {
        api.setOptions({theme: themes[getThemeType(theme)]});
        addons.getChannel().emit(FORCE_RE_RENDER);
    }, [theme, api]);
    return null;
}

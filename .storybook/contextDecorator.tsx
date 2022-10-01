import React from 'react';
import {Story as StoryType, StoryContext} from '@storybook/react';
import {ThemeProvider, MobileProvider, useTheme, useMobile} from '@gravity-ui/uikit';
import {settings} from '../src/libs';

export function withContext(Story: StoryType, context: StoryContext) {
    const [theme, setTheme] = useTheme();
    const [mobile, setMobile] = useMobile();
    const themeValue = context.globals.theme;
    const mobileValue = context.globals.platform === 'mobile';
    const lang = context.globals.lang;

    // storybook environment theme setting
    context.parameters.backgrounds.default = theme;
    context.globals.backgrounds = {
        value: theme === 'light' ? 'white' : 'black',
    };

    React.useEffect(() => {
        if (theme !== themeValue) {
            setTheme(themeValue);
        }
    }, [theme, themeValue, setTheme]);

    React.useEffect(() => {
        if (mobile !== mobileValue) {
            setMobile(mobileValue);
        }
    }, [mobile, mobileValue, setMobile]);

    React.useEffect(() => {
        settings.set({lang});
    }, [lang]);

    return (
        <ThemeProvider theme={themeValue}>
            <MobileProvider mobile={mobile}>
                <Story {...context} />
            </MobileProvider>
        </ThemeProvider>
    );
}

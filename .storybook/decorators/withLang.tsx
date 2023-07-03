import React from 'react';
import type {DecoratorFn} from '@storybook/react';
import {Lang, configure} from '@gravity-ui/uikit';
import {settings as dateUtilsSettings} from '@gravity-ui/date-utils';
import {settings as chartkitSettings} from '../../src/libs';

const setDateUtilsLocale = async (lang: string) => {
    await dateUtilsSettings.loadLocale(lang);
    dateUtilsSettings.setLocale(lang);
};

export const withLang: DecoratorFn = (Story, context) => {
    const lang = context.globals.lang;
    chartkitSettings.set({lang});
    setDateUtilsLocale(lang);
    configure({lang: lang as Lang});

    return <Story key={lang} {...context} />;
};

import React from 'react';
import {DocsContainer, DocsContainerProps} from '@storybook/addon-docs';
import {ThemeProvider, MobileProvider, getThemeType} from '@gravity-ui/uikit';
import {themes} from '../../../.storybook/theme';
import {cn} from '../../../src/utils/cn';

import './DocsDecorator.scss';

export interface DocsDecoratorProps extends React.PropsWithChildren<DocsContainerProps> {}

const b = cn('docs-decorator');

export function DocsDecorator({children, context}: DocsDecoratorProps) {
    const storyContext = context.getStoryContext(context.storyById(context.id));
    const theme = storyContext.globals.theme;
    return (
        <div className={b()}>
            {/* @ts-ignore */}
            <DocsContainer
                context={{
                    ...context,
                    storyById: (id) => {
                        const story = context.storyById(id);
                        return {
                            ...story,
                            parameters: {
                                ...story?.parameters,
                                docs: {
                                    ...story?.parameters?.docs,
                                    theme: themes[getThemeType(theme)],
                                },
                            },
                        };
                    },
                }}
            >
                <ThemeProvider theme={theme}>
                    <MobileProvider mobile={false}>{children}</MobileProvider>
                </ThemeProvider>
            </DocsContainer>
        </div>
    );
}

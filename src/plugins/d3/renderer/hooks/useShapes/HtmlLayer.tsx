import React from 'react';

import {Portal} from '@gravity-ui/uikit';

import {HtmlItem} from '../../types';

type Props = {
    htmlLayout: HTMLElement | null;
    items: HtmlItem[];
};

export const HtmlLayer = (props: Props) => {
    const {items, htmlLayout} = props;

    if (!htmlLayout) {
        return null;
    }

    return (
        <Portal container={htmlLayout}>
            {items.map((item, index) => {
                return (
                    <div
                        key={index}
                        dangerouslySetInnerHTML={{__html: item.content}}
                        style={{position: 'absolute', left: item.x, top: item.y}}
                    />
                );
            })}
        </Portal>
    );
};

import React from 'react';

import {cn} from '../../utils/cn';

import {Pane} from './Pane';
import {SplitPane} from './SplitPane';
import type {SplitPaneProps} from './SplitPane';

import './StyledSplitPane.scss';

const b = cn('styled-split-pane');
const resizerClassName = b('pane-resizer');

type Props = SplitPaneProps & {
    paneOneRender: () => React.ReactNode;
    paneTwoRender: () => React.ReactNode;
};

export const StyledSplitPane = ({paneOneRender, paneTwoRender, ...splitPaneProps}: Props) => {
    const splitPaneRef = React.useRef<SplitPane & {splitPane?: HTMLDivElement | null}>(null);

    React.useEffect(() => {
        const resizer =
            splitPaneRef.current?.splitPane?.getElementsByClassName(resizerClassName)[0];
        const hoveredClassName = `${resizerClassName}_hovered`;

        const onTouchStart = () => {
            resizer?.classList.add(hoveredClassName);
        };

        const onTouchEnd = () => {
            resizer?.classList.remove(hoveredClassName);
        };

        resizer?.addEventListener('touchstart', onTouchStart);
        resizer?.addEventListener('touchend', onTouchEnd);

        return function cleanup() {
            resizer?.removeEventListener('touchstart', onTouchStart);
            resizer?.removeEventListener('touchend', onTouchEnd);
        };
    }, []);

    return (
        <SplitPane
            {...splitPaneProps}
            ref={splitPaneRef}
            className={b()}
            resizerClassName={resizerClassName}
        >
            <Pane>{paneOneRender()}</Pane>
            <Pane>{paneTwoRender()}</Pane>
        </SplitPane>
    );
};

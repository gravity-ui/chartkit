import React from 'react';

import SplitPane, {Pane, SplitPaneProps} from 'react-split-pane';

import {cn} from '../../../../../utils/cn';

import './StyledSplitPane.scss';

const b = cn('styled-split-pane');
const resizerClassName = b('pane-resizer');

type Props = SplitPaneProps & {
    paneOneRender: () => React.ReactNode;
    paneTwoRender: () => React.ReactNode;
};

export const StyledSplitPane = ({paneOneRender, paneTwoRender, ...splitPaneProps}: Props) => {
    // https://github.com/tomkp/react-split-pane/blob/master/src/SplitPane.js#L307
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

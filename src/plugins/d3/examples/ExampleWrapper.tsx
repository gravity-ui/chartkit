import React from 'react';

type Props = {
    children?: React.ReactNode;
    styles?: React.CSSProperties;
};

export const ExampleWrapper = (props: Props) => {
    const styles: React.CSSProperties = {
        height: 500,
        ...props.styles,
    };
    return <div style={styles}>{props.children}</div>;
};

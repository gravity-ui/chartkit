import React from 'react';

// For some reason React.memo drops the generic prop type and creates a regular union type
// https://github.com/DefinitelyTyped/DefinitelyTyped/issues/37087#issuecomment-542793243
export const typedMemo: <T>(component: T) => T = React.memo;

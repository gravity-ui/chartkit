/* @see https://github.com/leeoniya/uPlot/issues/538#issuecomment-870711531 */
// eslint-disable-next-line
const oMatchMedia = window.matchMedia;
// eslint-disable-next-line
window.matchMedia = (query) => {
    const mql = oMatchMedia(query);

    if (!mql.addEventListener) {
        mql.addEventListener = (_, handler) => {
            mql.addListener(handler);
        };
        mql.removeEventListener = (_, handler) => {
            mql.removeListener(handler);
        };
    }

    return mql;
};

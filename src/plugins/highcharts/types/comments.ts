interface CommentBase {
    id: string;
    feed: string;
    creatorLogin: string;
    createdDate: string;
    modifierLogin: string;
    modifiedDate: string;
    data: string;
    dateUntil: string | null;
    type: 'band-x' | 'dot-x-y' | 'flag-x' | 'line-x';
    text: string;
    params: object | null;
    meta: object;
}

interface CommentDotXY extends CommentBase {
    type: 'dot-x-y';
    meta: {
        color: string;
        graphId: string;
        visible: boolean;
        fillColor: string;
        textColor: string;
    };
}

interface CommentLineX extends CommentBase {
    type: 'line-x';
    meta: {
        color: string;
        width: number;
        dashStyle: string;
    };
}

interface CommentBandX extends CommentBase {
    dateUntil: string;
    type: 'band-x';
    meta: {
        color: string;
        zIndex: number;
        visible: boolean;
    };
}

interface CommentFlagX extends CommentBase {
    type: 'flag-x';
    meta: {
        y: number;
        color: string;
        shape: string;
    };
}

export type HighchartsComment = CommentDotXY | CommentBandX | CommentLineX | CommentFlagX;

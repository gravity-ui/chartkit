import bemBlock from 'bem-cn-lite';

export type CnBlock = ReturnType<typeof bemBlock>;

export const NAMESPACE = 'chartkit';

export const block = (name?: string): CnBlock => {
    if (!name) {
        return bemBlock(NAMESPACE);
    }

    return bemBlock(`${NAMESPACE}-${name}`);
};

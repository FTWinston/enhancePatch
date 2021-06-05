export function arrayIndex(key: string | number) {
    key = parseInt(key as string, 10);

    if (!Number.isInteger(key) || key < 0) {
        throw new Error('Array key must be a positive integer');
    }

    return key;
}

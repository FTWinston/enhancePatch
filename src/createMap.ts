export function createMap(initialiser?: Array<[string | number, any]>) {
    const map = new Map();

    if (initialiser !== undefined) {
        for (const [key, value] of initialiser) {
            map.set(key, value);
        }
    }

    return map;
}

export function createSet(initialiser?: Array<string | number>) {
    const set = new Set();

    if (initialiser !== undefined) {
        for (const entry of initialiser) {
            set.add(entry);
        }
    }

    return set;
}

import { ArrayPatch, Patch } from './Patch';

export function updateArrayPatchChildIndexes(patch: ArrayPatch, getNewIndex: (index: number) => number | null) {
    if (patch.c === undefined) {
        return;
    }

    const newChildren = new Map<number, Patch>();

    for (const [index, value] of patch.c.entries()) {
        const newIndex = getNewIndex(index);

        if (newIndex !== null) {
            newChildren.set(newIndex, value);
        }
    }

    patch.c = newChildren;
}


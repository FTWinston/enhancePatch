import { ArrayOperation, ArrayOperationType } from './ArrayOperation';
import { ArrayPatch, Patch } from './Patch';

export function getArrayChildIndexAdjustment(
    operation: ArrayOperation,
): ((index: number) => number | null) | null {
    switch (operation.o) {
        case ArrayOperationType.Splice: // Shift subsequent child indexes left/right by the total number changing.
            return (i) => {
                if (i < operation.i) {
                    return i;
                }
                if (i < operation.i + operation.d) {
                    return null;
                }
                return i + operation.n.length - operation.d;
            }
        case ArrayOperationType.Reverse: // Reverse order of child patch indexes.
            return (i) => operation.l - i - 1;
        default:
            return null;
    }
}

export function updateArrayPatchChildIndexes(
    patch: ArrayPatch,
    getNewIndex: (index: number) => number | null,
) {
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

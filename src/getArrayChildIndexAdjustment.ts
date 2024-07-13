import { ArrayOperation, ArrayOperationType } from './ArrayOperation';

export function getArrayChildIndexAdjustment(operation: ArrayOperation): ((index: number) => number | null) | null {
    switch(operation.o) {
        case ArrayOperationType.Splice: // Shift subsequent child indexes left/right by the total number changing.
            return (i) => i < operation.i ? i : i + operation.n.length - operation.d;
        case ArrayOperationType.Shift: // Decrease all child indexes by 1.
            return (i) => i > 0 ? i - 1 : null;
        case ArrayOperationType.Unshift: // Increase all child indexes by the number of items being added.
            return (i) => i + operation.n.length;
        case ArrayOperationType.Reverse: // Reverse order of child patch indexes.
            return (i) => operation.l - i - 1;
        default:
            return null;
    }
}

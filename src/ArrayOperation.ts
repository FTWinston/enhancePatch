/** Array operation type */
export enum ArrayOperationType {
    /** Set a particular index in an array */
    Set = 1,
    /** Delete a particular index in an array */
    Delete = 2,
    /** Remove certain index(es) from an array, and optionally insert new values in the same location, adjusting hte indexes of all subsequent items */
    Splice = 3,
    /** Remove first element from an array, adjusting the indexes of all remaining items */
    Shift = 4,
    /** Add new items to the start of an array, adjusting the indexes of all existing items */
    Unshift = 5,
    /** Reverse the order of an array */
    Reverse = 6,
}

/** Array operation */
export type ArrayOperation =
    | ArraySetOperation
    | ArrayDeleteOperation
    | ArraySpliceOperation
    | ArrayShiftOperation
    | ArrayUnshiftOperation
    | ArrayReverseOperation;

export interface ArraySetOperation {
    /** array operation type */
    o: typeof ArrayOperationType.Set;
    /** index to assign */
    i: number;
    /** value to assign */
    v: any;
}

export interface ArrayDeleteOperation {
    /** array operation type */
    o: typeof ArrayOperationType.Delete;
    /** index to delete */
    i: number;
}

export interface ArraySpliceOperation {
    /** array operation type */
    o: typeof ArrayOperationType.Splice;
    /** start index */
    i: number;
    /** delete count */
    d: number;
    /** new items to insert */
    n: any[];
}

export interface ArrayShiftOperation {
    /** array operation type */
    o: typeof ArrayOperationType.Shift;
}

export interface ArrayUnshiftOperation {
    /** array operation type */
    o: typeof ArrayOperationType.Unshift;
    /** new items to insert */
    n: any[];
}

export interface ArrayReverseOperation {
    /** array operation type */
    o: typeof ArrayOperationType.Reverse;
    /** length of underlying array */
    l: number;
}

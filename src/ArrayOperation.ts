/** Array operation type */
export enum ArrayOperationType {
    /** Set a particular index in an array */
    Set = 's',
    /** Delete a particular index in an array */
    Delete = 'd',
    /** Remove certain index(es) from an array, and optionally insert new values in the same location, adjusting hte indexes of all subsequent items */
    Splice = 'sp',
    /** Remove first element from an array, adjusting the indexes of all remaining items */
    Shift = 'sh',
    /** Add new items to the start of an array, adjusting the indexes of all existing items */
    Unshift = 'un',
    /** Reverse the order of an array */
    Reverse = 'r',
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

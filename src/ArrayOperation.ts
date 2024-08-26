/** Array operation type */
export enum ArrayOperationType {
    /** Set a particular index in an array */
    Set = 's',
    /** Delete a particular index in an array, leaving undefined */
    Delete = 'd',
    /** Remove certain index(es) from an array, and optionally insert new values in the same location, adjusting hte indexes of all subsequent items */
    Splice = 'x',
    /** Reverse the order of an array */
    Reverse = 'r',
}

/** Array operation */
export type ArrayOperation =
    | ArraySetOperation
    | ArrayDeleteOperation
    | ArraySpliceOperation
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

export interface ArrayReverseOperation {
    /** array operation type */
    o: typeof ArrayOperationType.Reverse;
    /** length of underlying array */
    l: number;
}

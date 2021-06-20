export enum ArrayOperationType {
    Set = 1,
    Delete = 2,
    Splice = 3,
    Shift = 4,
    Unshift = 5,
    Reverse = 6,
}

export type ArrayOperation =
    | ArraySetOperation
    | ArrayDeleteOperation
    | ArraySpliceOperation1
    | ArraySpliceOperation2
    | ArrayShiftOperation
    | ArrayUnshiftOperation
    | ArrayReverseOperation;

export interface ArraySetOperation {
    o: typeof ArrayOperationType.Set;
    k: string;
    i: number;
    v: any;
}

export interface ArrayDeleteOperation {
    o: typeof ArrayOperationType.Delete;
    i: number;
}

export interface ArraySpliceOperation1 {
    o: typeof ArrayOperationType.Splice;
    i: number; // start
    d?: number; // delete count
}

export interface ArraySpliceOperation2 {
    o: typeof ArrayOperationType.Splice;
    i: number; // start
    d: number; // delete count
    n: any[]; // insert new items
}

export interface ArrayShiftOperation {
    o: typeof ArrayOperationType.Shift;
}

export interface ArrayUnshiftOperation {
    o: typeof ArrayOperationType.Unshift;
    n: any[]; // insert new items
}

export interface ArrayReverseOperation {
    o: typeof ArrayOperationType.Reverse;
}

import { ArrayOperation } from './ArrayOperation';

export type Patch = ObjectPatch | ArrayPatch | MapPatch | SetPatch;

export interface ObjectPatch {
    s?: Record<string, any>; // keys to set
    d?: string[]; // keys to delete
    c?: Record<string, Patch>; // children
}

export interface ArrayPatch {
    o?: ArrayOperation[]; // operations
    c?: Record<number, Patch>; // children
    // NOTE: A shift/unshift/splice/reverse will need to update some/all children's numbers, somehow.
}

type MapKey = string | number;

export interface MapPatch {
    s?: Array<[MapKey, any]>; // elements to set
    d?: true | MapKey[]; // keys to delete
    c?: Record<string, Patch>; // string-keyed children
    C?: Record<number, Patch>; // number-keyed children
}

export interface SetPatch {
    a?: MapKey[]; // elements to add
    d?: true | MapKey[]; // clear all, or delete keys
}

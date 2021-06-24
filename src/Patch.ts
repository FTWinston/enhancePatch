import { ArrayOperation } from './ArrayOperation';

export type Patch = ObjectPatch | ArrayPatch | MapPatch | SetPatch;

export enum PatchType {
    Object = 1,
    Array = 2,
    Map = 3,
    Set = 4,
}

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

export interface MapPatch {
    s?: Record<string, any>; // string-key setters
    S?: Record<number, any>; // numeric-key setters
    c?: Record<string, Patch>; // string-keyed children
    C?: Record<number, Patch>; // numeric-keyed children
    d?: true | Array<number | string>; // clear all, or delete keys
}

export interface SetPatch {
    a?: Array<number | string>; // elements to add
    d?: true | Array<number | string>; // clear all, or delete keys
}

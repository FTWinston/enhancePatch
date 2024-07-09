import { ArrayOperation } from './ArrayOperation';

/** A patch object, which will be intended to be applied to a specific `Object`, `Array`, `Map` or `Set`. */
export type Patch = ObjectPatch | ArrayPatch | MapPatch | SetPatch;

/**
 * A patch to be applied to an `Object`.
 */
export interface ObjectPatch {
    /** keys to set */
    s?: Record<string, any>;
    /** keys to delete */
    d?: string[];
    /** children */
    c?: Record<string, Patch>;
}

/**
 * A patch to be applied to an `Array`.
 * Note that a shift/unshift/splice/reverse operation will update many children's indexes.
 */
export interface ArrayPatch {
    /** operations */
    o?: ArrayOperation[];
    /** children */
    c?: Record<number, Patch>;
}

type MapKey = string | number;

/**
 * A patch to be applied to a `Map`.
 */
export interface MapPatch {
    /** elements to set */
    s?: Array<[MapKey, any]>;
    /** If true: clear all, if array: delete specified keys */
    d?: true | MapKey[];
    /** string-keyed children */
    c?: Record<string, Patch>;
    /** number-keyed children */
    C?: Record<number, Patch>;
}

/**
 * A patch to be applied to a `Set`.
 */
export interface SetPatch {
    /** elements to add */
    a?: MapKey[];
    /** If true: clear all, if array: delete specified keys */
    d?: true | MapKey[]; // 
}

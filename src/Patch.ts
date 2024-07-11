import { ArrayOperation } from './ArrayOperation';

/** A patch object, which will be intended to be applied to a specific `Object`, `Array`, `Map` or `Set`. */
export type Patch = ObjectPatch | ArrayPatch | MapPatch | SetPatch;

/**
 * A patch to be applied to an `Object`.
 */
export interface ObjectPatch {
    /** keys to set */
    s?: Map<string, any>;
    /** keys to delete */
    d?: Set<string>;
    /** children */
    c?: Map<string, Patch>;
}

/**
 * A patch to be applied to an `Array`.
 * Note that a shift/unshift/splice/reverse operation will update many children's indexes.
 */
export interface ArrayPatch {
    /** operations */
    o?: ArrayOperation[];
    /** children */
    c?: Map<number, Patch>;
}

export type MapKey = string | number;

/**
 * A patch to be applied to a `Map`.
 */
export interface MapPatch {
    /** elements to set */
    s?: Map<MapKey, any>;
    /** If true: clear all, if array: delete specified keys */
    d?: true | Set<MapKey>;
    /** children */
    c?: Map<MapKey, Patch>;
}

/**
 * A patch to be applied to a `Set`.
 */
export interface SetPatch {
    /** elements to add */
    a?: Set<MapKey>;
    /** If true: clear all, if array: delete specified keys */
    d?: true | Set<MapKey>;
}

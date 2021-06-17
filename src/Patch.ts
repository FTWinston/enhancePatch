export enum ArrayOperationType {
    Set = 1,
    Delete = 2,
    Splice = 3,
    Shift = 4,
    Unshift = 5,
    Reverse = 6,
}

export type ArrayOperation =
    | {
          o: typeof ArrayOperationType.Set;
          k: string;
          v: any;
      }
    | {
          o: typeof ArrayOperationType.Delete;
          k: string;
      }
    | {
          o: typeof ArrayOperationType.Splice;
          s: number; // start
          d?: number; // delete count
          i?: any[]; // insert items
      }
    | {
          o: typeof ArrayOperationType.Shift;
      }
    | {
          o: typeof ArrayOperationType.Unshift;
          i: any[]; // insert items
      }
    | {
          o: typeof ArrayOperationType.Reverse;
      };

export type Patch = ObjectPatch | ArrayPatch | MapPatch | SetPatch;

export enum PatchType {
    Object = 1,
    Array = 2,
    Map = 3,
    Set = 4,
}

export interface ObjectPatch {
    t: typeof PatchType.Object;
    s?: Record<string, any>; // keys to set
    d?: string[]; // keys to delete
    c?: Record<string, Patch>; // children
}

export interface ArrayPatch {
    t: typeof PatchType.Array;
    o?: ArrayOperation[]; // array operations
    c?: Record<number, Patch>; // children
    // NOTE: A shift/unshift/splice/reverse will need to update some/all children's numbers, somehow.
}

export interface MapPatch {
    t: typeof PatchType.Map;
    s?: Record<string, any>; // string-key setters
    S?: Record<number, any>; // numeric-key setters
    d?: Array<number | string>; // delete keys
    c?: Record<string, Patch>; // string-keyed children
    C?: Record<number, Patch>; // numeric-keyed children
    x?: true; // clear
}

export interface SetPatch {
    t: typeof PatchType.Set;
    a?: Array<number | string>; // elements to add
    d?: Array<number | string>; // elements to delete
    x?: true; // clear
}

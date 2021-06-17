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
    set?: Record<string, any>;
    del?: string[];
    desc?: Record<string, Patch>;
}

export interface ArrayPatch {
    t: typeof PatchType.Array;
    ops?: ArrayOperation[];
    desc?: Record<number, Patch>; // A shift/unshift/splice/reverse will need to update all the descendants' numbers, somehow.
}

export interface MapPatch {
    t: typeof PatchType.Map;
    setStr?: Record<string, any>;
    setNum?: Record<number, any>;
    del?: Array<number | string>;
    descStr?: Record<string, Patch>;
    descNum?: Record<number, Patch>;
    clear?: true;
}

export interface SetPatch {
    t: typeof PatchType.Set;
    add?: Array<number | string>;
    del?: Array<number | string>;
    clear?: true;
}

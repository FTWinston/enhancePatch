import type { OperationType } from './OperationType';

export type Path = Array<string | number>;

export type Operation =
    | {
          o: typeof OperationType.Set;
          p?: Path;
          v: Array<[string | number, any]>;
      }
    | {
          o: typeof OperationType.Delete;
          p?: Path;
          k: Array<string | number>;
      }
    | {
          o: typeof OperationType.Clear;
          p?: Path;
      }
    | {
          o: typeof OperationType.ArraySplice;
          p?: Path;
          v: [number, number, any[]];
      }
    | {
          o: typeof OperationType.ArrayShift;
          p?: Path;
      }
    | {
          o: typeof OperationType.ArrayUnshift;
          p?: Path;
          v: any[];
      }
    | {
          o: typeof OperationType.ArrayReverse;
          p?: Path;
      };

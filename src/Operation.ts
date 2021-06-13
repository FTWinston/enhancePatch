import type { OperationType } from './OperationType';

export const pathSeparator = '/';

export type Operation =
    | {
          o: typeof OperationType.Set;
          p?: string;
          v: Array<[string | number, any]>;
      }
    | {
          o: typeof OperationType.Delete;
          p?: string;
          k: Array<string | number>;
      }
    | {
          o: typeof OperationType.Clear;
          p?: string;
      }
    | {
          o: typeof OperationType.ArraySplice;
          p?: string;
          v: [number, number, any[]];
      }
    | {
          o: typeof OperationType.ArrayShift;
          p?: string;
      }
    | {
          o: typeof OperationType.ArrayUnshift;
          p?: string;
          v: any[];
      }
    | {
          o: typeof OperationType.ArrayReverse;
          p?: string;
      };

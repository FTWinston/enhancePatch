import type { OperationType } from './OperationType';

export type Operation =
    | {
          o: typeof OperationType.SingleValue;
          p?: string;
          k: string | number;
          v: any;
      }
    | {
          o: typeof OperationType.MultipleValues;
          p?: string;
          k: Array<string | number>;
          v: Array<any>;
      }
    | {
          o: typeof OperationType.Delete;
          p?: string;
          k: string | number | Array<string | number>;
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

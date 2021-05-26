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
      };

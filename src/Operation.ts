import type { SetValue, RemoveValue, InitMap, InitSet } from './OperationType';

export type Operation =
    | {
          o: typeof SetValue;
          p?: string;
          k: string | number;
          v: any;
      }
    | {
          o: typeof SetValue;
          p?: string;
          k: Array<string | number>;
          v: Array<any>;
      }
    | {
          o: typeof RemoveValue;
          p?: string;
          k: string | number | Array<string | number>;
      }
    | {
          o: typeof InitMap;
          p?: string;
          k: string | number;
          v?: Array<[string | number, any]>;
      }
    | {
          o: typeof InitSet;
          p?: string;
          k: string | number;
          v?: Array<string | number>;
      };

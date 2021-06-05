export enum OperationType {
    SingleValue = 's',
    MultipleValues = 'm',
    Delete = 'd',
    Clear = 'c',

    // All in-place array operations that wouldn't be efficiently represented
    // just by set and delete handlers. Not including sort, cos that uses a function and we don't want to eval.
    ArraySplice = 'p',
    ArrayShift = 'h',
    ArrayUnshift = 'u',
    ArrayReverse = 'r',
}

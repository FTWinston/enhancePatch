import { describe, expect, test } from 'vitest';
import { ArrayOperationType } from './ArrayOperation';
import { combinePatches } from './combinePatches';
import { Patch } from './Patch';

describe('s in newer patch', () => {
    test('all retained when not present on newer', () => {
        const patch1: Patch = {
            s: new Map([
                ['a', 1],
                ['b', 2],
            ]),
        };

        const patch2: Patch = {};

        const newPatch = combinePatches(patch1, patch2);

        expect(newPatch).toEqual({
            s: new Map([
                ['a', 1],
                ['b', 2],
            ]),
        });
    });

    test('all retained when not present on older', () => {
        const patch1: Patch = {};

        const patch2: Patch = {
            s: new Map([
                ['a', 1],
                ['b', 2],
            ]),
        };

        const newPatch = combinePatches(patch1, patch2);

        expect(newPatch).toEqual({
            s: new Map([
                ['a', 1],
                ['b', 2],
            ]),
        });
    });

    test('newer replaces older', () => {
        const patch1: Patch = {
            s: new Map([
                ['a', 1],
                ['b', 2],
            ]),
        };

        const patch2: Patch = {
            s: new Map([
                ['a', 2],
                ['c', 3],
            ]),
        };

        const newPatch = combinePatches(patch1, patch2);

        expect(newPatch).toEqual({
            s: new Map([
                ['a', 2],
                ['b', 2],
                ['c', 3],
            ]),
        });
    });

    test('removes matching d from older', () => {
        const patch1: Patch = {
            d: new Set(['a', 'c']),
        };

        const patch2: Patch = {
            s: new Map([
                ['a', 1],
                ['b', 2],
            ]),
        };

        const newPatch = combinePatches(patch1, patch2);

        expect(newPatch).toEqual({
            s: new Map([
                ['a', 1],
                ['b', 2],
            ]),
            d: new Set(['c']),
        });
    });

    test('removes matching c from older', () => {
        const patch1: Patch = {
            c: new Map([
                ['b', {}],
                ['d', {}],
            ]),
        };

        const patch2: Patch = {
            s: new Map([
                ['a', 1],
                ['b', 2],
            ]),
        };

        const newPatch = combinePatches(patch1, patch2);

        expect(newPatch).toEqual({
            s: new Map([
                ['a', 1],
                ['b', 2],
            ]),
            c: new Map([['d', {}]]),
        });
    });
});

describe('d in newer patch', () => {
    test('all retained when not present on newer', () => {
        const patch1: Patch = {
            d: new Set(['a', 'b']),
        };

        const patch2: Patch = {};

        const newPatch = combinePatches(patch1, patch2);

        expect(newPatch).toEqual({
            d: new Set(['a', 'b']),
        });
    });

    test('all retained when not present on older', () => {
        const patch1: Patch = {};

        const patch2: Patch = {
            d: new Set(['a', 'b']),
        };

        const newPatch = combinePatches(patch1, patch2);

        expect(newPatch).toEqual({
            d: new Set(['a', 'b']),
        });
    });

    test('newer combines with older', () => {
        const patch1: Patch = {
            d: new Set(['a', 'b']),
        };

        const patch2: Patch = {
            d: new Set(['b', 'c']),
        };

        const newPatch = combinePatches(patch1, patch2);

        expect(newPatch).toEqual({
            d: new Set(['a', 'b', 'c']),
        });
    });

    test('removes matching s from older', () => {
        const patch1: Patch = {
            s: new Map([
                ['a', 1],
                ['c', 2],
            ]),
        };

        const patch2: Patch = {
            d: new Set(['a', 'b']),
        };

        const newPatch = combinePatches(patch1, patch2);

        expect(newPatch).toEqual({
            s: new Map([['c', 2]]),
            d: new Set(['a', 'b']),
        });
    });

    test('removes matching a from older', () => {
        const patch1: Patch = {
            a: new Set(['a', 'c']),
        };

        const patch2: Patch = {
            d: new Set(['a', 'b']),
        };

        const newPatch = combinePatches(patch1, patch2);

        expect(newPatch).toEqual({
            a: new Set(['c']),
            d: new Set(['a', 'b']),
        });
    });

    test('removes matching c from older', () => {
        const patch1: Patch = {
            c: new Map([
                ['b', {}],
                ['d', {}],
            ]),
        };

        const patch2: Patch = {
            d: new Set(['a', 'b']),
        };

        const newPatch = combinePatches(patch1, patch2);

        expect(newPatch).toEqual({
            d: new Set(['a', 'b']),
            c: new Map([['d', {}]]),
        });
    });
});

describe('c in newer patch', () => {
    test('all retained when not present on older', () => {
        const patch1: Patch = {};

        const patch2: Patch = {
            c: new Map([
                ['a', {}],
                ['b', {}],
            ]),
        };

        const newPatch = combinePatches(patch1, patch2);

        expect(newPatch).toEqual({
            c: new Map([
                ['a', {}],
                ['b', {}],
            ]),
        });
    });

    test('all retained when not present on newer', () => {
        const patch1: Patch = {
            c: new Map([
                ['a', {}],
                ['b', {}],
            ]),
        };

        const patch2: Patch = {};

        const newPatch = combinePatches(patch1, patch2);

        expect(newPatch).toEqual({
            c: new Map([
                ['a', {}],
                ['b', {}],
            ]),
        });
    });

    test('newer combines with older', () => {
        const patch1: Patch = {
            c: new Map([
                ['a', { a: new Set([1, 2, 3]), d: new Set([4, 5, 6]) }],
                ['b', {}],
            ]),
        };

        const patch2: Patch = {
            c: new Map([
                ['a', { a: new Set([7, 8]), d: new Set([9, 10]) }],
                ['c', {}],
            ]),
        };

        const newPatch = combinePatches(patch1, patch2);

        expect(newPatch).toEqual({
            c: new Map([
                [
                    'a',
                    {
                        a: new Set([1, 2, 3, 7, 8]),
                        d: new Set([4, 5, 6, 9, 10]),
                    },
                ],
                ['b', {}],
                ['c', {}],
            ]),
        });
    });

    test('newer applies to s on older', () => {
        const patch1: Patch = {
            s: new Map([['a', { a1: 1, a2: 2 }]]),
        };

        const patch2: Patch = {
            c: new Map([
                ['a', { s: new Map([['a2', 3]]) }],
                ['b', {}],
            ]),
        };

        const newPatch = combinePatches(patch1, patch2);

        expect(newPatch).toEqual({
            s: new Map([['a', { a1: 1, a2: 3 }]]),
            c: new Map([['b', {}]]),
        });
    });
});

describe('a in newer patch', () => {
    test('all retained when not present on older', () => {
        const patch1: Patch = {};

        const patch2: Patch = {
            a: new Set(['a', 'b']),
        };

        const newPatch = combinePatches(patch1, patch2);

        expect(newPatch).toEqual({
            a: new Set(['a', 'b']),
        });
    });

    test('newer combines with older', () => {
        const patch1: Patch = {
            a: new Set(['a', 'b']),
        };

        const patch2: Patch = {
            a: new Set(['b', 'c']),
        };

        const newPatch = combinePatches(patch1, patch2);

        expect(newPatch).toEqual({
            a: new Set(['a', 'b', 'c']),
        });
    });

    test('removes matching d from older', () => {
        const patch1: Patch = {
            d: new Set(['a', 'c']),
        };

        const patch2: Patch = {
            a: new Set(['a', 'b']),
        };

        const newPatch = combinePatches(patch1, patch2);

        expect(newPatch).toEqual({
            a: new Set(['a', 'b']),
            d: new Set(['c']),
        });
    });
});

describe('o in newer patch', () => {
    test('all retained when not present on newer', () => {
        const patch1: Patch = {
            o: [
                {
                    o: ArrayOperationType.Set,
                    i: 0,
                    v: 'x',
                },
                {
                    o: ArrayOperationType.Set,
                    i: 1,
                    v: 'y',
                },
            ],
        };

        const patch2: Patch = {};

        const newPatch = combinePatches(patch1, patch2);

        expect(newPatch).toEqual({
            o: [
                {
                    o: ArrayOperationType.Set,
                    i: 0,
                    v: 'x',
                },
                {
                    o: ArrayOperationType.Set,
                    i: 1,
                    v: 'y',
                },
            ],
        });
    });

    test('all retained when not present on older', () => {
        const patch1: Patch = {};

        const patch2: Patch = {
            o: [
                {
                    o: ArrayOperationType.Set,
                    i: 0,
                    v: 'x',
                },
                {
                    o: ArrayOperationType.Set,
                    i: 1,
                    v: 'y',
                },
            ],
        };

        const newPatch = combinePatches(patch1, patch2);

        expect(newPatch).toEqual({
            o: [
                {
                    o: ArrayOperationType.Set,
                    i: 0,
                    v: 'x',
                },
                {
                    o: ArrayOperationType.Set,
                    i: 1,
                    v: 'y',
                },
            ],
        });
    });

    test('newer appended after older', () => {
        const patch1: Patch = {
            o: [
                {
                    o: ArrayOperationType.Set,
                    i: 0,
                    v: 'x',
                },
                {
                    o: ArrayOperationType.Set,
                    i: 1,
                    v: 'y',
                },
            ],
        };

        const patch2: Patch = {
            o: [
                {
                    o: ArrayOperationType.Set,
                    i: 2,
                    v: 'z',
                },
                {
                    o: ArrayOperationType.Set,
                    i: 3,
                    v: 'a',
                },
            ],
        };

        const newPatch = combinePatches(patch1, patch2);

        expect(newPatch).toEqual({
            o: [
                {
                    o: ArrayOperationType.Set,
                    i: 0,
                    v: 'x',
                },
                {
                    o: ArrayOperationType.Set,
                    i: 1,
                    v: 'y',
                },
                {
                    o: ArrayOperationType.Set,
                    i: 2,
                    v: 'z',
                },
                {
                    o: ArrayOperationType.Set,
                    i: 3,
                    v: 'a',
                },
            ],
        });
    });

    test('indexes in older c updated, single operation', () => {
        const patch1: Patch = {
            c: new Map([
                [0, { a: new Set([1]) }],
                [1, { b: new Set([2]) }],
            ]),
        };

        const patch2: Patch = {
            o: [
                {
                    o: ArrayOperationType.Reverse,
                    l: 2,
                },
            ],
        };

        const newPatch = combinePatches(patch1, patch2);

        expect(newPatch).toEqual({
            c: new Map([
                [0, { b: new Set([2]) }],
                [1, { a: new Set([1]) }],
            ]),
            o: [
                {
                    o: ArrayOperationType.Reverse,
                    l: 2,
                },
            ],
        });
    });

    test('indexes in older c updated, multiple operations', () => {
        const patch1: Patch = {
            c: new Map([
                [0, { a: new Set([0]) }],
                [1, { b: new Set([1]) }],
                [2, { c: new Set([2]) }],
                [3, { d: new Set([3]) }],
            ]),
        };

        const patch2: Patch = {
            o: [
                {
                    o: ArrayOperationType.Splice,
                    i: 0,
                    d: 1,
                    n: [],
                },
                {
                    o: ArrayOperationType.Reverse,
                    l: 3,
                },
                {
                    o: ArrayOperationType.Splice,
                    i: 0,
                    d: 1,
                    n: [],
                },
            ],
        };

        const newPatch = combinePatches(patch1, patch2);

        expect(newPatch).toEqual({
            c: new Map([
                [0, { c: new Set([2]) }],
                [1, { b: new Set([1]) }],
            ]),
            o: [
                {
                    o: ArrayOperationType.Splice,
                    i: 0,
                    d: 1,
                    n: [],
                },
                {
                    o: ArrayOperationType.Reverse,
                    l: 3,
                },
                {
                    o: ArrayOperationType.Splice,
                    i: 0,
                    d: 1,
                    n: [],
                },
            ],
        });
    });
});

describe('d true in older patch', () => {
    test('d in newer patch discarded', () => {
        const patch1: Patch = {
            d: true,
        };

        const patch2: Patch = {
            d: new Set(['c', 'd']),
        };

        const newPatch = combinePatches(patch1, patch2);

        expect(newPatch).toEqual({
            d: true,
        });
    });
});

describe('d true in newer patch', () => {
    test('s in older patch removed', () => {
        const patch1: Patch = {
            s: new Map([
                ['a', 1],
                ['b', 2],
            ]),
        };

        const patch2: Patch = {
            d: true,
        };

        const newPatch = combinePatches(patch1, patch2);

        expect(newPatch).toEqual({
            d: true,
        });
    });

    test('a in older patch removed', () => {
        const patch1: Patch = {
            a: new Set(['a', 'b']),
        };

        const patch2: Patch = {
            d: true,
        };

        const newPatch = combinePatches(patch1, patch2);

        expect(newPatch).toEqual({
            d: true,
        });
    });

    test('c in older patch removed', () => {
        const patch1: Patch = {
            c: new Map([
                ['e', {}],
                ['f', {}],
            ]),
        };

        const patch2: Patch = {
            d: true,
        };

        const newPatch = combinePatches(patch1, patch2);

        expect(newPatch).toEqual({
            d: true,
        });
    });

    test('d in older patch discarded', () => {
        const patch1: Patch = {
            d: new Set(['c', 'd']),
        };

        const patch2: Patch = {
            d: true,
        };

        const newPatch = combinePatches(patch1, patch2);

        expect(newPatch).toEqual({
            d: true,
        });
    });
});

describe('original patches unmodified', () => {
    test('one Map (or object) patch', () => {
        const patch1: Patch = {
            s: new Map([['a', 1]]),
            d: new Set(['b']),
            c: new Map([['c', {}]]),
        };

        const newPatch: any = combinePatches(patch1);

        expect(newPatch).not.toBe(patch1);

        expect(newPatch).toEqual(patch1);

        expect(newPatch.s).not.toBe(patch1.s);
        expect(newPatch.d).not.toBe(patch1.d);
        expect(newPatch.c).not.toBe(patch1.c);
    });

    test('one Set patch', () => {
        const patch1: Patch = {
            a: new Set(['a']),
            d: new Set(['b']),
        };

        const newPatch: any = combinePatches(patch1);

        expect(newPatch).not.toBe(patch1);

        expect(newPatch).toEqual(patch1);

        expect(newPatch.a).not.toBe(patch1.a);
        expect(newPatch.d).not.toBe(patch1.d);
    });

    test('one Array patch', () => {
        const patch1: Patch = {
            o: [],
            c: new Map([[1, {}]]),
        };

        const newPatch: any = combinePatches(patch1);

        expect(newPatch).not.toBe(patch1);

        expect(newPatch).toEqual(patch1);

        expect(newPatch.o).not.toBe(patch1.o);
        expect(newPatch.c).not.toBe(patch1.c);
    });

    test('two patches, both are populated', () => {
        const patch1: Patch = {
            s: new Map([['a', 1]]),
            d: new Set(['b']),
            c: new Map([['c', {}]]),
        };

        const patch2: Patch = {
            s: new Map([['aa', 2]]),
            d: new Set(['bb']),
            c: new Map([['cc', {}]]),
        };

        const newPatch = combinePatches(patch1, patch2);

        expect(newPatch).not.toBe(patch1);
        expect(newPatch).not.toBe(patch2);

        expect(patch1).toEqual({
            s: new Map([['a', 1]]),
            d: new Set(['b']),
            c: new Map([['c', {}]]),
        });

        expect(patch2).toEqual({
            s: new Map([['aa', 2]]),
            d: new Set(['bb']),
            c: new Map([['cc', {}]]),
        });

        expect(newPatch).toEqual({
            s: new Map([
                ['a', 1],
                ['aa', 2],
            ]),
            d: new Set(['b', 'bb']),
            c: new Map([
                ['c', {}],
                ['cc', {}],
            ]),
        });
    });

    test('two patches, only first is populated', () => {
        const patch1: Patch = {
            s: new Map([['a', 1]]),
            d: new Set(['b']),
            c: new Map([['c', {}]]),
        };

        const patch2: Patch = {};

        const newPatch = combinePatches(patch1, patch2);

        expect(newPatch).not.toBe(patch1);
        expect(newPatch).not.toBe(patch2);

        expect(patch1).toEqual({
            s: new Map([['a', 1]]),
            d: new Set(['b']),
            c: new Map([['c', {}]]),
        });

        expect(patch2).toEqual({});

        expect(newPatch).toEqual({
            s: new Map([['a', 1]]),
            d: new Set(['b']),
            c: new Map([['c', {}]]),
        });
    });

    test('two patches, only second is populated', () => {
        const patch1: Patch = {};

        const patch2: Patch = {
            s: new Map([['aa', 2]]),
            d: new Set(['bb']),
            c: new Map([['cc', {}]]),
        };

        const newPatch = combinePatches(patch1, patch2);

        expect(newPatch).not.toBe(patch1);
        expect(newPatch).not.toBe(patch2);

        expect(patch1).toEqual({});

        expect(patch2).toEqual({
            s: new Map([['aa', 2]]),
            d: new Set(['bb']),
            c: new Map([['cc', {}]]),
        });

        expect(newPatch).toEqual({
            s: new Map([['aa', 2]]),
            d: new Set(['bb']),
            c: new Map([['cc', {}]]),
        });
    });

    test('three patches, all are populated', () => {
        const patch1: Patch = {
            s: new Map([['a', 1]]),
            d: new Set(['b']),
            c: new Map([['c', {}]]),
        };

        const patch2: Patch = {
            s: new Map([['aa', 2]]),
            d: new Set(['bb']),
            c: new Map([['cc', {}]]),
        };

        const patch3: Patch = {
            s: new Map([['aaa', 3]]),
            d: new Set(['bbb']),
            c: new Map([['ccc', {}]]),
        };

        const newPatch = combinePatches(patch1, patch2, patch3);

        expect(newPatch).not.toBe(patch1);
        expect(newPatch).not.toBe(patch2);
        expect(newPatch).not.toBe(patch3);

        expect(patch1).toEqual({
            s: new Map([['a', 1]]),
            d: new Set(['b']),
            c: new Map([['c', {}]]),
        });

        expect(patch2).toEqual({
            s: new Map([['aa', 2]]),
            d: new Set(['bb']),
            c: new Map([['cc', {}]]),
        });

        expect(patch3).toEqual({
            s: new Map([['aaa', 3]]),
            d: new Set(['bbb']),
            c: new Map([['ccc', {}]]),
        });

        expect(newPatch).toEqual({
            s: new Map([
                ['a', 1],
                ['aa', 2],
                ['aaa', 3],
            ]),
            d: new Set(['b', 'bb', 'bbb']),
            c: new Map([
                ['c', {}],
                ['cc', {}],
                ['ccc', {}],
            ]),
        });
    });

    test('three patches, only first is populated', () => {
        const patch1: Patch = {
            s: new Map([['a', 1]]),
            d: new Set(['b']),
            c: new Map([['c', {}]]),
        };

        const patch2: Patch = {};

        const patch3: Patch = {};

        const newPatch = combinePatches(patch1, patch2, patch3);

        expect(newPatch).not.toBe(patch1);
        expect(newPatch).not.toBe(patch2);
        expect(newPatch).not.toBe(patch3);

        expect(patch1).toEqual({
            s: new Map([['a', 1]]),
            d: new Set(['b']),
            c: new Map([['c', {}]]),
        });

        expect(patch2).toEqual({});
        expect(patch3).toEqual({});

        expect(newPatch).toEqual({
            s: new Map([['a', 1]]),
            d: new Set(['b']),
            c: new Map([['c', {}]]),
        });
    });

    test('three patches, only second is populated', () => {
        const patch1: Patch = {};

        const patch2: Patch = {
            s: new Map([['aa', 2]]),
            d: new Set(['bb']),
            c: new Map([['cc', {}]]),
        };

        const patch3: Patch = {};

        const newPatch = combinePatches(patch1, patch2, patch3);

        expect(newPatch).not.toBe(patch1);
        expect(newPatch).not.toBe(patch2);
        expect(newPatch).not.toBe(patch3);

        expect(patch1).toEqual({});

        expect(patch2).toEqual({
            s: new Map([['aa', 2]]),
            d: new Set(['bb']),
            c: new Map([['cc', {}]]),
        });

        expect(patch3).toEqual({});

        expect(newPatch).toEqual({
            s: new Map([['aa', 2]]),
            d: new Set(['bb']),
            c: new Map([['cc', {}]]),
        });
    });

    test('three patches, only third is populated', () => {
        const patch1: Patch = {};

        const patch2: Patch = {};

        const patch3: Patch = {
            s: new Map([['aaa', 3]]),
            d: new Set(['bbb']),
            c: new Map([['ccc', {}]]),
        };

        const newPatch = combinePatches(patch1, patch2, patch3);

        expect(newPatch).not.toBe(patch1);
        expect(newPatch).not.toBe(patch2);
        expect(newPatch).not.toBe(patch3);

        expect(patch1).toEqual({});

        expect(patch2).toEqual({});

        expect(patch3).toEqual({
            s: new Map([['aaa', 3]]),
            d: new Set(['bbb']),
            c: new Map([['ccc', {}]]),
        });

        expect(newPatch).toEqual({
            s: new Map([['aaa', 3]]),
            d: new Set(['bbb']),
            c: new Map([['ccc', {}]]),
        });
    });

    test('three patches, first two are populated', () => {
        const patch1: Patch = {
            s: new Map([['a', 1]]),
            d: new Set(['b']),
            c: new Map([['c', {}]]),
        };

        const patch2: Patch = {
            s: new Map([['aa', 2]]),
            d: new Set(['bb']),
            c: new Map([['cc', {}]]),
        };

        const patch3: Patch = {};

        const newPatch = combinePatches(patch1, patch2, patch3);

        expect(newPatch).not.toBe(patch1);
        expect(newPatch).not.toBe(patch2);
        expect(newPatch).not.toBe(patch3);

        expect(patch1).toEqual({
            s: new Map([['a', 1]]),
            d: new Set(['b']),
            c: new Map([['c', {}]]),
        });

        expect(patch2).toEqual({
            s: new Map([['aa', 2]]),
            d: new Set(['bb']),
            c: new Map([['cc', {}]]),
        });

        expect(patch3).toEqual({});

        expect(newPatch).toEqual({
            s: new Map([
                ['a', 1],
                ['aa', 2],
            ]),
            d: new Set(['b', 'bb']),
            c: new Map([
                ['c', {}],
                ['cc', {}],
            ]),
        });
    });

    test('three patches, last two are populated', () => {
        const patch1: Patch = {};

        const patch2: Patch = {
            s: new Map([['aa', 2]]),
            d: new Set(['bb']),
            c: new Map([['cc', {}]]),
        };

        const patch3: Patch = {
            s: new Map([['aaa', 3]]),
            d: new Set(['bbb']),
            c: new Map([['ccc', {}]]),
        };

        const newPatch = combinePatches(patch1, patch2, patch3);

        expect(newPatch).not.toBe(patch1);
        expect(newPatch).not.toBe(patch2);
        expect(newPatch).not.toBe(patch3);

        expect(patch1).toEqual({});

        expect(patch2).toEqual({
            s: new Map([['aa', 2]]),
            d: new Set(['bb']),
            c: new Map([['cc', {}]]),
        });

        expect(patch3).toEqual({
            s: new Map([['aaa', 3]]),
            d: new Set(['bbb']),
            c: new Map([['ccc', {}]]),
        });

        expect(newPatch).toEqual({
            s: new Map([
                ['aa', 2],
                ['aaa', 3],
            ]),
            d: new Set(['bb', 'bbb']),
            c: new Map([
                ['cc', {}],
                ['ccc', {}],
            ]),
        });
    });

    test('three patches, first and last are populated', () => {
        const patch1: Patch = {
            s: new Map([['a', 1]]),
            d: new Set(['b']),
            c: new Map([['c', {}]]),
        };

        const patch2: Patch = {};

        const patch3: Patch = {
            s: new Map([['aaa', 3]]),
            d: new Set(['bbb']),
            c: new Map([['ccc', {}]]),
        };

        const newPatch = combinePatches(patch1, patch2, patch3);

        expect(newPatch).not.toBe(patch1);
        expect(newPatch).not.toBe(patch2);
        expect(newPatch).not.toBe(patch3);

        expect(patch1).toEqual({
            s: new Map([['a', 1]]),
            d: new Set(['b']),
            c: new Map([['c', {}]]),
        });

        expect(patch2).toEqual({});

        expect(patch3).toEqual({
            s: new Map([['aaa', 3]]),
            d: new Set(['bbb']),
            c: new Map([['ccc', {}]]),
        });

        expect(newPatch).toEqual({
            s: new Map([
                ['a', 1],
                ['aaa', 3],
            ]),
            d: new Set(['b', 'bbb']),
            c: new Map([
                ['c', {}],
                ['ccc', {}],
            ]),
        });
    });
});

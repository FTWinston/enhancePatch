import { combinePatches } from './combinePatches';
import { Patch } from './Patch';

describe('s in newer patch', () => {
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
    // TODO: test every combination
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
    // TODO: test every combination
});

describe('d true in older patch', () => {
    // TODO: test every combination
});

describe('d true in newer patch', () => {
    // TODO: test every combination
});

describe('original patches unmodified', () => {
    test('one patch', () => {
        const patch1: Patch = {
            s: new Map([['a', 1]]),
            d: new Set(['b']),
            c: new Map([['c', {}]]),
        };

        const newPatch = combinePatches(patch1);

        expect(newPatch).not.toBe(patch1);

        expect(newPatch).toEqual(patch1);
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

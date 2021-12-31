import { applyChanges } from './applyChanges';
import { Patch } from './Patch';

test('objects', () => {
    const tree = {
        a: 'x',
        x: 'x',
        child: {
            y: 'y',
            grandchild: {
                z: [1, 2, 3],
            },
        },
    };

    const patch: Patch = {
        s: { a: 1, b: '2' },
        d: ['x'],
        c: {
            child: {
                s: { c: '3' },
                d: ['y'],
                c: {
                    grandchild: {
                        s: { greatgrandchild: { d: 4 } },
                        d: ['z'],
                    },
                },
            },
        },
    };

    const newTree = applyChanges(tree, patch);

    expect(newTree).toEqual({
        a: 1,
        b: '2',
        child: {
            c: '3',
            grandchild: {
                greatgrandchild: {
                    d: 4,
                },
            },
        },
    });
});

// TODO: various array tests

test('new maps and sets', () => {
    const tree = {};

    const patch: Patch = {
        s: {
            a: new Map<any, any>([
                ['x', 1],
                ['y', 2],
                ['z', '3'],
            ]),
            b: new Set([1, 2, 4, 8]),
            c: new Map<string | number, any>([
                [
                    'd',
                    {
                        x: '1',
                        y: '2',
                        z: 3,
                    },
                ],
                [
                    1,
                    new Map<string, any>([
                        ['x', 1],
                        ['y', 2],
                        ['z', '3'],
                    ]),
                ],
                ['e', new Set(['x', 'y', 'z'])],
            ]),
        },
    };

    const newTree = applyChanges(tree, patch);

    expect(newTree).toEqual({
        a: new Map<any, any>([
            ['x', 1],
            ['y', 2],
            ['z', '3'],
        ]),
        b: new Set([1, 2, 4, 8]),
        c: new Map<string | number, any>([
            ['d', { x: '1', y: '2', z: 3 }],
            [
                1,
                new Map<string, any>([
                    ['x', 1],
                    ['y', 2],
                    ['z', '3'],
                ]),
            ],
            ['e', new Set(['x', 'y', 'z'])],
        ]),
    });
});

test('existing map', () => {
    const tree = {
        a: new Map<string | number, any>([
            ['a', 1],
            ['b', 2],
            ['c', 3],
            [1, 'a'],
            [2, 'b'],
            [3, 'c'],
        ]),
        b: new Map<string | number, any>([
            ['a', 1],
            ['b', 2],
            ['c', 3],
            [1, 'a'],
            [2, 'b'],
            [3, 'c'],
        ]),
        c: new Map<string | number, any>([
            ['a', 1],
            ['b', 2],
            ['c', 3],
            [1, 'a'],
            [2, 'b'],
            [3, 'c'],
        ]),
        d: new Map<string | number, any>([
            ['a', 1],
            ['b', 2],
            ['c', 3],
            [1, 'a'],
            [2, 'b'],
            [3, 'c'],
        ]),
        e: new Map<string | number, any>([
            [
                'x',
                new Map<string | number, any>([
                    ['a', 1],
                    ['b', 2],
                    ['c', 3],
                    [1, 'a'],
                    [2, 'b'],
                    [3, 'c'],
                ]),
            ],
            [
                9,
                new Map<string | number, any>([
                    ['a', 1],
                    ['b', 2],
                    ['c', 3],
                    [1, 'a'],
                    [2, 'b'],
                    [3, 'c'],
                ]),
            ],
        ]),
    };

    const patch: Patch = {
        c: {
            a: {
                s: [
                    ['d', 4],
                    [4, 'D'],
                ],
                d: ['a', 'b', 2, 3],
            },
            b: {
                s: [
                    ['d', 4],
                    [4, 'D'],
                ],
            },
            c: {
                d: ['a', 'b', 2, 3],
            },
            d: {
                s: [
                    ['d', 4],
                    [4, 'D'],
                ],
                d: true,
            },
            e: {
                c: {
                    x: {
                        s: [
                            ['d', 4],
                            [4, 'D'],
                        ],
                        d: ['a', 'b', 2, 3],
                    },
                },
                C: {
                    9: {
                        s: [
                            ['d', 4],
                            [4, 'D'],
                        ],
                        d: ['a', 'b', 2, 3],
                    },
                },
            },
        },
    };

    const newTree = applyChanges(tree, patch);

    expect(newTree).toEqual({
        a: new Map<string | number, any>([
            ['c', 3],
            [1, 'a'],
            ['d', 4],
            [4, 'D'],
        ]),
        b: new Map<string | number, any>([
            ['a', 1],
            ['b', 2],
            ['c', 3],
            [1, 'a'],
            [2, 'b'],
            [3, 'c'],
            ['d', 4],
            [4, 'D'],
        ]),
        c: new Map<string | number, any>([
            ['c', 3],
            [1, 'a'],
        ]),
        d: new Map<string | number, any>([
            ['d', 4],
            [4, 'D'],
        ]),
        e: new Map<string | number, any>([
            [
                'x',
                new Map<string | number, any>([
                    ['c', 3],
                    [1, 'a'],
                    ['d', 4],
                    [4, 'D'],
                ]),
            ],
            [
                9,
                new Map<string | number, any>([
                    ['c', 3],
                    [1, 'a'],
                    ['d', 4],
                    [4, 'D'],
                ]),
            ],
        ]),
    });
});

test('existing set', () => {
    const tree = {
        a: new Set<any>([1, 2, 3]),
        b: new Set<any>([1, 2, 3]),
    };

    const patch: Patch = {
        c: {
            a: {
                a: ['a', 4, 5],
                d: [2, 3],
            },
            b: {
                a: ['a', 4, 5],
                d: true,
            },
        },
    };

    const newTree = applyChanges(tree, patch);

    expect(newTree).toEqual({
        a: new Set<any>([1, 'a', 4, 5]),
        b: new Set<any>(['a', 4, 5]),
    });
});

test('dates', () => {
    const tree = {
        child: {},
    };

    const patch: Patch = {
        s: {
            a: new Date(2020, 11, 31),
        },
        c: {
            child: {
                s: {
                    b: new Date(2021, 0, 0, 12, 0, 0),
                },
            },
        },
    };

    const newTree = applyChanges(tree, patch);

    expect(newTree).toEqual({
        a: new Date(2020, 11, 31),
        child: {
            b: new Date(2021, 0, 0, 12, 0, 0),
        },
    });
});

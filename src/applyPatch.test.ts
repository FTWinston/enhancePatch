import { describe, expect, test } from 'vitest';
import { applyPatch } from './applyPatch';
import { ArrayPatch, MapKey, Patch } from './Patch';
import { ArrayOperationType } from './ArrayOperation';

describe('no changes: new tree equals original, but has been reassigned', () => {
    test('Object', () => {
        const tree = { x: 1, y: 'hello' };
        const patch = {};

        const updatedTree = applyPatch(tree, patch);

        expect(updatedTree).toEqual(tree);
        expect(updatedTree).not.toBe(tree);
    });

    test('Array', () => {
        const tree = [1, 'hello'];
        const patch = {};

        const updatedTree = applyPatch(tree, patch);

        expect(updatedTree).toEqual(tree);
        expect(updatedTree).not.toBe(tree);
    });

    test('Map', () => {
        const tree = new Map<any, any>([
            [1, 'hello'],
            ['bye', 2],
        ]);
        const patch = {};

        const updatedTree = applyPatch(tree, patch);

        expect(updatedTree).toEqual(tree);
        expect(updatedTree).not.toBe(tree);
    });

    test('Set', () => {
        const tree2 = new Set<any>([1, 'hello']);
        const patch = {};

        const updatedTree = applyPatch(tree2, patch);

        expect(updatedTree).toEqual(tree2);
        expect(updatedTree).not.toBe(tree2);
    });
});

describe('modifying root', () => {
    describe('Object', () => {
        test('set new fields', () => {
            const tree: Record<string, any> = {};
            const patch = {
                s: new Map([
                    ['a', 1],
                    ['B', 2],
                ]),
            };

            const updatedTree = applyPatch(tree, patch);

            expect(updatedTree).not.toBe(tree);
            expect(updatedTree).toEqual({
                a: 1,
                B: 2,
            });
        });

        test('set existing fields', () => {
            const tree: Record<string, any> = {
                a: 1,
                B: 2,
            };
            const patch = {
                s: new Map([
                    ['a', 3],
                    ['B', 4],
                ]),
            };

            const updatedTree = applyPatch(tree, patch);

            expect(updatedTree).not.toBe(tree);
            expect(updatedTree).toEqual({
                a: 3,
                B: 4,
            });
        });

        test('delete existing fields', () => {
            const tree: Record<string, any> = {
                a: 1,
                B: 2,
                c: 3,
                D: 4,
            };
            const patch = {
                d: new Set(['a', 'c']),
            };

            const updatedTree = applyPatch(tree, patch);

            expect(updatedTree).not.toBe(tree);
            expect(updatedTree).toEqual({
                B: 2,
                D: 4,
            });
        });

        test('delete non-existing fields', () => {
            const tree: Record<string, any> = {
                a: 1,
                B: 2,
            };
            const patch = {
                d: new Set(['C', 'd']),
            };

            const updatedTree = applyPatch(tree, patch);

            expect(updatedTree).not.toBe(tree);
            expect(updatedTree).toEqual({
                a: 1,
                B: 2,
            });
        });
    });
    describe('Array', () => {
        test('set on empty', () => {
            const tree: string[] = [];

            const patch: ArrayPatch = {
                o: [
                    {
                        o: ArrayOperationType.Set,
                        i: 0,
                        v: 'hello',
                    },
                    {
                        o: ArrayOperationType.Set,
                        i: 1,
                        v: 'world',
                    }
                ]
            };

            const updatedTree = applyPatch(tree, patch);

            expect(updatedTree).not.toBe(tree);
            expect(updatedTree).toEqual(['hello', 'world']);
        });

        test('set on existing', () => {
            const tree: string[] = ['existing'];

            const patch: ArrayPatch = {
                o: [
                    {
                        o: ArrayOperationType.Set,
                        i: 0,
                        v: 'hello',
                    },
                    {
                        o: ArrayOperationType.Set,
                        i: 1,
                        v: 'world',
                    }
                ]
            };

            const updatedTree = applyPatch(tree, patch);

            expect(updatedTree).not.toBe(tree);
            expect(updatedTree).toEqual(['hello', 'world']);
        });
        
        test('set with gap', () => {
            const tree: string[] = [];

            const patch: ArrayPatch = {
                o: [
                    {
                        o: ArrayOperationType.Set,
                        i: 0,
                        v: 'hello',
                    },
                    {
                        o: ArrayOperationType.Set,
                        i: 2,
                        v: 'world',
                    }
                ]
            };

            const updatedTree = applyPatch(tree, patch);

            expect(updatedTree).not.toBe(tree);
            expect(updatedTree).toEqual(['hello', undefined, 'world']);
        });
        
        test('delete on empty', () => {
            const tree: string[] = [];

            const patch: ArrayPatch = {
                o: [
                    {
                        o: ArrayOperationType.Delete,
                        i: 0,
                    },
                ]
            };

            const updatedTree = applyPatch(tree, patch);

            expect(updatedTree).not.toBe(tree);
            expect(updatedTree).toEqual([]);
        });

        test('delete on existing', () => {
            const tree: string[] = ['hello', 'world'];

            const patch: ArrayPatch = {
                o: [
                    {
                        o: ArrayOperationType.Delete,
                        i: 1,
                    },
                ]
            };

            const updatedTree = applyPatch(tree, patch);

            expect(updatedTree).not.toBe(tree);
            expect(updatedTree).toEqual(['hello', undefined]);
        });

        test('delete in middle', () => {
            const tree: string[] = ['hello', 'there', 'world'];

            const patch: ArrayPatch = {
                o: [
                    {
                        o: ArrayOperationType.Delete,
                        i: 1,
                    },
                ]
            };

            const updatedTree = applyPatch(tree, patch);

            expect(updatedTree).not.toBe(tree);
            expect(updatedTree).toEqual(['hello', undefined, 'world']);
        });
        
        // TODO: combined test of other array operations
    });

    describe('Map', () => {
        test('set new fields', () => {
            const tree = new Map<string, any>();
            const patch = {
                s: new Map([
                    ['a', 1],
                    ['B', 2],
                ]),
            };

            const updatedTree = applyPatch(tree, patch);

            expect(updatedTree).not.toBe(tree);
            expect(updatedTree).toEqual(
                new Map([
                    ['a', 1],
                    ['B', 2],
                ]),
            );
        });

        test('set existing fields', () => {
            const tree = new Map([
                ['a', 1],
                ['B', 2],
            ]);
            const patch = {
                s: new Map([
                    ['a', 3],
                    ['B', 4],
                ]),
            };

            const updatedTree = applyPatch(tree, patch);

            expect(updatedTree).not.toBe(tree);
            expect(updatedTree).toEqual(
                new Map([
                    ['a', 3],
                    ['B', 4],
                ]),
            );
        });

        test('delete existing fields', () => {
            const tree = new Map([
                ['a', 1],
                ['B', 2],
                ['c', 3],
                ['D', 4],
            ]);
            const patch = {
                d: new Set(['a', 'c']),
            };

            const updatedTree = applyPatch(tree, patch);

            expect(updatedTree).not.toBe(tree);
            expect(updatedTree).toEqual(
                new Map([
                    ['B', 2],
                    ['D', 4],
                ]),
            );
        });

        test('delete non-existing fields', () => {
            const tree = new Map([
                ['a', 1],
                ['B', 2],
            ]);
            const patch = {
                d: new Set(['C', 'd']),
            };

            const updatedTree = applyPatch(tree, patch);

            expect(updatedTree).not.toBe(tree);
            expect(updatedTree).toEqual(
                new Map([
                    ['a', 1],
                    ['B', 2],
                ]),
            );
        });
    });

    describe('Set', () => {
        test('set new fields', () => {
            const tree = new Set();
            const patch = {
                a: new Set(['A', 'b', 1]),
            };

            const updatedTree = applyPatch(tree, patch);

            expect(updatedTree).not.toBe(tree);
            expect(updatedTree).not.toBe(patch.a);
            expect(updatedTree).toEqual(new Set(['A', 'b', 1]));
        });

        test('set existing fields', () => {
            const tree = new Set(['A', 'b', 1]);
            const patch = {
                a: new Set(['A', 'b', 1]),
            };

            const updatedTree = applyPatch(tree, patch);

            expect(updatedTree).not.toBe(tree);
            expect(updatedTree).not.toBe(patch.a);
            expect(updatedTree).toEqual(new Set(['A', 'b', 1]));
        });

        test('delete existing fields', () => {
            const tree = new Set(['A', 'b', 1]);
            const patch = {
                d: new Set(['A', 1]),
            };

            const updatedTree = applyPatch(tree, patch);

            expect(updatedTree).not.toBe(tree);
            expect(updatedTree).toEqual(new Set(['b']));
        });

        test('delete non-existing fields', () => {
            const tree = new Set(['A', 'b', 1]);
            const patch = {
                d: new Set(['C', 2]),
            };

            const updatedTree = applyPatch(tree, patch);

            expect(updatedTree).not.toBe(tree);
            expect(updatedTree).toEqual(new Set(['A', 'b', 1]));
        });
    });
});

// TODO: more "unit" tests, less "lots of things at once" tests.

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
        s: new Map<string, any>([
            ['a', 1],
            ['b', '2'],
        ]),
        d: new Set(['x']),
        c: new Map<string, Patch>([
            [
                'child',
                {
                    s: new Map([['c', '3']]),
                    d: new Set(['y']),
                    c: new Map<MapKey, Patch>([
                        [
                            'grandchild',
                            {
                                s: new Map([['greatgrandchild', { d: 4 }]]),
                                d: new Set(['z']),
                            },
                        ],
                    ]),
                },
            ],
        ]),
    };

    const newTree = applyPatch(tree, patch);

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
        s: new Map<MapKey, any>([
            [
                'a',
                new Map<any, any>([
                    ['x', 1],
                    ['y', 2],
                    ['z', '3'],
                ]),
            ],
            ['b', new Set([1, 2, 4, 8])],
            [
                'c',
                new Map<string | number, any>([
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
            ],
        ]),
    };

    const newTree = applyPatch(tree, patch);

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
        c: new Map<MapKey, Patch>([
            [
                'a',
                {
                    s: new Map<MapKey, any>([
                        ['d', 4],
                        [4, 'D'],
                    ]),
                    d: new Set(['a', 'b', 2, 3]),
                },
            ],
            [
                'b',
                {
                    s: new Map<MapKey, any>([
                        ['d', 4],
                        [4, 'D'],
                    ]),
                },
            ],
            [
                'c',
                {
                    d: new Set(['a', 'b', 2, 3]),
                },
            ],
            [
                'd',
                {
                    s: new Map<MapKey, any>([
                        ['d', 4],
                        [4, 'D'],
                    ]),
                    d: true,
                },
            ],
            [
                'e',
                {
                    c: new Map<MapKey, Patch>([
                        [
                            'x',
                            {
                                s: new Map<MapKey, any>([
                                    ['d', 4],
                                    [4, 'D'],
                                ]),
                                d: new Set(['a', 'b', 2, 3]),
                            },
                        ],
                        [
                            9,
                            {
                                s: new Map<MapKey, any>([
                                    ['d', 4],
                                    [4, 'D'],
                                ]),
                                d: new Set(['a', 'b', 2, 3]),
                            },
                        ],
                    ]),
                },
            ],
        ]),
    };

    const newTree = applyPatch(tree, patch);

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
        c: new Map<MapKey, Patch>([
            [
                'a',
                {
                    a: new Set(['a', 4, 5]),
                    d: new Set([2, 3]),
                },
            ],
            [
                'b',
                {
                    a: new Set(['a', 4, 5]),
                    d: true,
                },
            ],
        ]),
    };

    const newTree = applyPatch(tree, patch);

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
        s: new Map<string, any>([['a', new Date(2020, 11, 31)]]),
        c: new Map<string, Patch>([
            [
                'child',
                {
                    s: new Map([['b', new Date(2021, 0, 0, 12, 0, 0)]]),
                },
            ],
        ]),
    };

    const newTree = applyPatch(tree, patch);

    expect(newTree).toEqual({
        a: new Date(2020, 11, 31),
        child: {
            b: new Date(2021, 0, 0, 12, 0, 0),
        },
    });
});

import { describe, expect, test } from 'vitest';
import { applyPatch } from './applyPatch';
import { recordPatch } from './recordPatch';
import { MapKey } from './Patch';

describe('no changes: patch is empty', () => {
    test('Object', () => {
        const tree = { x: 1, y: 'hello' };

        const { getPatch } = recordPatch(tree);
        const patch = getPatch();

        expect(patch).toEqual({});
    });

    test('Array', () => {
        const tree = [1, 'hello'];

        const { getPatch } = recordPatch(tree);
        const patch = getPatch();

        expect(patch).toEqual({});
    });

    test('Map', () => {
        const tree1 = new Map<any, any>([
            [1, 'hello'],
            ['bye', 2],
        ]);

        const { getPatch } = recordPatch(tree1);
        const patch = getPatch();

        expect(patch).toEqual({});
    });

    test('Set', () => {
        const tree1 = new Set<any>([1, 'hello']);

        const { getPatch } = recordPatch(tree1);
        const patch = getPatch();

        expect(patch).toEqual({});
    });
});

describe('modifying root', () => {
    describe('Object', () => {
        test('set new fields', () => {
            const tree: Record<string, any> = {};

            const { proxy, getPatch } = recordPatch(tree);

            proxy.a = 1;
            proxy.B = 'hello';

            expect(tree).toEqual({
                a: 1,
                B: 'hello',
            });

            const patch = getPatch();

            expect(patch).toEqual({
                s: new Map<MapKey, any>([
                    ['a', 1],
                    ['B', 'hello'],
                ]),
            });
        });

        test('set existing fields', () => {
            const tree: Record<string, any> = {
                a: 1,
                B: 2,
            };

            const { proxy, getPatch } = recordPatch(tree);

            proxy.a = 2;
            proxy.B = 'hello';

            expect(tree).toEqual({
                a: 2,
                B: 'hello',
            });

            const patch = getPatch();

            expect(patch).toEqual({
                s: new Map<MapKey, any>([
                    ['a', 2],
                    ['B', 'hello'],
                ]),
            });
        });

        test('delete existing fields', () => {
            const tree: Record<string, any> = {
                a: 1,
                B: 2,
                c: 3,
                D: 4,
            };

            const { proxy, getPatch } = recordPatch(tree);

            delete proxy.B;
            delete proxy.D;

            expect(tree).toEqual({
                a: 1,
                c: 3,
            });

            const patch = getPatch();

            expect(patch).toEqual({
                d: new Set(['B', 'D']),
            });
        });

        test('delete non-existing fields', () => {
            const tree: Record<string, any> = {
                a: 1,
                B: 2,
            };

            const { proxy, getPatch } = recordPatch(tree);

            delete proxy.c;
            delete proxy.D;

            expect(tree).toEqual({
                a: 1,
                B: 2,
            });

            const patch = getPatch();

            expect(patch).toEqual({
                d: new Set(['c', 'D']),
            });
        });
    });
    /*
    describe('Array', () => {
        const tree1: any[] = [];
        const tree2: any[] = [];

        const { proxy, getPatch } = recordPatch(tree1);

        proxy.push('hi');
        proxy.push('there');
        proxy.push({ what: 'up' });

        proxy.splice(1, 1);

        proxy.push('hey');
        proxy[1].hello = 'there';

        expect(tree1).toEqual([
            'hi',
            {
                what: 'up',
                hello: 'there',
            },
            'hey',
        ]);

        const patch = getPatch();
        const updatedTree = applyPatch(tree2, patch);

        expect(updatedTree).toEqual(tree1);
        expect(updatedTree).not.toBe(tree1);
        expect(updatedTree).not.toEqual(tree2);
        expect(updatedTree).not.toBe(tree2);
    });
    */
    describe('Map', () => {
        test('set new fields', () => {
            const tree = new Map<string, any>();

            const { proxy, getPatch } = recordPatch(tree);

            proxy.set('a', 1);
            proxy.set('B', 'hello');

            expect(tree).toEqual(
                new Map<MapKey, any>([
                    ['a', 1],
                    ['B', 'hello'],
                ]),
            );

            const patch = getPatch();

            expect(patch).toEqual({
                s: new Map<MapKey, any>([
                    ['a', 1],
                    ['B', 'hello'],
                ]),
            });
        });

        test('set existing fields', () => {
            const tree = new Map<MapKey, any>([
                ['a', 1],
                ['B', 2],
            ]);

            const { proxy, getPatch } = recordPatch(tree);

            proxy.set('a', 2);
            proxy.set('B', 'hello');

            expect(tree).toEqual(
                new Map<MapKey, any>([
                    ['a', 2],
                    ['B', 'hello'],
                ]),
            );

            const patch = getPatch();

            expect(patch).toEqual({
                s: new Map<MapKey, any>([
                    ['a', 2],
                    ['B', 'hello'],
                ]),
            });
        });

        test('delete existing fields', () => {
            const tree = new Map<string, any>([
                ['a', 1],
                ['B', 2],
                ['c', 3],
                ['D', 4],
            ]);

            const { proxy, getPatch } = recordPatch(tree);

            proxy.delete('B');
            proxy.delete('D');

            expect(tree).toEqual(
                new Map<string, any>([
                    ['a', 1],
                    ['c', 3],
                ]),
            );

            const patch = getPatch();

            expect(patch).toEqual({
                d: new Set(['B', 'D']),
            });
        });

        test('delete non-existing fields', () => {
            const tree = new Map<string, any>([
                ['a', 1],
                ['B', 2],
            ]);

            const { proxy, getPatch } = recordPatch(tree);

            proxy.delete('c');
            proxy.delete('D');

            expect(tree).toEqual(
                new Map<string, any>([
                    ['a', 1],
                    ['B', 2],
                ]),
            );

            const patch = getPatch();

            expect(patch).toEqual({
                d: new Set(['c', 'D']),
            });
        });
    });
    
    describe('Set', () => {
        test('set new fields', () => {
            const tree = new Set();

            const { proxy, getPatch } = recordPatch(tree);

            proxy.add('A');
            proxy.add('b');
            proxy.add(1);

            expect(tree).toEqual(
                new Set(['A', 'b', 1]),
            );

            const patch = getPatch();

            expect(patch).toEqual({
                a: new Set(['A', 'b', 1]),
            });
        });

        test('set existing fields', () => {
            const tree = new Set(['A', 'b', 1]);

            const { proxy, getPatch } = recordPatch(tree);

            proxy.add('A');
            proxy.add('b');
            proxy.add(1);

            expect(tree).toEqual(
                new Set(['A', 'b', 1]),
            );

            const patch = getPatch();

            expect(patch).toEqual({
                a: new Set(['A', 'b', 1]),
            });
        });

        test('delete existing fields', () => {
            const tree = new Set(['A', 'b', 1]);

            const { proxy, getPatch } = recordPatch(tree);

            proxy.delete('A');
            proxy.delete(1);

            expect(tree).toEqual(
                new Set(['b']),
            );

            const patch = getPatch();

            expect(patch).toEqual({
                d: new Set(['A', 1]),
            });
        });

        test('delete non-existing fields', () => {
            const tree = new Set(['A', 'b', 1]);

            const { proxy, getPatch } = recordPatch(tree);

            proxy.delete('C');
            proxy.delete(2);

            expect(tree).toEqual(
                new Set(['A', 'b', 1])
            );

            const patch = getPatch();

            expect(patch).toEqual({
                d: new Set(['C', 2]),
            });
        });
    });
});

describe('modifying child', () => {
    test('object in object', () => {
        const tree1: Record<string, any> = { child: {} };
        const tree2: Record<string, any> = { child: {} };

        const { proxy, getPatch } = recordPatch(tree1);

        proxy.child.w = 1;
        proxy.child.x = { something: 'else' };
        proxy.child.y = 2;
        proxy.child.w = 3;
        proxy.child.z = 'hello';
        delete proxy.child.y;

        expect(tree1).toEqual({
            child: {
                w: 3,
                x: { something: 'else' },
                z: 'hello',
            },
        });

        const patch = getPatch();
        const updatedTree = applyPatch(tree2, patch);

        expect(updatedTree).toEqual(tree1);
        expect(updatedTree).not.toBe(tree1);
        expect(updatedTree).not.toEqual(tree2);
        expect(updatedTree).not.toBe(tree2);
    });

    test('array in array', () => {
        const tree1: any[] = [[]];
        const tree2: any[] = [[]];

        const { proxy, getPatch } = recordPatch(tree1);

        proxy[0].push('hi');
        proxy[0].push('there');
        proxy[0].push({ what: 'up' });

        proxy[0].splice(1, 1);

        proxy[0].push('hey');
        proxy[0][1].hello = 'there';

        expect(tree1).toEqual([
            [
                'hi',
                {
                    what: 'up',
                    hello: 'there',
                },
                'hey',
            ],
        ]);

        const patch = getPatch();
        const updatedTree = applyPatch(tree2, patch);

        expect(updatedTree).toEqual(tree1);
        expect(updatedTree).not.toBe(tree1);
        expect(updatedTree).not.toEqual(tree2);
        expect(updatedTree).not.toBe(tree2);
    });

    test('array in object', () => {
        const tree1: Record<string, any> = { child: [] };
        const tree2: Record<string, any> = { child: [] };

        const { proxy, getPatch } = recordPatch(tree1);

        proxy.child.push('hi');
        proxy.child.push('there');
        proxy.child.push({ what: 'up' });

        proxy.child.splice(1, 1);

        proxy.child.push('hey');
        proxy.child[1].hello = 'there';

        expect(tree1).toEqual({
            child: [
                'hi',
                {
                    what: 'up',
                    hello: 'there',
                },
                'hey',
            ],
        });

        const patch = getPatch();
        const updatedTree = applyPatch(tree2, patch);

        expect(updatedTree).toEqual(tree1);
        expect(updatedTree).not.toBe(tree1);
        expect(updatedTree).not.toEqual(tree2);
        expect(updatedTree).not.toBe(tree2);
    });

    test('object in array', () => {
        const tree1: Record<string, any> = [{}];
        const tree2: Record<string, any> = [{}];

        const { proxy, getPatch } = recordPatch(tree1);

        proxy[0].w = 1;
        proxy[0].x = { something: 'else' };
        proxy[0].y = 2;
        proxy[0].w = 3;
        proxy[0].z = 'hello';
        delete proxy[0].y;

        expect(tree1).toEqual([
            {
                w: 3,
                x: { something: 'else' },
                z: 'hello',
            },
        ]);

        const patch = getPatch();
        const updatedTree = applyPatch(tree2, patch);

        expect(updatedTree).toEqual(tree1);
        expect(updatedTree).not.toBe(tree1);
        expect(updatedTree).not.toEqual(tree2);
        expect(updatedTree).not.toBe(tree2);
    });

    test('Map in object', () => {
        const tree1: Record<string, any> = { m: new Map() };
        const tree2: Record<string, any> = { m: new Map() };

        const { proxy, getPatch } = recordPatch(tree1);

        proxy.m.set('a', 1);
        proxy.m.set(2, 'b');
        proxy.m.set(2, 'c');
        proxy.m.set('c', { hi: 'hey' });
        proxy.m.delete('a');
        proxy.m.get('c').ha = 'ha';

        expect(tree1.m.get(2)).toEqual('c');
        expect(proxy.m.get(2)).toEqual('c');

        expect(tree1).toEqual({
            m: new Map<any, any>([
                [2, 'c'],
                ['c', { hi: 'hey', ha: 'ha' }],
            ]),
        });

        const patch = getPatch();
        const updatedTree = applyPatch(tree2, patch);

        expect(updatedTree).toEqual(tree1);
        expect(updatedTree).not.toBe(tree1);
        expect(updatedTree).not.toEqual(tree2);
        expect(updatedTree).not.toBe(tree2);

        expect(tree2).toEqual({ m: new Map() });
    });

    test('object in Map', () => {
        const tree1: Map<number, Record<string, any>> = new Map([[1, {}]]);
        const tree2: Map<number, Record<string, any>> = new Map([[1, {}]]);

        const { proxy, getPatch } = recordPatch(tree1);

        proxy.get(1)!.w = 1;
        proxy.get(1)!.x = { something: 'else' };
        proxy.get(1)!.y = 2;
        proxy.get(1)!.w = 3;
        proxy.get(1)!.z = 'hello';
        delete proxy.get(1)!.y;

        expect(tree1).toEqual(
            new Map([
                [
                    1,
                    {
                        w: 3,
                        x: { something: 'else' },
                        z: 'hello',
                    },
                ],
            ]),
        );

        const patch = getPatch();
        const updatedTree = applyPatch(tree2, patch);

        expect(updatedTree).toEqual(tree1);
        expect(updatedTree).not.toBe(tree1);
        expect(updatedTree).not.toEqual(tree2);
        expect(updatedTree).not.toBe(tree2);
    });

    test('Map in Map', () => {
        const tree1: Record<string, any> = new Map([[1, new Map()]]);
        const tree2: Record<string, any> = new Map([[1, new Map()]]);

        const { proxy, getPatch } = recordPatch(tree1);

        proxy.get(1).set('a', 1);
        proxy.get(1).set(2, 'b');
        proxy.get(1).set(2, 'c');
        proxy.get(1).set('c', { hi: 'hey' });
        proxy.get(1).delete('a');
        proxy.get(1).get('c').ha = 'ha';

        expect(tree1.get(1).get(2)).toEqual('c');
        expect(proxy.get(1).get(2)).toEqual('c');

        expect(tree1).toEqual(
            new Map([
                [
                    1,
                    new Map<any, any>([
                        [2, 'c'],
                        ['c', { hi: 'hey', ha: 'ha' }],
                    ]),
                ],
            ]),
        );

        const patch = getPatch();
        const updatedTree = applyPatch(tree2, patch);

        expect(updatedTree).toEqual(tree1);
        expect(updatedTree).not.toBe(tree1);
        expect(updatedTree).not.toEqual(tree2);
        expect(updatedTree).not.toBe(tree2);

        expect(tree2).toEqual(new Map([[1, new Map()]]));
    });

    test('Map in array', () => {
        const tree1: Record<string, any> = [new Map()];
        const tree2: Record<string, any> = [new Map()];

        const { proxy, getPatch } = recordPatch(tree1);

        proxy[0].set('a', 1);
        proxy[0].set(2, 'b');
        proxy[0].set(2, 'c');
        proxy[0].set('c', { hi: 'hey' });
        proxy[0].delete('a');
        proxy[0].get('c').ha = 'ha';

        expect(tree1[0].get(2)).toEqual('c');
        expect(proxy[0].get(2)).toEqual('c');

        expect(tree1).toEqual([
            new Map<any, any>([
                [2, 'c'],
                ['c', { hi: 'hey', ha: 'ha' }],
            ]),
        ]);

        const patch = getPatch();
        const updatedTree = applyPatch(tree2, patch);

        expect(updatedTree).toEqual(tree1);
        expect(updatedTree).not.toBe(tree1);
        expect(updatedTree).not.toEqual(tree2);
        expect(updatedTree).not.toBe(tree2);

        expect(tree2).toEqual([new Map()]);
    });

    test('array in Map', () => {
        const tree1: Map<string, any[]> = new Map([['a', []]]);
        const tree2: Map<string, any[]> = new Map([['a', []]]);

        const { proxy, getPatch } = recordPatch(tree1);

        proxy.get('a')!.push('hi');
        proxy.get('a')!.push('there');
        proxy.get('a')!.push({ what: 'up' });

        proxy.get('a')!.splice(1, 1);

        proxy.get('a')!.push('hey');
        proxy.get('a')![1].hello = 'there';

        expect(tree1).toEqual(
            new Map([
                [
                    'a',
                    [
                        'hi',
                        {
                            what: 'up',
                            hello: 'there',
                        },
                        'hey',
                    ],
                ],
            ]),
        );

        const patch = getPatch();
        const updatedTree = applyPatch(tree2, patch);

        expect(updatedTree).toEqual(tree1);
        expect(updatedTree).not.toBe(tree1);
        expect(updatedTree).not.toEqual(tree2);
        expect(updatedTree).not.toBe(tree2);
    });

    test('Set in object', () => {
        const tree1 = { child: new Set<any>() };
        const tree2 = { child: new Set<any>() };

        const { proxy, getPatch } = recordPatch(tree1);

        proxy.child.add('a');
        proxy.child.add('b');
        proxy.child.add(3);
        proxy.child.delete('b');

        expect(tree1).toEqual({ child: new Set(['a', 3]) });

        const patch = getPatch();
        const updatedTree = applyPatch(tree2, patch);

        expect(updatedTree).toEqual(tree1);
        expect(updatedTree).not.toBe(tree1);
        expect(updatedTree).not.toEqual(tree2);
        expect(updatedTree).not.toBe(tree2);

        expect(tree2).toEqual({ child: new Set<any>() });
    });

    test('Set in array', () => {
        const tree1 = [new Set<any>()];
        const tree2 = [new Set<any>()];

        const { proxy, getPatch } = recordPatch(tree1);

        proxy[0].add('a');
        proxy[0].add('b');
        proxy[0].add(3);
        proxy[0].delete('b');

        expect(tree1).toEqual([new Set(['a', 3])]);

        const patch = getPatch();
        const updatedTree = applyPatch(tree2, patch);

        expect(updatedTree).toEqual(tree1);
        expect(updatedTree).not.toBe(tree1);
        expect(updatedTree).not.toEqual(tree2);
        expect(updatedTree).not.toBe(tree2);

        expect(tree2).toEqual([new Set<any>()]);
    });

    test('Set in Map', () => {
        const tree1 = new Map([['a', new Set<any>()]]);
        const tree2 = new Map([['a', new Set<any>()]]);

        const { proxy, getPatch } = recordPatch(tree1);

        proxy.get('a')!.add('a');
        proxy.get('a')!.add('b');
        proxy.get('a')!.add(3);
        proxy.get('a')!.delete('b');

        expect(tree1).toEqual(new Map([['a', new Set(['a', 3])]]));

        const patch = getPatch();
        const updatedTree = applyPatch(tree2, patch);

        expect(updatedTree).toEqual(tree1);
        expect(updatedTree).not.toBe(tree1);
        expect(updatedTree).not.toEqual(tree2);
        expect(updatedTree).not.toBe(tree2);

        expect(tree2).toEqual(new Map([['a', new Set<any>()]]));
    });
});

describe('modifying grandchild', () => {
    test('object in object in object', () => {
        const tree1: Record<number, Record<string, any>> = { 1: { child: {} } };
        const tree2: Record<number, Record<string, any>> = { 1: { child: {} } };

        const { proxy, getPatch } = recordPatch(tree1);

        proxy[1].child.w = 1;
        proxy[1].child.x = { something: 'else' };
        proxy[1].child.y = 2;
        proxy[1].child.w = 3;
        proxy[1].child.z = 'hello';
        delete proxy[1].child.y;

        expect(tree1).toEqual({
            1: {
                child: {
                    w: 3,
                    x: { something: 'else' },
                    z: 'hello',
                },
            },
        });

        const patch = getPatch();
        const updatedTree = applyPatch(tree2, patch);

        expect(updatedTree).toEqual(tree1);
        expect(updatedTree).not.toBe(tree1);
        expect(updatedTree).not.toEqual(tree2);
        expect(updatedTree).not.toBe(tree2);
    });

    test('array in array in object', () => {
        const tree1: Record<number, any[]> = { 1: [[]] };
        const tree2: Record<number, any[]> = { 1: [[]] };

        const { proxy, getPatch } = recordPatch(tree1);

        proxy[1][0].push('hi');
        proxy[1][0].push('there');
        proxy[1][0].push({ what: 'up' });

        proxy[1][0].splice(1, 1);

        proxy[1][0].push('hey');
        proxy[1][0][1].hello = 'there';

        expect(tree1).toEqual({
            1: [
                [
                    'hi',
                    {
                        what: 'up',
                        hello: 'there',
                    },
                    'hey',
                ],
            ],
        });

        const patch = getPatch();
        const updatedTree = applyPatch(tree2, patch);

        expect(updatedTree).toEqual(tree1);
        expect(updatedTree).not.toBe(tree1);
        expect(updatedTree).not.toEqual(tree2);
        expect(updatedTree).not.toBe(tree2);
    });

    test('array in object in object', () => {
        const tree1: Record<number, Record<string, any>> = { 1: { child: [] } };
        const tree2: Record<number, Record<string, any>> = { 1: { child: [] } };

        const { proxy, getPatch } = recordPatch(tree1);

        proxy[1].child.push('hi');
        proxy[1].child.push('there');
        proxy[1].child.push({ what: 'up' });

        proxy[1].child.splice(1, 1);

        proxy[1].child.push('hey');
        proxy[1].child[1].hello = 'there';

        expect(tree1).toEqual({
            1: {
                child: [
                    'hi',
                    {
                        what: 'up',
                        hello: 'there',
                    },
                    'hey',
                ],
            },
        });

        const patch = getPatch();
        const updatedTree = applyPatch(tree2, patch);

        expect(updatedTree).toEqual(tree1);
        expect(updatedTree).not.toBe(tree1);
        expect(updatedTree).not.toEqual(tree2);
        expect(updatedTree).not.toBe(tree2);
    });

    test('object in array in object', () => {
        const tree1: Record<string, any> = { child: [{}] };
        const tree2: Record<string, any> = { child: [{}] };

        const { proxy, getPatch } = recordPatch(tree1);

        proxy.child[0].w = 1;
        proxy.child[0].x = { something: 'else' };
        proxy.child[0].y = 2;
        proxy.child[0].w = 3;
        proxy.child[0].z = 'hello';
        delete proxy.child[0].y;

        expect(tree1).toEqual({
            child: [
                {
                    w: 3,
                    x: { something: 'else' },
                    z: 'hello',
                },
            ],
        });

        const patch = getPatch();
        const updatedTree = applyPatch(tree2, patch);

        expect(updatedTree).toEqual(tree1);
        expect(updatedTree).not.toBe(tree1);
        expect(updatedTree).not.toEqual(tree2);
        expect(updatedTree).not.toBe(tree2);
    });

    test('Map in object in object', () => {
        const tree1: Record<string, any> = { child: { m: new Map() } };
        const tree2: Record<string, any> = { child: { m: new Map() } };

        const { proxy, getPatch } = recordPatch(tree1);

        proxy.child.m.set('a', 1);
        proxy.child.m.set(2, 'b');
        proxy.child.m.set(2, 'c');
        proxy.child.m.set('c', { hi: 'hey' });
        proxy.child.m.delete('a');
        proxy.child.m.get('c').ha = 'ha';

        expect(tree1.child.m.get(2)).toEqual('c');
        expect(proxy.child.m.get(2)).toEqual('c');

        expect(tree1).toEqual({
            child: {
                m: new Map<any, any>([
                    [2, 'c'],
                    ['c', { hi: 'hey', ha: 'ha' }],
                ]),
            },
        });

        const patch = getPatch();
        const updatedTree = applyPatch(tree2, patch);

        expect(updatedTree).toEqual(tree1);
        expect(updatedTree).not.toBe(tree1);
        expect(updatedTree).not.toEqual(tree2);
        expect(updatedTree).not.toBe(tree2);

        expect(tree2).toEqual({ child: { m: new Map() } });
    });

    test('object in Map in object', () => {
        const tree1: Record<string, Map<number, Record<string, any>>> = {
            child: new Map([[1, {}]]),
        };
        const tree2: Record<string, Map<number, Record<string, any>>> = {
            child: new Map([[1, {}]]),
        };

        const { proxy, getPatch } = recordPatch(tree1);

        proxy.child.get(1)!.w = 1;
        proxy.child.get(1)!.x = { something: 'else' };
        proxy.child.get(1)!.y = 2;
        proxy.child.get(1)!.w = 3;
        proxy.child.get(1)!.z = 'hello';
        delete proxy.child.get(1)!.y;

        expect(tree1).toEqual({
            child: new Map([
                [
                    1,
                    {
                        w: 3,
                        x: { something: 'else' },
                        z: 'hello',
                    },
                ],
            ]),
        });

        const patch = getPatch();
        const updatedTree = applyPatch(tree2, patch);

        expect(updatedTree).toEqual(tree1);
        expect(updatedTree).not.toBe(tree1);
        expect(updatedTree).not.toEqual(tree2);
        expect(updatedTree).not.toBe(tree2);
    });

    test('Map in Map in object', () => {
        const tree1: Record<string, any> = { child: new Map([[1, new Map()]]) };
        const tree2: Record<string, any> = { child: new Map([[1, new Map()]]) };

        const { proxy, getPatch } = recordPatch(tree1);

        proxy.child.get(1).set('a', 1);
        proxy.child.get(1).set(2, 'b');
        proxy.child.get(1).set(2, 'c');
        proxy.child.get(1).set('c', { hi: 'hey' });
        proxy.child.get(1).delete('a');
        proxy.child.get(1).get('c').ha = 'ha';

        expect(tree1.child.get(1).get(2)).toEqual('c');
        expect(proxy.child.get(1).get(2)).toEqual('c');

        expect(tree1).toEqual({
            child: new Map([
                [
                    1,
                    new Map<any, any>([
                        [2, 'c'],
                        ['c', { hi: 'hey', ha: 'ha' }],
                    ]),
                ],
            ]),
        });

        const patch = getPatch();
        const updatedTree = applyPatch(tree2, patch);

        expect(updatedTree).toEqual(tree1);
        expect(updatedTree).not.toBe(tree1);
        expect(updatedTree).not.toEqual(tree2);
        expect(updatedTree).not.toBe(tree2);

        expect(tree2).toEqual({ child: new Map([[1, new Map()]]) });
    });

    test('Map in array in object', () => {
        const tree1: Record<string, any> = { child: [new Map()] };
        const tree2: Record<string, any> = { child: [new Map()] };

        const { proxy, getPatch } = recordPatch(tree1);

        proxy.child[0].set('a', 1);
        proxy.child[0].set(2, 'b');
        proxy.child[0].set(2, 'c');
        proxy.child[0].set('c', { hi: 'hey' });
        proxy.child[0].delete('a');
        proxy.child[0].get('c').ha = 'ha';

        expect(tree1.child[0].get(2)).toEqual('c');
        expect(proxy.child[0].get(2)).toEqual('c');

        expect(tree1).toEqual({
            child: [
                new Map<any, any>([
                    [2, 'c'],
                    ['c', { hi: 'hey', ha: 'ha' }],
                ]),
            ],
        });

        const patch = getPatch();
        const updatedTree = applyPatch(tree2, patch);

        expect(updatedTree).toEqual(tree1);
        expect(updatedTree).not.toBe(tree1);
        expect(updatedTree).not.toEqual(tree2);
        expect(updatedTree).not.toBe(tree2);

        expect(tree2).toEqual({ child: [new Map()] });
    });

    test('array in Map in object', () => {
        const tree1: Record<string, Map<string, any[]>> = {
            child: new Map([['a', []]]),
        };
        const tree2: Record<string, Map<string, any[]>> = {
            child: new Map([['a', []]]),
        };

        const { proxy, getPatch } = recordPatch(tree1);

        proxy.child.get('a')!.push('hi');
        proxy.child.get('a')!.push('there');
        proxy.child.get('a')!.push({ what: 'up' });

        proxy.child.get('a')!.splice(1, 1);

        proxy.child.get('a')!.push('hey');
        proxy.child.get('a')![1].hello = 'there';

        expect(tree1).toEqual({
            child: new Map([
                [
                    'a',
                    [
                        'hi',
                        {
                            what: 'up',
                            hello: 'there',
                        },
                        'hey',
                    ],
                ],
            ]),
        });

        const patch = getPatch();
        const updatedTree = applyPatch(tree2, patch);

        expect(updatedTree).toEqual(tree1);
        expect(updatedTree).not.toBe(tree1);
        expect(updatedTree).not.toEqual(tree2);
        expect(updatedTree).not.toBe(tree2);
    });

    test('Set in object in object', () => {
        const tree1 = { child: { child: new Set<any>() } };
        const tree2 = { child: { child: new Set<any>() } };

        const { proxy, getPatch } = recordPatch(tree1);

        proxy.child.child.add('a');
        proxy.child.child.add('b');
        proxy.child.child.add(3);
        proxy.child.child.delete('b');

        expect(tree1).toEqual({ child: { child: new Set(['a', 3]) } });

        const patch = getPatch();
        const updatedTree = applyPatch(tree2, patch);

        expect(updatedTree).toEqual(tree1);
        expect(updatedTree).not.toBe(tree1);
        expect(updatedTree).not.toEqual(tree2);
        expect(updatedTree).not.toBe(tree2);

        expect(tree2).toEqual({ child: { child: new Set<any>() } });
    });

    test('Set in array in object', () => {
        const tree1 = { child: [new Set<any>()] };
        const tree2 = { child: [new Set<any>()] };

        const { proxy, getPatch } = recordPatch(tree1);

        proxy.child[0].add('a');
        proxy.child[0].add('b');
        proxy.child[0].add(3);
        proxy.child[0].delete('b');

        expect(tree1).toEqual({ child: [new Set(['a', 3])] });

        const patch = getPatch();
        const updatedTree = applyPatch(tree2, patch);

        expect(updatedTree).toEqual(tree1);
        expect(updatedTree).not.toBe(tree1);
        expect(updatedTree).not.toEqual(tree2);
        expect(updatedTree).not.toBe(tree2);

        expect(tree2).toEqual({ child: [new Set<any>()] });
    });

    test('Set in Map in object', () => {
        const tree1 = { child: new Map([['a', new Set<any>()]]) };
        const tree2 = { child: new Map([['a', new Set<any>()]]) };

        const { proxy, getPatch } = recordPatch(tree1);

        proxy.child.get('a')!.add('a');
        proxy.child.get('a')!.add('b');
        proxy.child.get('a')!.add(3);
        proxy.child.get('a')!.delete('b');

        expect(tree1).toEqual({ child: new Map([['a', new Set(['a', 3])]]) });

        const patch = getPatch();
        const updatedTree = applyPatch(tree2, patch);

        expect(updatedTree).toEqual(tree1);
        expect(updatedTree).not.toBe(tree1);
        expect(updatedTree).not.toEqual(tree2);
        expect(updatedTree).not.toBe(tree2);

        expect(tree2).toEqual({ child: new Map([['a', new Set<any>()]]) });
    });

    test('object in object in array', () => {
        const tree1: Record<string, any> = [{ child: {} }];
        const tree2: Record<string, any> = [{ child: {} }];

        const { proxy, getPatch } = recordPatch(tree1);

        proxy[0].child.w = 1;
        proxy[0].child.x = { something: 'else' };
        proxy[0].child.y = 2;
        proxy[0].child.w = 3;
        proxy[0].child.z = 'hello';
        delete proxy[0].child.y;

        expect(tree1).toEqual([
            {
                child: {
                    w: 3,
                    x: { something: 'else' },
                    z: 'hello',
                },
            },
        ]);

        const patch = getPatch();
        const updatedTree = applyPatch(tree2, patch);

        expect(updatedTree).toEqual(tree1);
        expect(updatedTree).not.toBe(tree1);
        expect(updatedTree).not.toEqual(tree2);
        expect(updatedTree).not.toBe(tree2);
    });

    test('array in array in array', () => {
        const tree1: any[] = [[[]]];
        const tree2: any[] = [[[]]];

        const { proxy, getPatch } = recordPatch(tree1);

        proxy[0][0].push('hi');
        proxy[0][0].push('there');
        proxy[0][0].push({ what: 'up' });

        proxy[0][0].splice(1, 1);

        proxy[0][0].push('hey');
        proxy[0][0][1].hello = 'there';

        expect(tree1).toEqual([
            [
                [
                    'hi',
                    {
                        what: 'up',
                        hello: 'there',
                    },
                    'hey',
                ],
            ],
        ]);

        const patch = getPatch();
        const updatedTree = applyPatch(tree2, patch);

        expect(updatedTree).toEqual(tree1);
        expect(updatedTree).not.toBe(tree1);
        expect(updatedTree).not.toEqual(tree2);
        expect(updatedTree).not.toBe(tree2);
    });

    test('array in object in array', () => {
        const tree1: Record<string, any> = [{ child: [] }];
        const tree2: Record<string, any> = [{ child: [] }];

        const { proxy, getPatch } = recordPatch(tree1);

        proxy[0].child.push('hi');
        proxy[0].child.push('there');
        proxy[0].child.push({ what: 'up' });

        proxy[0].child.splice(1, 1);

        proxy[0].child.push('hey');
        proxy[0].child[1].hello = 'there';

        expect(tree1).toEqual([
            {
                child: [
                    'hi',
                    {
                        what: 'up',
                        hello: 'there',
                    },
                    'hey',
                ],
            },
        ]);

        const patch = getPatch();
        const updatedTree = applyPatch(tree2, patch);

        expect(updatedTree).toEqual(tree1);
        expect(updatedTree).not.toBe(tree1);
        expect(updatedTree).not.toEqual(tree2);
        expect(updatedTree).not.toBe(tree2);
    });

    test('object in array in array', () => {
        const tree1: Record<string, any> = [[{}]];
        const tree2: Record<string, any> = [[{}]];

        const { proxy, getPatch } = recordPatch(tree1);

        proxy[0][0].w = 1;
        proxy[0][0].x = { something: 'else' };
        proxy[0][0].y = 2;
        proxy[0][0].w = 3;
        proxy[0][0].z = 'hello';
        delete proxy[0][0].y;

        expect(tree1).toEqual([
            [
                {
                    w: 3,
                    x: { something: 'else' },
                    z: 'hello',
                },
            ],
        ]);

        const patch = getPatch();
        const updatedTree = applyPatch(tree2, patch);

        expect(updatedTree).toEqual(tree1);
        expect(updatedTree).not.toBe(tree1);
        expect(updatedTree).not.toEqual(tree2);
        expect(updatedTree).not.toBe(tree2);
    });

    test('Map in object in array', () => {
        const tree1: Record<string, any> = [{ m: new Map() }];
        const tree2: Record<string, any> = [{ m: new Map() }];

        const { proxy, getPatch } = recordPatch(tree1);

        proxy[0].m.set('a', 1);
        proxy[0].m.set(2, 'b');
        proxy[0].m.set(2, 'c');
        proxy[0].m.set('c', { hi: 'hey' });
        proxy[0].m.delete('a');
        proxy[0].m.get('c').ha = 'ha';

        expect(tree1[0].m.get(2)).toEqual('c');
        expect(proxy[0].m.get(2)).toEqual('c');

        expect(tree1).toEqual([
            {
                m: new Map<any, any>([
                    [2, 'c'],
                    ['c', { hi: 'hey', ha: 'ha' }],
                ]),
            },
        ]);

        const patch = getPatch();
        const updatedTree = applyPatch(tree2, patch);

        expect(updatedTree).toEqual(tree1);
        expect(updatedTree).not.toBe(tree1);
        expect(updatedTree).not.toEqual(tree2);
        expect(updatedTree).not.toBe(tree2);

        expect(tree2).toEqual([{ m: new Map() }]);
    });

    test('object in Map in array', () => {
        const tree1: Array<Map<number, Record<string, any>>> = [
            new Map([[1, {}]]),
        ];
        const tree2: Array<Map<number, Record<string, any>>> = [
            new Map([[1, {}]]),
        ];

        const { proxy, getPatch } = recordPatch(tree1);

        proxy[0].get(1)!.w = 1;
        proxy[0].get(1)!.x = { something: 'else' };
        proxy[0].get(1)!.y = 2;
        proxy[0].get(1)!.w = 3;
        proxy[0].get(1)!.z = 'hello';
        delete proxy[0].get(1)!.y;

        expect(tree1).toEqual([
            new Map([
                [
                    1,
                    {
                        w: 3,
                        x: { something: 'else' },
                        z: 'hello',
                    },
                ],
            ]),
        ]);

        const patch = getPatch();
        const updatedTree = applyPatch(tree2, patch);

        expect(updatedTree).toEqual(tree1);
        expect(updatedTree).not.toBe(tree1);
        expect(updatedTree).not.toEqual(tree2);
        expect(updatedTree).not.toBe(tree2);
    });

    test('Map in Map in array', () => {
        const tree1: Record<string, any> = [new Map([[1, new Map()]])];
        const tree2: Record<string, any> = [new Map([[1, new Map()]])];

        const { proxy, getPatch } = recordPatch(tree1);

        proxy[0].get(1).set('a', 1);
        proxy[0].get(1).set(2, 'b');
        proxy[0].get(1).set(2, 'c');
        proxy[0].get(1).set('c', { hi: 'hey' });
        proxy[0].get(1).delete('a');
        proxy[0].get(1).get('c').ha = 'ha';

        expect(tree1[0].get(1).get(2)).toEqual('c');
        expect(proxy[0].get(1).get(2)).toEqual('c');

        expect(tree1).toEqual([
            new Map([
                [
                    1,
                    new Map<any, any>([
                        [2, 'c'],
                        ['c', { hi: 'hey', ha: 'ha' }],
                    ]),
                ],
            ]),
        ]);

        const patch = getPatch();
        const updatedTree = applyPatch(tree2, patch);

        expect(updatedTree).toEqual(tree1);
        expect(updatedTree).not.toBe(tree1);
        expect(updatedTree).not.toEqual(tree2);
        expect(updatedTree).not.toBe(tree2);

        expect(tree2).toEqual([new Map([[1, new Map()]])]);
    });

    test('Map in array in array', () => {
        const tree1: Record<string, any> = [[new Map()]];
        const tree2: Record<string, any> = [[new Map()]];

        const { proxy, getPatch } = recordPatch(tree1);

        proxy[0][0].set('a', 1);
        proxy[0][0].set(2, 'b');
        proxy[0][0].set(2, 'c');
        proxy[0][0].set('c', { hi: 'hey' });
        proxy[0][0].delete('a');
        proxy[0][0].get('c').ha = 'ha';

        expect(tree1[0][0].get(2)).toEqual('c');
        expect(proxy[0][0].get(2)).toEqual('c');

        expect(tree1).toEqual([
            [
                new Map<any, any>([
                    [2, 'c'],
                    ['c', { hi: 'hey', ha: 'ha' }],
                ]),
            ],
        ]);

        const patch = getPatch();
        const updatedTree = applyPatch(tree2, patch);

        expect(updatedTree).toEqual(tree1);
        expect(updatedTree).not.toBe(tree1);
        expect(updatedTree).not.toEqual(tree2);
        expect(updatedTree).not.toBe(tree2);

        expect(tree2).toEqual([[new Map()]]);
    });

    test('array in Map in array', () => {
        const tree1: Array<Map<string, any[]>> = [new Map([['a', []]])];
        const tree2: Array<Map<string, any[]>> = [new Map([['a', []]])];

        const { proxy, getPatch } = recordPatch(tree1);

        proxy[0].get('a')!.push('hi');
        proxy[0].get('a')!.push('there');
        proxy[0].get('a')!.push({ what: 'up' });

        proxy[0].get('a')!.splice(1, 1);

        proxy[0].get('a')!.push('hey');
        proxy[0].get('a')![1].hello = 'there';

        expect(tree1).toEqual([
            new Map([
                [
                    'a',
                    [
                        'hi',
                        {
                            what: 'up',
                            hello: 'there',
                        },
                        'hey',
                    ],
                ],
            ]),
        ]);

        const patch = getPatch();
        const updatedTree = applyPatch(tree2, patch);

        expect(updatedTree).toEqual(tree1);
        expect(updatedTree).not.toBe(tree1);
        expect(updatedTree).not.toEqual(tree2);
        expect(updatedTree).not.toBe(tree2);
    });

    test('Set in object in array', () => {
        const tree1 = [{ child: new Set<any>() }];
        const tree2 = [{ child: new Set<any>() }];

        const { proxy, getPatch } = recordPatch(tree1);

        proxy[0].child.add('a');
        proxy[0].child.add('b');
        proxy[0].child.add(3);
        proxy[0].child.delete('b');

        expect(tree1).toEqual([{ child: new Set(['a', 3]) }]);

        const patch = getPatch();
        const updatedTree = applyPatch(tree2, patch);

        expect(updatedTree).toEqual(tree1);
        expect(updatedTree).not.toBe(tree1);
        expect(updatedTree).not.toEqual(tree2);
        expect(updatedTree).not.toBe(tree2);

        expect(tree2).toEqual([{ child: new Set<any>() }]);
    });

    test('Set in array in array', () => {
        const tree1 = [[new Set<any>()]];
        const tree2 = [[new Set<any>()]];

        const { proxy, getPatch } = recordPatch(tree1);

        proxy[0][0].add('a');
        proxy[0][0].add('b');
        proxy[0][0].add(3);
        proxy[0][0].delete('b');

        expect(tree1).toEqual([[new Set(['a', 3])]]);

        const patch = getPatch();
        const updatedTree = applyPatch(tree2, patch);

        expect(updatedTree).toEqual(tree1);
        expect(updatedTree).not.toBe(tree1);
        expect(updatedTree).not.toEqual(tree2);
        expect(updatedTree).not.toBe(tree2);

        expect(tree2).toEqual([[new Set<any>()]]);
    });

    test('Set in Map in array', () => {
        const tree1 = [new Map([['a', new Set<any>()]])];
        const tree2 = [new Map([['a', new Set<any>()]])];

        const { proxy, getPatch } = recordPatch(tree1);

        proxy[0].get('a')!.add('a');
        proxy[0].get('a')!.add('b');
        proxy[0].get('a')!.add(3);
        proxy[0].get('a')!.delete('b');

        expect(tree1).toEqual([new Map([['a', new Set(['a', 3])]])]);

        const patch = getPatch();
        const updatedTree = applyPatch(tree2, patch);

        expect(updatedTree).toEqual(tree1);
        expect(updatedTree).not.toBe(tree1);
        expect(updatedTree).not.toEqual(tree2);
        expect(updatedTree).not.toBe(tree2);

        expect(tree2).toEqual([new Map([['a', new Set<any>()]])]);
    });

    test('object in object in Map', () => {
        const tree1: Map<string, Record<string, any>> = new Map([
            ['1', { child: {} }],
        ]);
        const tree2: Map<string, Record<string, any>> = new Map([
            ['1', { child: {} }],
        ]);

        const { proxy, getPatch } = recordPatch(tree1);

        proxy.get('1')!.child.w = 1;
        proxy.get('1')!.child.x = { something: 'else' };
        proxy.get('1')!.child.y = 2;
        proxy.get('1')!.child.w = 3;
        proxy.get('1')!.child.z = 'hello';
        delete proxy.get('1')!.child.y;

        expect(tree1).toEqual(
            new Map([
                [
                    '1',
                    {
                        child: {
                            w: 3,
                            x: { something: 'else' },
                            z: 'hello',
                        },
                    },
                ],
            ]),
        );

        const patch = getPatch();
        const updatedTree = applyPatch(tree2, patch);

        expect(updatedTree).toEqual(tree1);
        expect(updatedTree).not.toBe(tree1);
        expect(updatedTree).not.toEqual(tree2);
        expect(updatedTree).not.toBe(tree2);
    });

    test('array in array in Map', () => {
        const tree1: Map<string, any[]> = new Map([['1', [[]]]]);
        const tree2: Map<string, any[]> = new Map([['1', [[]]]]);

        const { proxy, getPatch } = recordPatch(tree1);

        proxy.get('1')![0].push('hi');
        proxy.get('1')![0].push('there');
        proxy.get('1')![0].push({ what: 'up' });

        proxy.get('1')![0].splice(1, 1);

        proxy.get('1')![0].push('hey');
        proxy.get('1')![0][1].hello = 'there';

        expect(tree1).toEqual(
            new Map([
                [
                    '1',
                    [
                        [
                            'hi',
                            {
                                what: 'up',
                                hello: 'there',
                            },
                            'hey',
                        ],
                    ],
                ],
            ]),
        );

        const patch = getPatch();
        const updatedTree = applyPatch(tree2, patch);

        expect(updatedTree).toEqual(tree1);
        expect(updatedTree).not.toBe(tree1);
        expect(updatedTree).not.toEqual(tree2);
        expect(updatedTree).not.toBe(tree2);
    });

    test('array in object in Map', () => {
        const tree1: Map<string, Record<string, any>> = new Map([
            ['1', { child: [] }],
        ]);
        const tree2: Map<string, Record<string, any>> = new Map([
            ['1', { child: [] }],
        ]);

        const { proxy, getPatch } = recordPatch(tree1);

        proxy.get('1')!.child.push('hi');
        proxy.get('1')!.child.push('there');
        proxy.get('1')!.child.push({ what: 'up' });

        proxy.get('1')!.child.splice(1, 1);

        proxy.get('1')!.child.push('hey');
        proxy.get('1')!.child[1].hello = 'there';

        expect(tree1).toEqual(
            new Map([
                [
                    '1',
                    {
                        child: [
                            'hi',
                            {
                                what: 'up',
                                hello: 'there',
                            },
                            'hey',
                        ],
                    },
                ],
            ]),
        );

        const patch = getPatch();
        const updatedTree = applyPatch(tree2, patch);

        expect(updatedTree).toEqual(tree1);
        expect(updatedTree).not.toBe(tree1);
        expect(updatedTree).not.toEqual(tree2);
        expect(updatedTree).not.toBe(tree2);
    });

    test('object in array in Map', () => {
        const tree1: Map<string, Record<string, any>> = new Map([['1', [{}]]]);
        const tree2: Map<string, Record<string, any>> = new Map([['1', [{}]]]);

        const { proxy, getPatch } = recordPatch(tree1);

        proxy.get('1')![0].w = 1;
        proxy.get('1')![0].x = { something: 'else' };
        proxy.get('1')![0].y = 2;
        proxy.get('1')![0].w = 3;
        proxy.get('1')![0].z = 'hello';
        delete proxy.get('1')![0].y;

        expect(tree1).toEqual(
            new Map([
                [
                    '1',
                    [
                        {
                            w: 3,
                            x: { something: 'else' },
                            z: 'hello',
                        },
                    ],
                ],
            ]),
        );

        const patch = getPatch();
        const updatedTree = applyPatch(tree2, patch);

        expect(updatedTree).toEqual(tree1);
        expect(updatedTree).not.toBe(tree1);
        expect(updatedTree).not.toEqual(tree2);
        expect(updatedTree).not.toBe(tree2);
    });

    test('Map in object in Map', () => {
        const tree1: Map<string, Record<string, any>> = new Map([
            ['1', { m: new Map() }],
        ]);
        const tree2: Map<string, Record<string, any>> = new Map([
            ['1', { m: new Map() }],
        ]);

        const { proxy, getPatch } = recordPatch(tree1);

        proxy.get('1')!.m.set('a', 1);
        proxy.get('1')!.m.set(2, 'b');
        proxy.get('1')!.m.set(2, 'c');
        proxy.get('1')!.m.set('c', { hi: 'hey' });
        proxy.get('1')!.m.delete('a');
        proxy.get('1')!.m.get('c').ha = 'ha';

        expect(tree1.get('1')!.m.get(2)).toEqual('c');
        expect(proxy.get('1')!.m.get(2)).toEqual('c');

        expect(tree1).toEqual(
            new Map([
                [
                    '1',
                    {
                        m: new Map<any, any>([
                            [2, 'c'],
                            ['c', { hi: 'hey', ha: 'ha' }],
                        ]),
                    },
                ],
            ]),
        );

        const patch = getPatch();
        const updatedTree = applyPatch(tree2, patch);

        expect(updatedTree).toEqual(tree1);
        expect(updatedTree).not.toBe(tree1);
        expect(updatedTree).not.toEqual(tree2);
        expect(updatedTree).not.toBe(tree2);

        expect(tree2).toEqual(new Map([['1', { m: new Map() }]]));
    });

    test('object in Map in Map', () => {
        const tree1: Map<string, Map<number, Record<string, any>>> = new Map([
            ['1', new Map([[1, {}]])],
        ]);
        const tree2: Map<string, Map<number, Record<string, any>>> = new Map([
            ['1', new Map([[1, {}]])],
        ]);

        const { proxy, getPatch } = recordPatch(tree1);

        proxy.get('1')!.get(1)!.w = 1;
        proxy.get('1')!.get(1)!.x = { something: 'else' };
        proxy.get('1')!.get(1)!.y = 2;
        proxy.get('1')!.get(1)!.w = 3;
        proxy.get('1')!.get(1)!.z = 'hello';
        delete proxy.get('1')!.get(1)!.y;

        expect(tree1).toEqual(
            new Map([
                [
                    '1',
                    new Map([
                        [
                            1,
                            {
                                w: 3,
                                x: { something: 'else' },
                                z: 'hello',
                            },
                        ],
                    ]),
                ],
            ]),
        );

        const patch = getPatch();
        const updatedTree = applyPatch(tree2, patch);

        expect(updatedTree).toEqual(tree1);
        expect(updatedTree).not.toBe(tree1);
        expect(updatedTree).not.toEqual(tree2);
        expect(updatedTree).not.toBe(tree2);
    });

    test('Map in Map in Map', () => {
        const tree1: Map<string, Record<string, any>> = new Map([
            ['1', new Map([[1, new Map()]])],
        ]);
        const tree2: Map<string, Record<string, any>> = new Map([
            ['1', new Map([[1, new Map()]])],
        ]);

        const { proxy, getPatch } = recordPatch(tree1);

        proxy.get('1')!.get(1).set('a', 1);
        proxy.get('1')!.get(1).set(2, 'b');
        proxy.get('1')!.get(1).set(2, 'c');
        proxy.get('1')!.get(1).set('c', { hi: 'hey' });
        proxy.get('1')!.get(1).delete('a');
        proxy.get('1')!.get(1).get('c').ha = 'ha';

        expect(tree1.get('1')!.get(1).get(2)).toEqual('c');
        expect(proxy.get('1')!.get(1).get(2)).toEqual('c');

        expect(tree1).toEqual(
            new Map([
                [
                    '1',
                    new Map([
                        [
                            1,
                            new Map<any, any>([
                                [2, 'c'],
                                ['c', { hi: 'hey', ha: 'ha' }],
                            ]),
                        ],
                    ]),
                ],
            ]),
        );

        const patch = getPatch();
        const updatedTree = applyPatch(tree2, patch);

        expect(updatedTree).toEqual(tree1);
        expect(updatedTree).not.toBe(tree1);
        expect(updatedTree).not.toEqual(tree2);
        expect(updatedTree).not.toBe(tree2);

        expect(tree2).toEqual(new Map([['1', new Map([[1, new Map()]])]]));
    });

    test('Map in array in Map', () => {
        const tree1: Map<string, Record<string, any>> = new Map([
            ['1', [new Map()]],
        ]);
        const tree2: Map<string, Record<string, any>> = new Map([
            ['1', [new Map()]],
        ]);

        const { proxy, getPatch } = recordPatch(tree1);

        proxy.get('1')![0].set('a', 1);
        proxy.get('1')![0].set(2, 'b');
        proxy.get('1')![0].set(2, 'c');
        proxy.get('1')![0].set('c', { hi: 'hey' });
        proxy.get('1')![0].delete('a');
        proxy.get('1')![0].get('c').ha = 'ha';

        expect(tree1.get('1')![0].get(2)).toEqual('c');
        expect(proxy.get('1')![0].get(2)).toEqual('c');

        expect(tree1).toEqual(
            new Map([
                [
                    '1',
                    [
                        new Map<any, any>([
                            [2, 'c'],
                            ['c', { hi: 'hey', ha: 'ha' }],
                        ]),
                    ],
                ],
            ]),
        );

        const patch = getPatch();
        const updatedTree = applyPatch(tree2, patch);

        expect(updatedTree).toEqual(tree1);
        expect(updatedTree).not.toBe(tree1);
        expect(updatedTree).not.toEqual(tree2);
        expect(updatedTree).not.toBe(tree2);

        expect(tree2).toEqual(new Map([['1', [new Map()]]]));
    });

    test('array in Map in Map', () => {
        const tree1: Map<string, Map<string, any[]>> = new Map([
            ['1', new Map([['a', []]])],
        ]);
        const tree2: Map<string, Map<string, any[]>> = new Map([
            ['1', new Map([['a', []]])],
        ]);

        const { proxy, getPatch } = recordPatch(tree1);

        proxy.get('1')!.get('a')!.push('hi');
        proxy.get('1')!.get('a')!.push('there');
        proxy.get('1')!.get('a')!.push({ what: 'up' });

        proxy.get('1')!.get('a')!.splice(1, 1);

        proxy.get('1')!.get('a')!.push('hey');
        proxy.get('1')!.get('a')![1].hello = 'there';

        expect(tree1).toEqual(
            new Map([
                [
                    '1',
                    new Map([
                        [
                            'a',
                            [
                                'hi',
                                {
                                    what: 'up',
                                    hello: 'there',
                                },
                                'hey',
                            ],
                        ],
                    ]),
                ],
            ]),
        );

        const patch = getPatch();
        const updatedTree = applyPatch(tree2, patch);

        expect(updatedTree).toEqual(tree1);
        expect(updatedTree).not.toBe(tree1);
        expect(updatedTree).not.toEqual(tree2);
        expect(updatedTree).not.toBe(tree2);
    });

    test('Set in object in Map', () => {
        const tree1 = new Map([['1', { child: new Set<any>() }]]);
        const tree2 = new Map([['1', { child: new Set<any>() }]]);

        const { proxy, getPatch } = recordPatch(tree1);

        proxy.get('1')!.child.add('a');
        proxy.get('1')!.child.add('b');
        proxy.get('1')!.child.add(3);
        proxy.get('1')!.child.delete('b');

        expect(tree1).toEqual(new Map([['1', { child: new Set(['a', 3]) }]]));

        const patch = getPatch();
        const updatedTree = applyPatch(tree2, patch);

        expect(updatedTree).toEqual(tree1);
        expect(updatedTree).not.toBe(tree1);
        expect(updatedTree).not.toEqual(tree2);
        expect(updatedTree).not.toBe(tree2);

        expect(tree2).toEqual(new Map([['1', { child: new Set<any>() }]]));
    });

    test('Set in array in Map', () => {
        const tree1 = new Map([['1', [new Set<any>()]]]);
        const tree2 = new Map([['1', [new Set<any>()]]]);

        const { proxy, getPatch } = recordPatch(tree1);

        proxy.get('1')![0].add('a');
        proxy.get('1')![0].add('b');
        proxy.get('1')![0].add(3);
        proxy.get('1')![0].delete('b');

        expect(tree1).toEqual(new Map([['1', [new Set(['a', 3])]]]));

        const patch = getPatch();
        const updatedTree = applyPatch(tree2, patch);

        expect(updatedTree).toEqual(tree1);
        expect(updatedTree).not.toBe(tree1);
        expect(updatedTree).not.toEqual(tree2);
        expect(updatedTree).not.toBe(tree2);

        expect(tree2).toEqual(new Map([['1', [new Set<any>()]]]));
    });

    test('Set in Map in Map', () => {
        const tree1 = new Map([['1', new Map([['a', new Set<any>()]])]]);
        const tree2 = new Map([['1', new Map([['a', new Set<any>()]])]]);

        const { proxy, getPatch } = recordPatch(tree1);

        proxy.get('1')!.get('a')!.add('a');
        proxy.get('1')!.get('a')!.add('b');
        proxy.get('1')!.get('a')!.add(3);
        proxy.get('1')!.get('a')!.delete('b');

        expect(tree1).toEqual(
            new Map([['1', new Map([['a', new Set(['a', 3])]])]]),
        );

        const patch = getPatch();
        const updatedTree = applyPatch(tree2, patch);

        expect(updatedTree).toEqual(tree1);
        expect(updatedTree).not.toBe(tree1);
        expect(updatedTree).not.toEqual(tree2);
        expect(updatedTree).not.toBe(tree2);

        expect(tree2).toEqual(
            new Map([['1', new Map([['a', new Set<any>()]])]]),
        );
    });
});

test('dates', () => {
    const tree: any = {};

    const { proxy, getPatch } = recordPatch(tree);

    proxy.a = new Date(2000, 0, 0, 6, 32, 15, 52);
    proxy.b = new Date();
    proxy.b = new Date(2001, 4, 4, 4, 4, 5, 6);

    expect(tree).toEqual({
        a: new Date(2000, 0, 0, 6, 32, 15, 52),
        b: new Date(2001, 4, 4, 4, 4, 5, 6),
    });

    expect(proxy).toEqual(tree);

    const patch = getPatch();

    const newTree = {};

    const updatedTree = applyPatch(newTree, patch);

    expect(updatedTree).toEqual(tree);

    expect(newTree).toEqual({});
});

test('subsequent patches not allowed', () => {
    const tree = { this: 1 };

    const { proxy, getPatch } = recordPatch(tree);

    proxy.this = 2;

    const patch = getPatch();

    expect(() => {
        getPatch();
    }).toThrowError('Cannot retrieve patches multiple times');
});

// TODO: array delete test

// TODO: array shift test

// TODO: array unshift test

// TODO: array reverse test

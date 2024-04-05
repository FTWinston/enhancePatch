import { applyPatch } from './applyPatch';
import { recordPatch } from './recordPatch';

describe('no changes', () => {
    test('object', () => {
        const tree1 = { x: 1, y: 'hello' };
        const tree2 = { x: 1, y: 'hello' };

        const { getPatch } = recordPatch(tree1);
        const patch = getPatch();
        const updatedTree = applyPatch(tree2, patch);

        expect(patch).toEqual({});
        expect(updatedTree).toEqual(tree1);
        expect(updatedTree).not.toBe(tree1);
        expect(updatedTree).toEqual(tree2);
        expect(updatedTree).not.toBe(tree2);
    });

    test('array', () => {
        const tree1 = [1, 'hello'];
        const tree2 = [1, 'hello'];

        const { getPatch } = recordPatch(tree1);
        const patch = getPatch();
        const updatedTree = applyPatch(tree2, patch);

        expect(patch).toEqual({});
        expect(updatedTree).toEqual(tree1);
        expect(updatedTree).not.toBe(tree1);
        expect(updatedTree).toEqual(tree2);
        expect(updatedTree).not.toBe(tree2);
    });

    test('map', () => {
        const tree1 = new Map<any, any>([
            [1, 'hello'],
            ['bye', 2],
        ]);
        const tree2 = new Map<any, any>([
            [1, 'hello'],
            ['bye', 2],
        ]);

        const { getPatch } = recordPatch(tree1);
        const patch = getPatch();
        const updatedTree = applyPatch(tree2, patch);

        expect(patch).toEqual({});
        expect(updatedTree).toEqual(tree1);
        expect(updatedTree).not.toBe(tree1);
        expect(updatedTree).toEqual(tree2);
        expect(updatedTree).not.toBe(tree2);
    });

    test('set', () => {
        const tree1 = new Set<any>([1, 'hello']);
        const tree2 = new Set<any>([1, 'hello']);

        const { getPatch } = recordPatch(tree1);
        const patch = getPatch();
        const updatedTree = applyPatch(tree2, patch);

        expect(patch).toEqual({});
        expect(updatedTree).toEqual(tree1);
        expect(updatedTree).not.toBe(tree1);
        expect(updatedTree).toEqual(tree2);
        expect(updatedTree).not.toBe(tree2);
    });
});

describe('modifying root', () => {
    test('object', () => {
        const tree1: Record<string, any> = {};
        const tree2: Record<string, any> = {};

        const { proxy, getPatch } = recordPatch(tree1);

        proxy.w = 1;
        proxy.x = { something: 'else' };
        proxy.y = 2;
        proxy.w = 3;
        proxy.z = 'hello';
        delete proxy.y;

        expect(tree1).toEqual({
            w: 3,
            x: { something: 'else' },
            z: 'hello',
        });

        const patch = getPatch();
        const updatedTree = applyPatch(tree2, patch);

        expect(updatedTree).toEqual(tree1);
        expect(updatedTree).not.toBe(tree1);
        expect(updatedTree).not.toEqual(tree2);
        expect(updatedTree).not.toBe(tree2);
    });

    test('array', () => {
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

    test('map', () => {
        const tree1 = new Map<any, any>();
        const tree2 = new Map<any, any>();

        const { proxy, getPatch } = recordPatch(tree1);

        proxy.set('a', 1);
        proxy.set(2, 'b');
        proxy.set(2, 'c');
        proxy.set('c', { hi: 'hey' });
        proxy.delete('a');
        proxy.get('c').ha = 'ha';

        expect(tree1.get(2)).toEqual('c');
        expect(proxy.get(2)).toEqual('c');

        expect(tree1).toEqual(
            new Map<any, any>([
                [2, 'c'],
                ['c', { hi: 'hey', ha: 'ha' }],
            ])
        );

        const patch = getPatch();
        const updatedTree = applyPatch(tree2, patch);

        expect(updatedTree).toEqual(tree1);
        expect(updatedTree).not.toBe(tree1);
        expect(updatedTree).not.toEqual(tree2);
        expect(updatedTree).not.toBe(tree2);

        expect(tree2).toEqual(new Map<any, any>());
    });

    test('set', () => {
        const tree1 = new Set<any>();
        const tree2 = new Set<any>();

        const { proxy, getPatch } = recordPatch(tree1);

        proxy.add('a');
        proxy.add('b');
        proxy.add(3);
        proxy.delete('b');

        expect(tree1).toEqual(new Set(['a', 3]));

        const patch = getPatch();
        const updatedTree = applyPatch(tree2, patch);

        expect(updatedTree).toEqual(tree1);
        expect(updatedTree).not.toBe(tree1);
        expect(updatedTree).not.toEqual(tree2);
        expect(updatedTree).not.toBe(tree2);

        expect(tree2).toEqual(new Set<any>());
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
            ])
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
            ])
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
            ])
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
        const tree1 = [ new Set<any>() ];
        const tree2 = [ new Set<any>() ];

        const { proxy, getPatch } = recordPatch(tree1);

        proxy[0].add('a');
        proxy[0].add('b');
        proxy[0].add(3);
        proxy[0].delete('b');

        expect(tree1).toEqual([ new Set(['a', 3]) ]);

        const patch = getPatch();
        const updatedTree = applyPatch(tree2, patch);

        expect(updatedTree).toEqual(tree1);
        expect(updatedTree).not.toBe(tree1);
        expect(updatedTree).not.toEqual(tree2);
        expect(updatedTree).not.toBe(tree2);

        expect(tree2).toEqual([ new Set<any>() ]);
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
            }
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
            ]
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
            }
        });

        const patch = getPatch();
        const updatedTree = applyPatch(tree2, patch);

        expect(updatedTree).toEqual(tree1);
        expect(updatedTree).not.toBe(tree1);
        expect(updatedTree).not.toEqual(tree2);
        expect(updatedTree).not.toBe(tree2);
    });

    // TODO: more tests
});

test('simple objects', () => {
    const tree: any = {};

    const { proxy, getPatch } = recordPatch(tree);

    proxy.x = 1;
    proxy.y = 'hi';
    proxy.z = {
        hello: 'world',
    };
    proxy.z.bye = 'everybody';
    proxy.z.a = { a: 'aa' };
    proxy.z.a.b = 'bb';
    proxy.y = { yo: 'ho' };
    delete proxy.x;

    expect(tree).toEqual({
        y: { yo: 'ho' },
        z: {
            hello: 'world',
            bye: 'everybody',
            a: {
                a: 'aa',
                b: 'bb',
            },
        },
    });

    expect(proxy).toEqual(tree);

    const patch = getPatch();

    if (patch !== null) {
        const newTree = {};

        const updatedTree = applyPatch(newTree, patch);

        expect(updatedTree).toEqual(tree);

        expect(newTree).toEqual({});
    }

    const subsequentPatch = getPatch();

    expect(subsequentPatch).toBe(patch);
});

test('array, all in one', () => {
    const tree: any = {};

    const { proxy, getPatch } = recordPatch(tree);

    proxy.a = [];
    proxy.a.push('hi');
    proxy.a.push('there');
    proxy.a.push({ what: 'up' });

    proxy.a.splice(1, 1);

    proxy.a.push('hey');
    proxy.a[1].hello = 'there';

    expect(tree).toEqual({
        a: [
            'hi',
            {
                what: 'up',
                hello: 'there',
            },
            'hey',
        ],
    });

    expect(proxy).toEqual(tree);

    const patch = getPatch();

    if (patch !== null) {
        const newTree = {};

        const updatedTree = applyPatch(newTree, patch);

        expect(updatedTree).toEqual(tree);

        expect(newTree).toEqual({});
    }

    const subsequentPatch = getPatch();

    expect(subsequentPatch).toBe(patch);
});

test('array, separate', () => {
    const tree: any = {};

    const { proxy, getPatch } = recordPatch(tree);

    proxy.a = [];

    const firstPatch = getPatch();

    if (firstPatch === null) {
        return;
    }

    const firstPatchedTree = applyPatch({}, firstPatch);

    expect(firstPatchedTree).toEqual(tree);

    const { proxy: proxy2, getPatch: getPatch2 } = recordPatch(tree);

    proxy2.a.push('hi');
    proxy2.a.push('there');
    proxy2.a.push({ what: 'up' });

    proxy2.a.splice(1, 1, 'whats', 'up');

    proxy2.a.push('hey');

    proxy2.a.shift();

    proxy2.a[2].hello = 'there';

    proxy2.a.unshift('whaat');

    proxy2.a.reverse();

    expect(tree).toEqual({
        a: [
            'hey',
            {
                what: 'up',
                hello: 'there',
            },
            'up',
            'whats',
            'whaat',
        ],
    });

    expect(proxy2).toEqual(tree);

    const patch2 = getPatch2();

    expect(patch2).not.toBeNull();

    if (patch2 !== null) {
        const updatedTree = applyPatch(firstPatchedTree, patch2);

        expect(updatedTree).toEqual(tree);

        expect(firstPatchedTree).toEqual({ a: [] });
    }

    const subsequentPatch = getPatch();

    expect(subsequentPatch).not.toBe(firstPatch);
    expect(subsequentPatch).not.toBe(patch2);
});

test('map and set', () => {
    const tree = {
        map: new Map<any, any>(),
        set: new Set<any>(),
    };

    const { proxy, getPatch } = recordPatch(tree);

    proxy.map.set('a', 1);
    proxy.map.set(2, 'b');
    proxy.map.set(2, 'c');
    proxy.map.set('c', { hi: 'hey' });
    proxy.map.delete('a');
    proxy.map.get('c').ha = 'ha';

    proxy.set.add('a');
    proxy.set.add('b');
    proxy.set.add(3);
    proxy.set.delete('b');

    expect(tree.map.get(2)).toEqual('c');
    expect(proxy.map.get(2)).toEqual('c');

    expect(tree).toEqual({
        map: new Map<any, any>([
            [2, 'c'],
            ['c', { hi: 'hey', ha: 'ha' }],
        ]),
        set: new Set(['a', 3]),
    });

    const patch = getPatch();

    if (patch !== null) {
        const newTree = {
            map: new Map<any, any>(),
            set: new Set<any>(),
        };

        const updatedTree = applyPatch(newTree, patch);

        expect(updatedTree).toEqual(tree);

        expect(newTree).toEqual({
            map: new Map<any, any>(),
            set: new Set<any>(),
        });
    }

    const subsequentPatch = getPatch();

    expect(subsequentPatch).toBe(patch);
});

test('date', () => {
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

    if (patch !== null) {
        const newTree = {};

        const updatedTree = applyPatch(newTree, patch);

        expect(updatedTree).toEqual(tree);

        expect(newTree).toEqual({});
    }

    const subsequentPatch = getPatch();

    expect(subsequentPatch).toBe(patch);
});

test('subsequent patches not allowed', () => {});

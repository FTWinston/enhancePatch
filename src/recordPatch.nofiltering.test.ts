import { applyPatch } from './applyPatch';
import { recordPatch } from './recordPatch';

describe('no changes', () => {
    test('object', () => {
        const tree = { x: 1, y: 'hello' };

        const { proxy, getPatch } = recordPatch(tree);
        const patch = getPatch();

        expect(patch).toEqual({});
    });

    test('array', () => {
        const tree = [1, 'hello'];

        const { getPatch } = recordPatch(tree);
        const patch = getPatch();

        expect(patch).toEqual({});
    });

    test('map', () => {
        const tree = new Map<any, any>([[1, 'hello'], ['bye', 2]]);
    
        const { getPatch } = recordPatch(tree);
        const patch = getPatch();
    
        expect(patch).toEqual({});
    });
    
    test('set', () => {
        const tree = new Set<any>([1, 'hello']);
    
        const { getPatch } = recordPatch(tree);
        const patch = getPatch();
    
        expect(patch).toEqual({});
    });
});

describe('modifying root, simple values', () => {
    test('object', () => {
        const tree: Record<string, number | string> = {};

        const { proxy, getPatch } = recordPatch(tree);

        proxy.x = 1;
        proxy.y = 2;
        proxy.x = 3;
        proxy.z = 'hello';
        delete proxy.y;

        const patch = getPatch();

        expect(patch).not.toBeNull();

        expect(tree).toEqual({
            x: 3,
            z: 'hello',
        });

        if (patch === null) {
            throw 'Error';
        }

        const newTree = {};

        const updatedTree = applyPatch(newTree, patch);

        expect(updatedTree).not.toEqual(newTree);
        expect(updatedTree).not.toBe(newTree);
        expect(updatedTree).toEqual(tree);
        expect(updatedTree).not.toBe(tree);
    });

    test('array', () => {
        // TODO: review
        const tree: any[] = [];

        const { proxy, getPatch } = recordPatch(tree);

        proxy.push('hi');
        proxy.push('there');
        proxy.push({ what: 'up' });

        proxy.splice(1, 1);

        proxy.push('hey');
        proxy[1].hello = 'there';

        expect(tree).toEqual([
            'hi',
            {
                what: 'up',
                hello: 'there',
            },
            'hey',
        ]);

        const patch = getPatch();

        expect(patch).not.toBeNull();

        if (patch !== null) {
            const newTree: any[] = [];

            const updatedTree = applyPatch(newTree, patch);

            expect(updatedTree).toEqual(tree);

            expect(newTree).toEqual([]);
        }

        const subsequentPatch = getPatch();

        expect(subsequentPatch).toBe(patch);
    });

    test('map', () => {
        // TODO: review
        const tree = new Map<any, any>();
    
        const { proxy, getPatch } = recordPatch(tree);
    
        proxy.set('a', 1);
        proxy.set(2, 'b');
        proxy.set(2, 'c');
        proxy.set('c', { hi: 'hey' });
        proxy.delete('a');
        proxy.get('c').ha = 'ha';
    
        expect(tree.get(2)).toEqual('c');
        expect(proxy.get(2)).toEqual('c');
    
        expect(tree).toEqual(
            new Map<any, any>([
                [2, 'c'],
                ['c', { hi: 'hey', ha: 'ha' }],
            ])
        );
        
        const patch = getPatch();
    
        expect(patch).not.toBeNull();
    
        if (patch !== null) {
            const newTree = new Map<any, any>();
    
            const updatedTree = applyPatch(newTree, patch);
    
            expect(updatedTree).toEqual(tree);
    
            expect(newTree).toEqual(new Map<any, any>());
        }
    
        const subsequentPatch = getPatch();
    
        expect(subsequentPatch).toBe(patch);
    });
    
    test('set', () => {
        // TODO: review
        const tree = new Set<any>();
    
        const { proxy, getPatch } = recordPatch(tree);
    
        proxy.add('a');
        proxy.add('b');
        proxy.add(3);
        proxy.delete('b');
    
        expect(tree).toEqual(new Set(['a', 3]));
        
        const patch = getPatch();
    
        expect(patch).not.toBeNull();
    
        if (patch !== null) {
            const newTree = new Set<any>();
    
            const updatedTree = applyPatch(newTree, patch);
    
            expect(updatedTree).toEqual(tree);
    
            expect(newTree).toEqual(new Set<any>());
        }
    
        const subsequentPatch = getPatch();
    
        expect(subsequentPatch).toBe(patch);
    });
});

describe('modifying root, complex values', () => {
    // TODO: this
});

describe('modifying child', () => {
    // TODO: this
})

describe('modifying grandchild', () => {
    // TODO: this
})

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

    expect(patch).not.toBeNull();

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

    expect(patch).not.toBeNull();

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

    // This fails for some reason
    expect(proxy).toEqual(tree);

    const patch = getPatch();

    expect(patch).not.toBeNull();

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

    expect(patch).not.toBeNull();

    if (patch !== null) {
        const newTree = {};

        const updatedTree = applyPatch(newTree, patch);

        expect(updatedTree).toEqual(tree);

        expect(newTree).toEqual({});
    }

    const subsequentPatch = getPatch();

    expect(subsequentPatch).toBe(patch);
});

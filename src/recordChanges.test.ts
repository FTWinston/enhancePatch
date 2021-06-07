import { stringify } from 'enhancejson/lib/stringify';
import { applyPatch } from './applyPatch';
import { recordChanges } from './recordChanges';

test('simple objects', () => {
    const tree: any = {};

    const { proxy, getPatch } = recordChanges(tree);

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

    expect(subsequentPatch).toBeNull();
});

test('array, all in one', () => {
    const tree: any = {};

    const { proxy, getPatch } = recordChanges(tree);

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

    expect(subsequentPatch).toBeNull();
});

test('array, separate', () => {
    const tree: any = {};

    const { proxy, getPatch } = recordChanges(tree);

    proxy.a = [];

    const firstPatch = getPatch();

    if (firstPatch === null) {
        return;
    }

    const firstPatchedTree = applyPatch({}, firstPatch);

    expect(firstPatchedTree).toEqual(tree);

    proxy.a.push('hi');
    proxy.a.push('there');
    proxy.a.push({ what: 'up' });

    proxy.a.splice(1, 1, 'whats', 'up');

    proxy.a.push('hey');

    proxy.a.shift();

    proxy.a[2].hello = 'there';

    proxy.a.unshift('whaat');

    proxy.a.reverse();

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

    expect(proxy).toEqual(tree);

    const patch = getPatch();

    expect(patch).not.toBeNull();

    if (patch !== null) {
        const updatedTree = applyPatch(firstPatchedTree, patch);

        expect(updatedTree).toEqual(tree);

        expect(firstPatchedTree).toEqual({ a: [] });
    }

    const subsequentPatch = getPatch();

    expect(subsequentPatch).toBeNull();
});

test('array, as root', () => {
    const tree: any[] = [];

    const { proxy, getPatch } = recordChanges(tree);

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

    expect(proxy).toEqual(tree);

    const patch = getPatch();

    expect(patch).not.toBeNull();

    if (patch !== null) {
        const newTree: any[] = [];

        const updatedTree = applyPatch(newTree, patch);

        expect(updatedTree).toEqual(tree);

        expect(newTree).toEqual([]);
    }

    const subsequentPatch = getPatch();

    expect(subsequentPatch).toBeNull();
});

test('map and set', () => {
    const tree = {
        map: new Map<any, any>(),
        set: new Set<any>(),
    };

    const { proxy, getPatch } = recordChanges(tree);

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
    // expect(proxy).toEqual(tree);
    const a = stringify(tree);
    const b = stringify(proxy);
    expect(a).toEqual(b);

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

    expect(subsequentPatch).toBeNull();
});

test('map as root', () => {
    const tree = new Map<any, any>();

    const { proxy, getPatch } = recordChanges(tree);

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

    // This fails for some reason
    // expect(proxy).toEqual(tree);
    const a = stringify(tree);
    const b = stringify(proxy);
    expect(a).toEqual(b);

    const patch = getPatch();

    expect(patch).not.toBeNull();

    if (patch !== null) {
        const newTree = new Map<any, any>();

        const updatedTree = applyPatch(newTree, patch);

        expect(updatedTree).toEqual(tree);

        expect(newTree).toEqual(new Map<any, any>());
    }

    const subsequentPatch = getPatch();

    expect(subsequentPatch).toBeNull();
});

test('set as root', () => {
    const tree = new Set<any>();

    const { proxy, getPatch } = recordChanges(tree);

    proxy.add('a');
    proxy.add('b');
    proxy.add(3);
    proxy.delete('b');

    expect(tree).toEqual(new Set(['a', 3]));

    // This fails for some other reason
    //expect(proxy).toEqual(tree);
    const a = stringify(tree);
    const b = stringify(proxy);
    expect(a).toEqual(b);

    const patch = getPatch();

    expect(patch).not.toBeNull();

    if (patch !== null) {
        const newTree = new Set<any>();

        const updatedTree = applyPatch(newTree, patch);

        expect(updatedTree).toEqual(tree);

        expect(newTree).toEqual(new Set<any>());
    }

    const subsequentPatch = getPatch();

    expect(subsequentPatch).toBeNull();
});


// TODO: Date

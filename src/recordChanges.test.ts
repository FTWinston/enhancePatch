import { applyPatch } from './applyPatch';
import { recordChanges } from './recordChanges';

test('simple objects', () => {
    const tree = {};

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

test('arrays, all in one', () => {
    const tree = {};

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

test('arrays, separate', () => {
    const tree = {};

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

// TODO: array as root

// TODO: Map and Set

// TODO: Map and Set as root

// TODO: Date

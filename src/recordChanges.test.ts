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
    proxy.y = { yo: 'ho' };
    delete proxy.x;

    expect(tree).toEqual({
        y: { yo: 'ho' },
        z: {
            hello: 'world',
            bye: 'everybody',
        },
    });

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

test('arrays', () => {
    const tree = {};

    const { proxy, getPatch } = recordChanges(tree);

    proxy.a = [];
    proxy.a.push('hi');
    proxy.a.push('there');
    proxy.a.push({ what: 'up' });
    proxy.a[2].hello = 'there';

    proxy.a.splice(1, 1);

    expect(tree).toEqual({
        a: [
            'hi',
            {
                what: 'up',
                hello: 'there',
            },
        ],
    });

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

// TODO: array as root

// TODO: Map and Set

// TODO: Map and Set as root

// TODO: Date

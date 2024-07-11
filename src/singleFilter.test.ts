import { Filter } from './Filter';
import { applyPatch } from './applyPatch';
import { recordPatch } from './recordPatch';

test('empty filter', () => {
    const tree1: Record<string, number> = { x: 1, y: 2 };
    const tree2: Record<string, number> = { x: 1 };

    const filter: Filter = {
        fixedKeys: {}
    };

    const { getPatch } = recordPatch(tree1, filter);

    tree1.x = 2;
    tree1.y = 3;

    const patch = getPatch();

    const updatedTree = applyPatch(tree2, patch);

    expect(updatedTree).toEqual(tree2);
});

describe('modify root, include true, single fixed key', () => {
    test('reassign existing object field', () => {
        const tree1: Record<string, number> = { x: 1, y: 2 };
        const tree2: Record<string, number> = { x: 1, y: 2 };

        const filter: Filter = {
            fixedKeys: {
                x: true
            }
        };

        const { proxy, getPatch } = recordPatch(tree1, filter);

        proxy.x = 2;
        proxy.y = 3;

        const patch = getPatch();

        const updatedTree = applyPatch(tree2, patch);

        expect(updatedTree).toEqual({
            x: 2,
            y: 2,
        });
    });

    test('add new object field', () => {
        const tree1: Record<string, number> = {};
        const tree2: Record<string, number> = {};

        const filter: Filter = {
            fixedKeys: {
                x: true
            }
        };

        const { proxy, getPatch } = recordPatch(tree1, filter);

        proxy.x = 2;
        proxy.y = 3;

        const patch = getPatch();

        const updatedTree = applyPatch(tree2, patch);

        expect(updatedTree).toEqual({
            x: 2,
        });
    });

    test('delete existing object field', () => {
        const tree1: Record<string, number> = { x: 1, y: 2 };
        const tree2: Record<string, number> = { x: 1, y: 2 };

        const filter: Filter = {
            fixedKeys: {
                x: true
            }
        };

        const { proxy, getPatch } = recordPatch(tree1, filter);

        delete proxy.x;
        delete proxy.y;

        const patch = getPatch();

        const updatedTree = applyPatch(tree2, patch);

        expect(updatedTree).toEqual({
            y: 2,
        });
    });

    test('reassign existing array item', () => {
        const tree1: string[] = ['a', 'b'];
        const tree2: string[] = ['a', 'b'];

        const filter: Filter = {
            fixedKeys: {
                x: true
            }
        };

        const { proxy, getPatch } = recordPatch(tree1, filter);

        proxy[0] = 'A';
        proxy[1] = 'B';

        const patch = getPatch();

        const updatedTree = applyPatch(tree2, patch);

        expect(updatedTree).toEqual(['A']);
    });

    test('add new array item', () => {
        const tree1: string[] = [];
        const tree2: string[] = [];

        const filter: Filter = {
            fixedKeys: {
                x: true
            }
        };

        const { proxy, getPatch } = recordPatch(tree1, filter);

        proxy[0] = 'A';
        proxy[1] = 'B';

        const patch = getPatch();

        const updatedTree = applyPatch(tree2, patch);

        expect(updatedTree).toEqual(['A']);
    });

    // TODO: array delete test

    // TODO: array push test

    // TODO: array splice test

    // TODO: array shift test

    // TODO: array unshift test

    // TODO: array reverse test

    test('reassign existing Map entry', () => {
        const tree1: Map<string, number> = new Map([
            ['x', 1],
            ['y', 2],
        ]);
        const tree2: Map<string, number> = new Map([
            ['x', 1],
            ['y', 2],
        ]);

        const filter: Filter = {
            fixedKeys: {
                x: true
            }
        };

        const { proxy, getPatch } = recordPatch(tree1, filter);

        proxy.set('x', 2);
        proxy.set('y', 3);

        const patch = getPatch();

        const updatedTree = applyPatch(tree2, patch);

        expect(updatedTree).toEqual(
            new Map([
                ['x', 2],
                ['y', 2],
            ]),
        );
    });

    test('add new Map entry', () => {
        const tree1: Map<string, number> = new Map();
        const tree2: Map<string, number> = new Map();

        const filter: Filter = {
            fixedKeys: {
                x: true
            }
        };

        const { proxy, getPatch } = recordPatch(tree1, filter);

        proxy.set('x', 2);
        proxy.set('y', 3);

        const patch = getPatch();

        const updatedTree = applyPatch(tree2, patch);

        expect(updatedTree).toEqual(new Map([['x', 2]]));
    });

    test('delete existing Map entry', () => {
        const tree1: Map<string, number> = new Map([
            ['x', 1],
            ['y', 2],
        ]);
        const tree2: Map<string, number> = new Map([
            ['x', 1],
            ['y', 2],
        ]);

        const filter: Filter = {
            fixedKeys: {
                x: true
            }
        };

        const { proxy, getPatch } = recordPatch(tree1, filter);

        proxy.delete('x');
        proxy.delete('y');

        const patch = getPatch();

        const updatedTree = applyPatch(tree2, patch);

        expect(updatedTree).toEqual(new Map([['y', 2]]));
    });
});

// TODO: include function

// TODO: otherFields test, fixed include

// TODO: otherFields test, include function

// TODO: modify child tests


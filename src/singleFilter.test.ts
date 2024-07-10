import { Filter } from './Filter';
import { applyPatch } from './applyPatch';
import { recordPatch } from './recordPatch';

test('empty filter', () => {
    const tree1: Record<string, number> = { x: 1, y: 2 };
    const tree2: Record<string, number> = { x: 1 };

    const filter: Filter = {};

    const { getPatch } = recordPatch(tree1, filter);

    tree1.x = 2;
    tree1.y = 3;

    const patch = getPatch();

    const updatedTree = applyPatch(tree2, patch);

    expect(updatedTree).toEqual(tree2);
});

describe('include true, single fixed key', () => {
    test('reassign existing object field', () => {
        const tree1: Record<string, number> = { x: 1, y: 2 };
        const tree2: Record<string, number> = { x: 1, y: 2 };

        const filter: Filter = {
            fixedKeys: new Map([
                [
                    'x',
                    {
                        include: true,
                    },
                ],
            ]),
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
            fixedKeys: new Map([
                [
                    'x',
                    {
                        include: true,
                    },
                ],
            ]),
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
            fixedKeys: new Map([
                [
                    'x',
                    {
                        include: true,
                    },
                ],
            ]),
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

    // TODO: Equivalent array tests

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
            fixedKeys: new Map([
                [
                    'x',
                    {
                        include: true,
                    },
                ],
            ]),
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
            fixedKeys: new Map([
                [
                    'x',
                    {
                        include: true,
                    },
                ],
            ]),
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
            fixedKeys: new Map([
                [
                    'x',
                    {
                        include: true,
                    },
                ],
            ]),
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

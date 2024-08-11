import { describe, expect, test } from 'vitest';
import { ArrayOperationType } from './ArrayOperation';
import { Filter } from './Filter';
import { recordPatch } from './recordPatch';

test('empty filter', () => {
    const tree: Record<string, number> = { x: 1, y: 2 };

    const filter: Filter = {
        keys: new Map()
    };

    const { getPatch } = recordPatch(tree, filter);

    tree.x = 2;
    tree.y = 3;

    const patch = getPatch();

    expect(patch).toEqual({});
});

describe('modify root, include true, single fixed key', () => {
    test('reassign existing object field', () => {
        const tree: Record<string, number> = { x: 1, y: 2 };

        const filter: Filter = {
            keys: new Map([['x', true]])
        };

        const { proxy, getPatch } = recordPatch(tree, filter);

        proxy.x = 2;
        proxy.y = 3;

        const patch = getPatch();

        expect(patch).toEqual({
            s: new Map([['x', 2]])
        });
    });

    test('add new object field', () => {
        const tree: Record<string, number> = {};

        const filter: Filter = {
            keys: new Map([['x', true]])
        };

        const { proxy, getPatch } = recordPatch(tree, filter);

        proxy.x = 2;
        proxy.y = 3;

        const patch = getPatch();

        expect(patch).toEqual({
            s: new Map([['x', 2]])
        });
    });

    test('delete existing object field', () => {
        const tree: Record<string, number> = { x: 1, y: 2 };

        const filter: Filter = {
            keys: new Map([['x', true]])
        };

        const { proxy, getPatch } = recordPatch(tree, filter);

        delete proxy.x;
        delete proxy.y;

        const patch = getPatch();

        expect(patch).toEqual({
            d: new Set(['x'])
        });
    });

    test('reassign existing array item', () => {
        const tree: string[] = ['a', 'b'];

        const filter: Filter = {
            keys: new Map([[0, true]])
        };

        const { proxy, getPatch } = recordPatch(tree, filter);

        proxy[0] = 'A';
        proxy[1] = 'B';

        const patch = getPatch();

        expect(patch).toEqual({
            o: [
                {
                    o: ArrayOperationType.Set,
                    i: 0,
                    v: 'A',
                }
            ]
        });
    });

    test('add new array item', () => {
        const tree: string[] = [];

        const filter: Filter = {
            keys: new Map([[0, true]])
        };

        const { proxy, getPatch } = recordPatch(tree, filter);

        proxy[0] = 'A';
        proxy[1] = 'B';

        const patch = getPatch();

        expect(patch).toEqual({
            o: [
                {
                    o: ArrayOperationType.Set,
                    i: 0,
                    v: 'A',
                }
            ]
        });
    });

    // TODO: array delete test

    // TODO: array push test

    // TODO: array splice test

    // TODO: array shift test

    // TODO: array unshift test

    // TODO: array reverse test

    test('reassign existing Map entry', () => {
        const tree: Map<string, number> = new Map([
            ['x', 1],
            ['y', 2],
        ]);

        const filter: Filter = {
            keys: new Map([['x', true]])
        };

        const { proxy, getPatch } = recordPatch(tree, filter);

        proxy.set('x', 2);
        proxy.set('y', 3);

        const patch = getPatch();

        expect(patch).toEqual({
            s: new Map([['x', 2]])
        });
    });

    test('add new Map entry', () => {
        const tree: Map<string, number> = new Map();

        const filter: Filter = {
            keys: new Map([['x', true]])
        };

        const { proxy, getPatch } = recordPatch(tree, filter);

        proxy.set('x', 2);
        proxy.set('y', 3);

        const patch = getPatch();

        expect(patch).toEqual({
            s: new Map([['x', 2]])
        });
    });

    test('delete existing Map entry', () => {
        const tree: Map<string, number> = new Map([
            ['x', 1],
            ['y', 2],
        ]);
        const tree2: Map<string, number> = new Map([
            ['x', 1],
            ['y', 2],
        ]);

        const filter: Filter = {
            keys: new Map([['x', true]])
        };

        const { proxy, getPatch } = recordPatch(tree, filter);

        proxy.delete('x');
        proxy.delete('y');

        const patch = getPatch();

        expect(patch).toEqual({
            d: new Set(['x'])
        });
    });
});

// TODO: include function

// TODO: otherFields test, fixed include

// TODO: otherFields test, include function

// TODO: modify child tests


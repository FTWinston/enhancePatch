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
    test('filter field already exists', () => {
        const tree1: Record<string, number> = { x: 1, y: 2 };
        const tree2: Record<string, number> = { x: 1 };

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

    test("filter field doesn't already exists", () => {
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
});

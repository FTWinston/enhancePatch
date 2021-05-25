import { applyPatch } from '../applyPatch';
import type { Operation } from '../Operation';
import * as OperationType from '../OperationType';

describe('basic operations', () => {
    test('set string-keyed values', () => {
        const tree = {
            child: {},
        };

        const patch: Operation[] = [
            {
                o: OperationType.SetValue,
                //p: '',
                k: 'a',
                v: 1,
            },
            {
                o: OperationType.SetValue,
                //p: '',
                k: 'b',
                v: '2',
            },
            {
                o: OperationType.SetValue,
                p: 'child',
                k: 'c',
                v: '3',
            },
            {
                o: OperationType.SetValue,
                p: '',
                k: 'b',
                v: '4',
            },
            {
                o: OperationType.SetValue,
                p: 'child',
                k: 'grandchild',
                v: {
                    d: 5,
                },
            },
        ];

        const newTree = applyPatch(patch, tree);

        expect(newTree).toEqual({
            a: 1,
            b: '4',
            child: {
                c: '3',
                grandchild: {
                    d: 5,
                },
            },
        });
    });
});

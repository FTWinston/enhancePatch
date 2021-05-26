import { applyPatch } from '../applyPatch';
import type { Operation } from '../Operation';
import { OperationType } from '../OperationType';

describe('single value', () => {
    test('basic set', () => {
        const tree = {
            child: {},
        };

        const patch: Operation[] = [
            {
                o: OperationType.SingleValue,
                //p: '',
                k: 'a',
                v: 1,
            },
            {
                o: OperationType.SingleValue,
                //p: '',
                k: 'b',
                v: '2',
            },
            {
                o: OperationType.SingleValue,
                p: 'child',
                k: 'c',
                v: '3',
            },
            {
                o: OperationType.SingleValue,
                p: '',
                k: 'b',
                v: '4',
            },
            {
                o: OperationType.SingleValue,
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

    test('maps and sets', () => {
        const tree = {};

        const patch: Operation[] = [
            {
                o: OperationType.SingleValue,
                //p: '',
                k: 'a',
                v: {
                    x: 1,
                    y: 2,
                    z: '3',
                },
            },
            {
                o: OperationType.SingleValue,
                //p: '',
                k: 'b',
                v: new Map([
                    ['x', 1],
                    ['y', 2],
                    ['z', 3],
                ]),
            },
            {
                o: OperationType.SingleValue,
                k: 'c',
                v: new Map<any, any>([
                    ['x', 1],
                    ['y', 2],
                    ['z', '3'],
                ]),
            },
            {
                o: OperationType.SingleValue,
                p: 'c',
                k: 'w',
                v: 4,
            },
            {
                o: OperationType.SingleValue,
                p: 'c',
                k: 'x',
                v: 5,
            },
            {
                o: OperationType.SingleValue,
                p: '',
                k: 'b',
                v: new Set([1, 2, 4, 8]),
            },
            {
                o: OperationType.SingleValue,
                k: 'd',
                v: new Map<string, any>([
                    [
                        'e',
                        {
                            x: 1,
                            y: 2,
                            z: '3',
                        },
                    ],
                    [
                        'f',
                        new Map<string, any>([
                            ['x', 1],
                            ['y', 2],
                            ['z', '3'],
                        ]),
                    ],
                ]),
            },
        ];

        const newTree = applyPatch(patch, tree);

        expect(newTree).toEqual({
            a: {
                x: 1,
                y: 2,
                z: '3',
            },
            b: new Set([1, 2, 4, 8]),
            c: new Map<any, any>([
                ['w', 4],
                ['x', 5],
                ['y', 2],
                ['z', '3'],
            ]),
            d: new Map<string, any>([
                ['e', { x: 1, y: 2, z: '3' }],
                [
                    'f',
                    new Map<string, any>([
                        ['x', 1],
                        ['y', 2],
                        ['z', '3'],
                    ]),
                ],
            ]),
        });
    });

    test('dates', () => {
        const tree = {
            child: {},
        };

        const patch: Operation[] = [
            {
                o: OperationType.SingleValue,
                k: 'a',
                v: new Date(2020, 11, 31),
            },
            {
                o: OperationType.SingleValue,
                p: 'child',
                k: 'b',
                v: new Date(2021, 0, 0, 12, 0, 0),
            },
            {
                o: OperationType.SingleValue,
                k: 'a',
                v: new Date(2021, 11, 31),
            },
        ];

        const newTree = applyPatch(patch, tree);

        expect(newTree).toEqual({
            a: new Date(2021, 11, 31),
            child: {
                b: new Date(2021, 0, 0, 12, 0, 0),
            },
        });
    });
});

// TODO: multi value

// TODO: delete

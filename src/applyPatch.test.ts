import { applyPatch } from './applyPatch';
import type { Operation } from './Operation';
import { OperationType } from './OperationType';

describe('single value', () => {
    test('basic types', () => {
        const tree = {
            child: {
                grandchild: {},
            },
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
                p: 'child/grandchild',
                k: 'greatgrandchild',
                v: {
                    d: 5,
                },
            },
        ];

        const newTree = applyPatch(tree, patch);

        expect(newTree).toEqual({
            a: 1,
            b: '4',
            child: {
                c: '3',
                grandchild: {
                    greatgrandchild: {
                        d: 5,
                    },
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

        const newTree = applyPatch(tree, patch);

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

        const newTree = applyPatch(tree, patch);

        expect(newTree).toEqual({
            a: new Date(2021, 11, 31),
            child: {
                b: new Date(2021, 0, 0, 12, 0, 0),
            },
        });
    });
});

// TODO: multi value

describe('delete', () => {
    test('basic types', () => {
        const tree = {
            a: 1,
            b: '2',
            c: 3,
            child: {
                d: 4,
                grandchild: {
                    e: '5',
                    f: 6,
                },
            },
        };

        const patch: Operation[] = [
            {
                o: OperationType.Delete,
                k: 'a',
            },
            {
                o: OperationType.Delete,
                k: 'b',
            },
            {
                o: OperationType.Delete,
                p: 'child',
                k: 'd',
            },
            {
                o: OperationType.Delete,
                p: 'child/grandchild',
                k: 'f',
            },
        ];

        const newTree = applyPatch(tree, patch);

        expect(newTree).toEqual({
            c: 3,
            child: {
                grandchild: {
                    e: '5',
                },
            },
        });
    });

    test('maps and sets', () => {
        const tree = {
            a: new Map([
                ['a', 1],
                ['b', 2],
            ]),
            child: {
                grandchild: {
                    b: new Map([
                        ['a', 1],
                        ['b', 2],
                    ]),
                    c: new Map([
                        ['a', 1],
                        ['b', 2],
                    ]),
                },
                d: new Set([1, 2, 3, '4', '5']),
            },
        };

        const patch: Operation[] = [
            {
                o: OperationType.Delete,
                p: 'a',
                k: 'b',
            },
            {
                o: OperationType.Delete,
                p: 'child/grandchild/b',
                k: 'b',
            },
            {
                o: OperationType.Delete,
                p: 'child/grandchild',
                k: 'c',
            },
            {
                o: OperationType.Delete,
                p: 'child/d',
                k: 2,
            },
            {
                o: OperationType.Delete,
                p: 'child/d',
                k: [3, '4'],
            },
        ];

        const newTree = applyPatch(tree, patch);

        expect(newTree).toEqual({
            a: new Map([['a', 1]]),
            child: {
                grandchild: {
                    b: new Map([['a', 1]]),
                },
                d: new Set([1, '5']),
            },
        });
    });

    test('dates', () => {
        const tree = {
            a: new Date(2020, 0, 0),
            child: {
                b: new Date(),
                c: new Date(2020, 0, 0),
            },
        };

        const patch: Operation[] = [
            {
                o: OperationType.Delete,
                p: 'child',
                k: 'b',
            },
        ];

        const newTree = applyPatch(tree, patch);

        expect(newTree).toEqual({
            a: new Date(2020, 0, 0),
            child: {
                c: new Date(2020, 0, 0),
            },
        });
    });
});

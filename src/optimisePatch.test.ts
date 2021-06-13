import { Operation } from './Operation';
import { OperationType } from './OperationType';
import { optimisePatch } from './optimisePatch';

test('multiple keys on root object', () => {
    const patch: Operation[] = [
        {
            o: OperationType.Set,
            v: [['a', 1]],
        },
        {
            o: OperationType.Set,
            v: [['b', '1']],
        },
        {
            o: OperationType.Set,
            v: [['c', '3']],
        },
        {
            o: OperationType.Set,
            v: [['b', '4']],
        },
    ];

    expect(optimisePatch(patch)).toEqual([
        {
            o: OperationType.Set,
            v: [
                ['a', 1],
                ['b', '4'],
                ['c', '3'],
            ],
        },
    ]);
});

test('keys on multiple objects', () => {
    const patch: Operation[] = [
        {
            o: OperationType.Set,
            p: 'a',
            v: [['1', '1']],
        },
        {
            o: OperationType.Set,
            p: 'b',
            v: [['2', '2']],
        },
        {
            o: OperationType.Set,
            v: [['3', '3']],
        },
        {
            o: OperationType.Set,
            p: 'b',
            v: [['5', '5']],
        },
        {
            o: OperationType.Set,
            p: 'a',
            v: [['6', '6']],
        },
        {
            o: OperationType.Set,
            v: [['7', '7']],
        },
        {
            o: OperationType.Set,
            p: 'a',
            v: [['1', 'x']],
        },
    ];

    expect(optimisePatch(patch)).toEqual([
        {
            o: OperationType.Set,
            p: 'a',
            v: [
                ['1', 'x'],
                ['6', '6'],
            ],
        },
        {
            o: OperationType.Set,
            p: 'b',
            v: [
                ['2', '2'],
                ['5', '5'],
            ],
        },
        {
            o: OperationType.Set,
            v: [
                ['3', '3'],
                ['7', '7'],
            ],
        },
    ]);
});

test('amending newly set parent', () => {
    const patch: Operation[] = [
        {
            o: OperationType.Set,
            v: [['a', {}]],
        },
        {
            o: OperationType.Set,
            p: 'a',
            v: [['b', '1']],
        },
    ];

    // If this were actually generated by applying it to an object,
    // the object set in the first operation would have been updated
    // by the action that created the second operation.
    // That hasn't happened here, but there's no need for patch optimisation
    // to recreate this functionality.
    // However, this does make the expected value look odd.
    expect(optimisePatch(patch)).toEqual([
        {
            o: OperationType.Set,
            v: [
                [
                    'a',
                    {
                        /* b: 1 */
                    },
                ],
            ],
        },
    ]);
});

// TODO: deleting patched objects

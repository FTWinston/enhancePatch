import { MapPatch, ObjectPatch, SetPatch } from './Patch';
import { filterPatch } from './filterPatch';

describe('object', () => {
    const fullPatch: ObjectPatch = {
        s: {
            set1: 'hi',
            set2: {},
            set3: 3,
        },
        d: ['del1', 'del2'],
        c: {
            child1: {},
            child2: {},
        },
    };

    const keys = new Set(['set2', 'set3', 'del1', 'child1']);

    test('full patch', () => {
        expect(filterPatch(fullPatch, keys)).toEqual({
            s: {
                set2: {},
                set3: 3,
            },
            d: ['del1'],
            c: {
                child1: {},
            },
        });
    });

    test('just s', () => {
        expect(filterPatch({ s: fullPatch.s }, keys)).toEqual({
            s: {
                set2: {},
                set3: 3,
            },
        });
    });

    test('just d', () => {
        expect(filterPatch({ d: fullPatch.d }, keys)).toEqual({
            d: ['del1'],
        });
    });

    test('just c', () => {
        expect(filterPatch({ c: fullPatch.c }, keys)).toEqual({
            c: {
                child1: {},
            },
        });
    });
});

describe('map', () => {
    const fullPatch: MapPatch = {
        s: [
            ['set1', 'hi'],
            ['set2', {}],
            ['set3', 3],
        ],
        d: ['del1', 'del2'],
        c: {
            child1: {},
            child2: {},
        },
        C: {
            5: {},
            6: {},
        },
    };

    const keys = new Set(['set2', 'set3', 'del1', 'child1', 6]);

    test('full patch', () => {
        expect(filterPatch(fullPatch, keys)).toEqual({
            s: [
                ['set2', {}],
                ['set3', 3],
            ],
            d: ['del1'],
            c: {
                child1: {},
            },
            C: {
                6: {},
            },
        });
    });

    test('delete all', () => {
        expect(filterPatch({ ...fullPatch, d: true }, keys)).toEqual({
            s: [
                ['set2', {}],
                ['set3', 3],
            ],
            d: true,
            c: {
                child1: {},
            },
            C: {
                6: {},
            },
        });
    });

    test('just s', () => {
        expect(filterPatch({ s: fullPatch.s }, keys)).toEqual({
            s: [
                ['set2', {}],
                ['set3', 3],
            ],
        });
    });

    test('just d', () => {
        expect(filterPatch({ d: fullPatch.d }, keys)).toEqual({
            d: ['del1'],
        });
    });

    test('just c', () => {
        expect(filterPatch({ c: fullPatch.c }, keys)).toEqual({
            c: {
                child1: {},
            },
        });
    });

    test('just C', () => {
        expect(filterPatch({ C: fullPatch.C }, keys)).toEqual({
            C: {
                6: {},
            },
        });
    });
});

describe('set', () => {
    const fullPatch: SetPatch = {
        a: ['add1', 'add2', 'add3'],
        d: ['del1', 'del2', 'del3'],
    };

    const keys = new Set(['add2', 'del3']);

    test('full patch', () => {
        expect(filterPatch(fullPatch, keys)).toEqual({
            a: ['add2'],
            d: ['del3'],
        });
    });

    test('delete all', () => {
        expect(filterPatch({ ...fullPatch, d: true }, keys)).toEqual({
            a: ['add2'],
            d: true,
        });
    });

    test('just a', () => {
        expect(filterPatch({ a: fullPatch.a }, keys)).toEqual({
            a: ['add2'],
        });
    });

    test('just d', () => {
        expect(filterPatch({ d: fullPatch.d }, keys)).toEqual({
            d: ['del3'],
        });
    });
});

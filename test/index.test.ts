import Qable from "../src";
import { N } from "../src/gen";

const ARRAY = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

function* genArray() {
    for (const elem of ARRAY)
        yield elem;
}

describe('Qable Constructor', () => {
    it ('should initialize with a simple array', () => {
        const q = new Qable(ARRAY);
        expect([...q]).toEqual([...ARRAY]);
    });

    it ('should initialize with a generator', () => {
        const q = new Qable(genArray());
        expect([...q]).toEqual(ARRAY);
    });

    it ('should initialize with a set', () => {
        const q = new Qable(new Set(ARRAY));
        expect([...q]).toEqual(ARRAY);
    });
});

describe('Qable.map()', () => {
    it ('should map t => t * 2', () => {
        const q = new Qable([1, 2, 3]).map(t => String(t));
        expect([...q]).toEqual(["1", "2", "3"]);
    });
});

describe('Qable.filter()', () => {
    it ('should filter non-even', () => {
        const q = new Qable(ARRAY).filter(t => t % 2 === 0)
        expect([...q]).toEqual([2, 4, 6, 8, 10]);
    });

    it ('should ', () => {
        const q = new Qable(ARRAY).filter(t => t % 2 === 0)
        expect([...q]).toEqual([2, 4, 6, 8, 10]);
    });
});

describe('Qable.nth()', () => {
    it ('nth(5) should return 5th element', () => {
        const q = new Qable(ARRAY).nth(5);
        expect(q).toEqual(6);
    });

    it ('should return undefined when out of bounds', () => {
        const q = new Qable(ARRAY).nth(10);
        expect(q).toEqual(undefined);
    });
});

describe('Qable.paginate()', () => {
    it ('should paginate by 3', () => {
        const q = new Qable(ARRAY).paginate(3);
        expect(q.first()).toEqual([1, 2, 3]);
        expect(q.second()).toEqual([4, 5, 6]);
        expect(q.nth(2)).toEqual([7, 8, 9]);
        expect(q.nth(3)).toEqual([10]);
        expect(q.nth(4)).toEqual(undefined);
    });

    it ('should paginate by more than length, producing a single page', () => {
        const q = new Qable(ARRAY).paginate(20);
        expect(q.first()).toEqual([...ARRAY]);
        expect(q.second()).toEqual(undefined);
    });
});

describe('Laziness', () => {
    it ('should not hang when looking for a known item', () => {
        expect(N.find(5)).toEqual(5);
    });

    it ('should filter through an infinite generator and not hang', () => {
        expect(N.filter(t => t % 2 === 0).nth(4)).toBe(8);
    });
});

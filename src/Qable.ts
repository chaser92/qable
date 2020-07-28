import * as QableSymbol from "./QableSymbol";
import { IterableWithSlice, IterableWithLength, Reducer, Maybe } from "./types";
import { IterableWithNth } from "./types";
import { Predicate, Mapper, Action, Comparator } from "./types";
import runQuery from "./query";

function equals<T>(a: T, b: T) {
    return a === b;
}

class Qable<T> implements Iterable<T> {
    _iterable: Iterable<T>
    _partial: boolean
    _parameter: any

    public static Symbol = QableSymbol;

    constructor(iterable: Iterable<T>, isPartial?: boolean) {
        this._iterable = iterable;
        this._partial = !!isPartial;
        return new Proxy(this, {
            get: (target, prop) => {
                if (typeof prop === "string") {
                    return target.query(prop);
                } else {
                    return Reflect.get(target, prop);
                }
            }
        });
    }

    [key: string]: unknown

    [QableSymbol.slice](from: number, to = Infinity, step = 1): Qable<T> {
        if (QableSymbol.slice in this.iterable) {
            return Qable.of(this._iterable as IterableWithSlice<T>)[QableSymbol.slice](from, to, step);
        }
        const iterable = this.skip(from).take(to - from);
        return Qable.fromGeneratorFn(function *() {
            var counter = 0;
            for (const item of iterable) {
                if (counter % step === 0)
                    yield item;
                counter++;
            }
        });
    }

    [QableSymbol.nth](id: number): Maybe<T> {
        if (Qable.Symbol.nth in this.iterable)
            return (this._iterable as IterableWithNth<T>)[QableSymbol.nth](id);
        let counter = 0;
        for (const item of this.iterable) {
            if (counter === id)
                return item;
            counter++;
        }

    }

    get iterable() {
        return this._iterable;
    }

    get isPartial() {
        return !!this._partial;
    }

    get parameter() {
        return this._parameter;
    }

    first() {
        return this.nth(0);
    }

    second(): T {
        return this.nth(1);
    }

    last(): T {
        let last: T = null;
        for (const item of this.iterable)
            last = item;
        return last;
    }

    nth(id: number): Maybe<T> {
        return this[QableSymbol.nth](id);
    }

    skip(n: number): Qable<T> {
        var iterable = this.iterable;
        return Qable.fromGeneratorFn(function*() {
            let counter = 0;
            for (const item of iterable) {
                if (counter >= n)
                    yield item;
                counter++;
            }
        });
    }

    take(n: number): Qable<T> {
        var iterable = this.iterable;
        return Qable.fromGeneratorFn(function*() {
            let counter = 0;
            for (const item of iterable) {
                if (counter < n)
                    yield item;
                else
                    return;
                counter++;
            }
        });
    }

    slice(from: number, to = Infinity, step = 1) {
        return this[QableSymbol.slice](from, to, step);
    }

    split(separator: T, comparator: Comparator<T> = equals) {
        const iterable = this.iterable;
        return Qable.fromGeneratorFn(function*() {
            const buffer = [];
            for (const item of iterable) {
                if (comparator(separator, item)) {
                    if (buffer.length > 0)
                        yield buffer;
                } else {
                    buffer.push(item);
                }
            }
            if (buffer.length > 0)
                yield buffer;
        });
    }

    toArray() {
        return Array.from(this.iterable);
    }

    toObject(
        keyRetriever: Mapper<T, string | number> = (_, id) => id,
        valueRetriever: Mapper<T, T> = (value, _) => value): Record<string | number, T>  {
        let result: Record<string, T> = {};
        let counter = 0;
        for (const item of this.iterable) {
            const key = keyRetriever(item, counter);
            const value = valueRetriever(item, counter);
            counter++;
            result[key] = value;
        }
        return result;
    }

    toMap(
        keyRetriever: Mapper<T, string | number> = (_, id) => id,
        valueRetriever: Mapper<T, T> = (value, _) => value): Map<string | number, T> {
        const kvPairs = [...this.map((item, id) => [keyRetriever(item, id), valueRetriever(item, id)])];
        return new Map(kvPairs);
    }

    static of<T>(iterable: Iterable<T>): Qable<T> {
        if (iterable instanceof Qable)
            return iterable as Qable<T>;
        else if (iterable[Symbol.iterator])
            return new Qable<T>(iterable);
        else
            throw new Error("Not an iterable: " + iterable);
    }

    flatten(): Qable<T> {
        var iterable = this.iterable;
        return Qable.fromGeneratorFn(function* () {
            for (const item of iterable) {
                if (Symbol.iterator in item)
                    yield* Qable.of(item as unknown as Iterable<T>).flatten();
                else
                    yield item;
            } 
        });
    }

    a() {
        return this.toArray();
    }

    // unsafe!
    item(keyOrId: string | number): T | undefined {
        if (keyOrId in this.iterable)
            // @ts-ignore
            return this.iterable[keyOrId] as T;
    }

    map<U>(mapper: (elem: T, id?: number, iterable?: Iterable<T>, param?: any) => U) {
        var iterable = this.iterable;
        var param = this.parameter;
        return Qable.fromGeneratorFn(function* () {
            var counter = 0;
            for (var item of iterable) {
                yield mapper(item, counter, iterable, param);
                counter++;
            }
        });
    }

    filter(pred: Predicate<T>) {
        const iterable = this.iterable;
        const param = this.parameter;
        return Qable.fromGeneratorFn(function* () {
            let counter = 0;
            for (const item of iterable) {
                if (pred(item, counter))
                    yield item;
                counter++;
            }
        });
    }

    reduce<U>(reducer: Reducer<T, U>, acc: U): U {
        var iterable = this.iterable;
        var counter = 0;
        for (const item of iterable) {
            acc = reducer(acc, item, counter);
            counter++;
        }
        return acc;
    }

    each(action: Action<T>) {
        this.map(action);
    }

    count(): number {
        // some iterables return their length in constant time, like arrays
        if (Symbol.length in this.iterable)
            return (this.iterable as IterableWithLength<T>)[QableSymbol.length];
        let counter = 0;
        for (const _ of this.iterable)
            counter++;
        return counter;
    }

    query<I extends Qable<T> | T[]>(str: string): I {
        return runQuery<T, I>(str, this);
    }

    paginate(perPage: number) {
        var iterable = this.iterable;
        return Qable.fromGeneratorFn(function*() {
            let buffer = [];
            let counter = 0;
            for (const item of iterable) {
                buffer.push(item);
                counter++;
                if (counter % perPage === 0) {
                    yield buffer;
                    buffer = [];
                }
            }
            if (buffer.length > 0)
                yield buffer;
        });
    }

    push<U>(item: U): Qable<T | U> {
        return this.concat([item]);
    }

    concat<U>(anotherIterable: Iterable<U>) {
        var iterable = this.iterable;
        return Qable.fromGeneratorFn(function* () {
            yield* iterable;
            yield* anotherIterable;
        })
    }

    unshift<U>(item: U): Qable<U | T> {
        const iterable = this.iterable;
        return Qable.fromGeneratorFn(function* () {
            yield item;
            yield* iterable;
        })
    }

    partial() {
        return new Qable(this, true);
    }

    apply(...args: T[]) {
        if (args.length === 0)
            return;
        if (this._partial) {
            this._partial = false;
            this._parameter = args[0];
        }
        if (this.iterable instanceof Qable)
            this.iterable.apply(args.slice(1));
    }

    contains(item: T, comparator: Comparator<T> = (a, b) => a === b) {
        return this.some(z => comparator(item, z));
    }

    find(item: T, comparator: Comparator<T> = (a, b) => a === b): Maybe<T> {
        for (const item2 of this.iterable)
            if (comparator(item, item2))
                return item2;
    }

    some(pred: Predicate<T>): boolean {
        let counter = 0;
        for (const item of this.iterable)
            if (pred(item, counter))
                return true;
            counter++;
        return false;
    }

    every(pred: Predicate<T>): boolean {
        let counter = 0;
        for (const item of this.iterable)
            if (!pred(item, counter))
                return false;
        return true;
    }

    get [Symbol.iterator]() {
        if (this.isPartial)
            throw "Unable to iterate over a partial Qable that has not been applied; use apply()";
        return this.iterable[Symbol.iterator].bind(this.iterable);
    }

    get preview(): (T | string)[] {
        if (this.isPartial)
            return ["Partial Qable"]
        return this.slice(0, 10).toArray();
    }

    static fromGeneratorFn<T, U, V>(generator: () => Generator<T, U, V>) {
        return new Qable({
            [Symbol.iterator]: () => generator()
        });
    }

    static extend(plugin: (qable: typeof Qable) => void) {
        plugin(Qable);
    }
}

export default Qable;
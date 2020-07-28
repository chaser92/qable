import _Qable from "./Qable";
import * as QableSymbol from "./QableSymbol";
import { Predicate, Reducer, Mapper } from "./types";

export default class QableAsync<T> {
    iterable: AsyncIterable<T>;

    constructor(_iterable: Iterable<T> | AsyncIterable<T>) {
        this.iterable = QableAsync.asyncIterableOf(_iterable);
    }

    static asyncIterableOf<T>(iterable: AsyncIterable<T> | Iterable<T>) {
        if (Symbol.asyncIterator in iterable)
            return iterable as AsyncIterable<T>;
        else
            return {
                [Symbol.asyncIterator]: async function*() {
                    for (const item of iterable as Iterable<T>)
                        yield item;
                }
            }
    };

    get [Symbol.asyncIterator]() {
        return this.iterable[Symbol.asyncIterator];
    }

    async nth(num: number): Promise<T> {
        var counter = 0;
        for await (var item of this.iterable) {
            if (counter === num)
                return item;
            counter++;
        }
    }
    
    filter(pred: Predicate<T>): QableAsync<T> {
        var iterable = this.iterable;
        var counter = 0;
        return QableAsync.fromAsyncGeneratorFn(async function* () {
            for await (const item of iterable) {
                if (pred(item, counter))
                    yield item;
                counter++;
            }
        });
    }

    query(str: string) {
        return Qable.query(str, this);
    }

    map<U>(mapper: Mapper<T, U>) {
        var iterable = this.iterable;
        var counter = 0;
        return QableAsync.fromAsyncGeneratorFn(async function* () {
            for await (var item of iterable) {
                yield mapper(item, counter);
                counter++;
            }
        });
    }

    slice(from: number, to = Infinity, step = 1) {
        var iterable = this.iterable;
        return QableAsync.fromAsyncGeneratorFn(async function*() {
            let counter = 0;
            for await (const item of iterable) {
                if (counter >= from && (counter - from) % step === 0)
                    yield item;
                counter++;
                if (counter >= to)
                    return;
            }
        });
    }

    concat<U>(iterable: Iterable<U>): QableAsync<T | U> {
        return QableAsync.fromAsyncGeneratorFn(async function* () {
            yield* this;
            yield* QableAsync.asyncIterableOf(iterable);
        });
    }

    async reduce<U>(reducer: Reducer<T, U>, acc: U): Promise<U> {
        var iterable = this.iterable;
        var counter = 0;
        for await (const item of iterable) {
            acc = reducer(acc, item, counter);
            counter++;
        }
        return acc;
    }

    async all(pred: Predicate<T>) {
        const iterable = this.iterable;
        let index = -1;
        for await (var item of iterable) {
            if (!pred(item, index++))
                return false;
        }
        return true;
    }

    async any(pred: Predicate<T>) {
        var iterable = this.iterable;
        let index = -1;
        for await (const item of iterable) {
            if (pred(item, index++))
                return true;
        }
        return false;
    }

    async toArray() {
        var result = [];
        for await (const item of this.iterable) {
            result.push(item);
        }
        return result;
    }

    static fromAsyncGeneratorFn<T, U>(asyncGeneratorFn: () => AsyncGenerator<T, U, V>) {
        return new QableAsync<T>({
            [Symbol.asyncIterator]: asyncGeneratorFn
        });
    }

    static fromEventEmitter<T>(listener: EventEmitter, event: string) {
        return QableAsync.fromAsyncGeneratorFn(async function*() {
            let resolver: (item: T) => void;
            let current = new Promise(resolve => resolver = resolve);
            listener.on(event, (data: T) => {
                resolver(data);
                current = new Promise(resolve => resolver = resolve);
            });
            while (true)
                yield resolver;
        });
    }
}

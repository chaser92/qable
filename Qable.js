class Qable {
    constructor(iterable) {
        this._iterable = iterable;
        return new Proxy(this, {
            get: (target, prop, receiver) => {
                if (typeof prop === "string") {
                    return target.query(prop);
                } else {
                    return Reflect.get(target, prop);
                }
            }
        });
    }

    // () => Iterable<T>
    get iterable() {
        return this._iterable;
    }

    // () => T
    first() {
        return this.nth(0);
    }

    // () => T
    second() {
        return this.nth(1);
    }

    // () => T
    last() {
        var last = null;
        for (var item of this.iterable)
            last = item;
        return last;
    }

    // (Number) => T 
    nth(num) {
        var counter = 0;
        for (var item of this.iterable) {
            if (counter === num)
                return item;
            counter++;
        }
    }

    skip(n) {
        var iterable = this.iterable;
        return Qable.fromGeneratorFn(function*() {
            var counter = 0;
            for (var item of iterable) {
                if (counter >= n)
                    yield item;
                counter++;
            }
        });
    }

    take(n) {
        var iterable = this.iterable;
        return Qable.fromGeneratorFn(function*() {
            var counter = 0;
            for (var item of iterable) {
                if (counter < n)
                    yield item;
                else
                    return;
                counter++;
            }
        });
    }


    // (Number, [Number], [Number]) => Qable<T>
    slice(from, to = Infinity, step = 1) {
        var iterable = this.skip(from).take(to);
        return Qable.fromGeneratorFn(function*() {
            var counter = 0;
            for (var item of iterable) {
                if (counter % step === 0)
                    yield item;
                counter++;
            }
        });
    }

    split(separator, comparator = null) {
        if (!comparator)
            comparator = (a, b) => a === b;
        var iterator = this.iterator;
        return Qable.fromGeneratorFn(function*() {
            var buffer = [];
            for (item of iterator) {
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
        return Array.from(this);
    }

    toObject(keyRetriever = ([k, _]) => k, valueRetriever = ([_, v]) => v) {
        var result = {};
        for (item of this.iterable) {
            const key = keyRetriever(item);
            const value = valueRetriever(item);
            result[key] = value;
        }
        return result;
    }

    toMap(keyRetriever = ([k, _]) => k, valueRetriever = ([_, v]) => v, isWeakMap = false) {
        var kvPairs = [...this.map(item => [keyRetriever(item), valueRetriever(item)])];
        if (isWeakMap)
            return new WeakMap(kvPairs);
        else
            return new Map(kvPairs);
    }

    static of(iterable) {
        if (iterable instanceof Qable)
            return iterable;
        else if (iterable[Symbol.iterator])
            return new Qable(iterable);
        else
            throw "Not an iterable: " + iterable;
    }

    flatten() {
        var iterable = this.iterable;
        return Qable.fromGeneratorFn(function* () {
            for (var item of iterable) {
                if (item[Symbol.iterator])
                    yield* Qable.of(item).flatten();
                else
                    yield item;
            } 
        });
    }

    a() {
        return Array.from(this);
    }

    // Key => Qable<T>
    item(keyOrId) {
        return this.iterable[keyOrId];
    }

    // (T => Any) => Qable<Any>
    map(mapper) {
        var iterable = this.iterable;
        return Qable.fromGeneratorFn(function* () {
            for (var item of iterable)
                yield mapper(item);
        });
    }

    // (T => Boolean) => Qable<T>
    filter(pred) {
        var iterable = this.iterable;
        var counter = 0;
        return Qable.fromGeneratorFn(function* () {
            for (var item of iterable) {
                if (pred(item, counter))
                    yield item;
                counter++;
            }
        });
    }

    // (A, T, Number) => Qable<A> where A: Iterable
    reduce(reducer, acc) {
        var iterable = this.iterable;
        var counter = 0;
        return Qable.fromGeneratorFn(function* () {
            for (var item of iterable) {
                acc = reducer(acc, item, counter);
                counter++;
            }
            yield* acc;
        });
    }

    each(action) {
        this.map(action);
        return this;
    }

    pick(key) {
        return this.map(t => t[key]);
    }

    count() {
        // some iterables return their length in constant time, like arrays
        if (this.iterable[Symbol.length])
            return this.iterable[Symbol.length];
        var counter = 0;
        for (var _ of this.iterable)
            counter++;
        return counter;
    }

    query(str) {
        return Qable.query(str, this);
    }

    paginate(perPage) {
        var iterable = this.iterable;
        return Qable.fromGeneratorFn(function*() {
            var buffer = [];
            var counter = 0;
            for (var item of iterable) {
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

    // immutable
    push(item) {
        return this.concat([item]);
    }

    concat(anotherIterable) {
        var iterable = this.iterable;
        return Qable.fromGeneratorFn(function* () {
            yield* iterable;
            yield* anotherIterable;
        })
    }

    unshift(item) {
        var iterable = this.iterable;
        return Qable.fromGeneratorFn(function* () {
            yield item;
            yield* iterable;
        })
    }

    contains(item, comparator = (a,b) => a === b) {
        return this.some(z => comparator(item, z));
    }

    some(pred) {
        for (var item of this.iterable)
            if (pred(this.iterable))
                return true;
        return false;
    }

    every(pred) {
        for (var item of this.iterable)
            if (!pred(this.iterable))
                return false;
        return true;
    }

    get [Symbol.iterator]() {
        return this.iterable[Symbol.iterator].bind(this.iterable);
    }

    get preview() {
        return this.slice(0, 10).toArray();
    }

    static fromGeneratorFn(generator) {
        return new Qable({
            [Symbol.iterator]: () => generator()
        });
    }

    static extend(plugin) {
        plugin(Qable);
    }
}
Qable.query = require("./query")(Qable);

module.exports = Qable;
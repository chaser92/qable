class Qable {
    constructor(iterable) {
        if (!(Symbol.iterator in iterable))
            throw "Qable initialized with a non-iterable: ", iterable;
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
   
    // () => T
    single() {
        return this.first();
    }

    // () => 
    nth(num) {
        var counter = 0;
        for (var item of this.iterable) {
            if (counter === num)
                return item;
            counter++;
        }
    }

    slice(from, to = Infinity, step = 1) {
        var iterable = this.iterable;
        return Qable.fromGeneratorFn(function*() {
            var counter = 0;
            for (var item of iterable) {
                if (counter >= from && (counter - from) % step === 0)
                    yield item;
                counter++;
                if (counter >= to)
                    return;
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

    pick(key) {
        return this.map(t => t[key]);
    }

    count() {
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

    get [Symbol.iterator]() {
        return this.iterable[Symbol.iterator].bind(this.iterable);
    }

    get preview() {
        return [...this.slice(0, 10)];
    }

    static fromGeneratorFn(generator) {
        return new Qable({
            [Symbol.iterator]: () => generator()
        });
    }
}

Qable.Gen = require("./gen")(Qable);

Qable.filters = require("./filters");
Qable.query = require("./query")(Qable);

module.exports = Qable;
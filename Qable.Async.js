const Qable = require("./Qable");

module.exports = Qable => 
Qable.Async = class QableAsync extends Qable {
    constructor(iterable) {
        return super(QableAsync.asyncIterableOf(iterable));
    }

    static asyncIterableOf(iterable) {
        if (iterable[Symbol.asyncIterator])
            return iterable;
        else
            return {
                [Symbol.asyncIterator]: async function*() {
                    for (var item of iterable)
                        yield item;
                }
            }
    };

    get [Symbol.iterator]() {
        return null;
    }

    get [Symbol.asyncIterator]() {
        return this._iterable[Symbol.asyncIterator];
    }

    async nth(num) {
        var counter = 0;
        for await (var item of this.iterable) {
            if (counter === num)
                return item;
            counter++;
        }
    }
    
    filter(pred) {
        var iterable = this.iterable;
        var counter = 0;
        return QableAsync.fromAsyncGeneratorFn(async function* () {
            for await (var item of iterable) {
                if (pred(item, counter))
                    yield item;
                counter++;
            }
        });
    }

    query(str) {
        return Qable.query(str, this);
    }

    map(mapper) {
        var iterable = this.iterable;
        var counter = 0;
        return QableAsync.fromAsyncGeneratorFn(async function* () {
            for await (var item of iterable) {
                yield mapper(item, counter);
                counter++;
            }
        });
    }

    slice(from, to = Infinity, step = 1) {
        var iterable = this.iterable;
        return QableAsync.fromAsyncGeneratorFn(async function*() {
            var counter = 0;
            for await (var item of iterable) {
                if (counter >= from && (counter - from) % step === 0)
                    yield item;
                counter++;
                if (counter >= to)
                    return;
            }
        });
    }

    reduce(reducer, acc) {
        var iterable = this.iterable;
        var counter = 0;
        return Qable.fromAsyncGeneratorFn(async function* () {
            for await (var item of iterable) {
                acc = reducer(acc, item, counter);
                counter++;
            }
            yield* acc;
        });
    }

    async all(pred) {
        var iterable = this.iterable;
        for await (var item of iterable) {
            if (!pred(item))
                return false;
        }
        return true;
    }

    async any(pred) {
        var iterable = this.iterable;
        for await (var item of iterable) {
            if (pred(item))
                return true;
        }
        return false;
    }

    async toArray() {
        var result = [];
        for await (var item of this.iterable) {
            result.push(item);
        }
        return result;
    }

    static fromAsyncGeneratorFn(asyncGenerator) {
        return new QableAsync({
            [Symbol.asyncIterator]: asyncGenerator
        });
    }

    static fromEventEmitter(listener, event) {
        return Qable.Async.fromAsyncGeneratorFn(async function*() {
            var resolver;
            var current = new Promise(resolve => resolver = resolve);
            listener.on(event, (data) => {
                resolver(data);
                current = new Promise(resolve => resolver = resolve);
            });
            while (true)
                yield await resolver;
        });
    }
}

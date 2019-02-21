const Qable = require("./Qable");

class QableAsync extends Qable {
    constructor(iterable) {
        return super(iterable);
    }

    async nth(num) {
        var counter = 0;
        for await (var item of this.iterable) {
            if (counter === num)
                return item;
            counter++;
        }
    }
    
    async filter(pred) {
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

    async map(pred) {
        var iterable = this.iterable;
        var counter = 0;
        return QableAsync.fromAsyncGeneratorFn(async function* () {
            for await (var item of iterable) {
                yield mapper(item, counter);
                counter++;
            }
        });
    }

    async each(action) {

    }

    async reduce(reducer, acc) {

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
        return Promise.all([...this.iterable]);    
    }

    static fromAsyncGeneratorFn(asyncGenerator) {
        return new QableAsync({
            [Symbol.iterator]: asyncGenerator()
        });
    }

}
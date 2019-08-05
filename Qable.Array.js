// optimizations for making an array random-access fast

module.exports = Qable => 
Qable.Array = class QableArray extends Qable {
    [Qable.Symbol.slice](from, to = Infinity, step = 1) {
        var slice = new Qable(this._iterable.slice(from, to));
        return step === 1 ? slice : slice.filter((_, id) => id % step === 0);
    }

    [Qable.Symbol.nth](id) {
        return this._iterable[id];
    }
}
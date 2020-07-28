// optimizations for making an array random-access fast

import Qable from "./Qable";

export default class QableArray<T> extends Qable<T> {
    [Qable.Symbol.slice](from: number, to = Infinity, step = 1) {
        const slice = new Qable((this._iterable as T[]).slice(from, to));
        return step === 1 ? slice : slice.filter((_, id) => id % step === 0);
    }

    [Qable.Symbol.nth](id: number) {
        return (this._iterable as T[])[id];
    }
}
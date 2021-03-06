// normally, Qable uses iteration to perform slice and nth operation,
// which are O(n).
// However, certain data structures (e.g. arrays, trees) offer a faster
// lookup. One can implement an override of iteration-based slices
// that leverages additional properties of the data structure.

export const slice = Symbol("Qable.Symbol.slice");
export const nth = Symbol("Qable.Symbol.nth");
export const length = Symbol("Qable.Symbol.length");
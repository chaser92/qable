import * as QableSymbol from "./QableSymbol";

export type Maybe<T> = T | undefined;
export type Predicate<T> = (item: T, index: number) => boolean;
export type Mapper<T, U> = (item: T, index: number) => U
export type Reducer<T, U> = (acc: U, item: T, index: number) => U
export type Comparator<T> = (a: T, b: T) => boolean
export type Action<T> = (item: T) => void
export type IterableWithSlice<T> = Iterable<T> & {
    [QableSymbol.slice]: (from: number, to: number, step?: number) => Iterable<T>
}
export type IterableWithNth<T> = Iterable<T> & {
    [QableSymbol.nth]: (id: number) => T
}
export type IterableWithLength<T> = Iterable<T> & {
    readonly [QableSymbol.length]: number
}
export type StringIndexable<T> = Iterable<T> & {
    [key: string]: T
}
export type NumberIndexable<T> = Iterable<T> & {
    [key: number]: T
}
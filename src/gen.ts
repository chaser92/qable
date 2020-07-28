import _Qable from "./Qable";
import Qable from ".";

type FSEntry = {
    name: string,
    entries: _Qable<FSEntry>
}

export const N = Qable.fromGeneratorFn(function* () {
        var counter = -1;
        while (true) {
            yield counter++;
        }      
    });

export const uppercase = Qable.fromGeneratorFn(function* () {
        for (let i=65; i<91; i++)
            yield String.fromCharCode(i);
    });

    /*
    fs: function fs(root: string): _Qable<FSEntry> {
        return Qable.fromGeneratorFn(function* () {
           yield* readdirSync(root).map(t => ({
               name: t,
               entries: fs(join(root, t)),
               get [Symbol.iterator]() {
                   return this.entries[Symbol.iterator];
               }
            }));
         });
    }
}};
*/
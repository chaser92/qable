module.exports = Qable => ({
    N: Qable.fromGeneratorFn(function* () {
        var counter = 0;
        while (true) {
            yield counter;
            counter++;
        }      
    }),

    uppercase: Qable.fromGeneratorFn(function* () {
        for (var i=65; i<91; i++)
            yield String.fromCharCode(i);
    }),

    fs: function fs(root) {
        return Qable.fromGeneratorFn(function* () {
           const readdirSync = require("fs").readdirSync;
           const join = require("path").join;
           yield* readdirSync(root).map(t => ({
               name: t,
               entries: fs(join(root, t)),
               get [Symbol.iterator]() {
                   return this.entries[Symbol.iterator];
               }
            }));
         });
    }
})
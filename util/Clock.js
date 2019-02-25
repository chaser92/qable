const Qable = require("..");

module.exports = (interval, limit=Infinity) => Qable.Async.fromAsyncGeneratorFn(async function*() {
    var counter = 0;
    const id = setInterval(() => {
        counter++;
        if (counter >= limit)
            clearInterval(id);
        yield Date.now();

    }, interval);
});
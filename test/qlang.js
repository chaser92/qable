const Qable = require("..");

const { expect, request } = require('chai');

describe("Qlang Interpreter on Int Array", () => {
    const q = new Qable([1, 2, 3, 4, 5, 6, 7]);
    [
        { query: ".", result: [1,2,3,4,5,6,7] },
//        { query: "#", result: [0,1,2,3,4,5,6] },
        { query: ".<3", result: [1,2] },
        { query: ".>3", result: [4,5,6,7] },
        { query: ".=3", result: [3] },
        { query: ".=.", result: [1,2,3,4,5,6,7] },
        { query: "#<2", result: [1,2] },
        { query: ".?", result: [1,2,3,4,5,6,7]},
        { query: "#?", result: [2,3,4,5,6,7]},
        { query: ".<=4", result: [1,2,3,4]},
        { query: ":", result: [...q] },
        { query: "::", result: [...q] },
        { query: "0:", result: [...q] },
        { query: "0:2", result: [1,2] },
        { query: "5:", result: [6,7] },
        { query: ":2", result: [1,2] },
        { query: "10:", result: [] },
        { query: ":0", result: [] },
        { query: "::2", result: [1,3,5,7] },
        { query: "1::2", result: [2,4,6] },
        { query: "1:5:2", result: [2,4] },
    ].forEach(({ query, result }) => { 
        it (`should yield ${result} for ${query}`, () =>
            expect(q[query].a()).to.deep.equal(result));
    });
});
const resolve = require("./resolve");

function binaryFilter(op, comparer) {
    var filter = function(qable, _, op1, op2) {
        op1 = resolve(op1);
        op2 = resolve(op2);
        return qable.filter(t => comparer(op1(t), op2(t)));
    }
    filter.command = RegExp(`(.*)${op}(.*)`);
    return filter;
}

function unaryFilter(op, comparer) {
    var filter = function(qable, _, op1) {
        op1 = resolve(op1);
        return qable.filter(t => comparer(op1(t)));
    }
    filter.command = RegExp(`${op}(.*)`);
    return filter;
}

const filters = [
    binaryFilter('<=', (a, b) => a <= b),
    binaryFilter('>=', (a, b) => a >= b),
    binaryFilter('<',  (a, b) => a < b),
    binaryFilter('>',  (a, b) => a > b),
    binaryFilter('===', (a, b) => a === b),
    binaryFilter('!==', (a, b) => a !== b),
    binaryFilter('=',  (a, b) => a === b),
    binaryFilter('&&', (a, b) => a && b),
    binaryFilter('\\|\\|', (a, b) => a || b),
    unaryFilter('!', a => !a)
];

module.exports = filters;
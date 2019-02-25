var ohm = require("ohm-js");
const GRAMMAR = require("fs").readFileSync(__dirname + "/grammar.ohm");

const SEMANTICS = require("./semantics");

class QlangInterpreter {
    constructor() {
        this._cache = new WeakMap();
        this._grammar = ohm.grammar(GRAMMAR);
        this._semantics = this._grammar.createSemantics().addOperation('eval', SEMANTICS);
    }

    parse(str) {
        const result = this._grammar.match(str);
        if (result.failed())
            throw new Error("Parse failed");
        return result;
    }

    compile(str) {
        return this._semantics(this.parse(str)).eval();
    }

    run(str, qable) {
        return this.compile(str)(qable);
    }
}

global.i = new QlangInterpreter();

module.exports = QlangInterpreter;
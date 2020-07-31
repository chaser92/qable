import ohm from "ohm-js";
import Qable from "./Qable";
import GRAMMAR from "./grammar.ohm";

import SEMANTICS from "./semantics";
import QableAsync from "./QableAsync";

class QlangInterpreter {
    private _grammar: ohm.Grammar;
    private _semantics: ohm.Semantics;

    constructor() {
        this._grammar = ohm.grammar(GRAMMAR);
        this._semantics = this._grammar.createSemantics().addOperation('eval', SEMANTICS);
    }

    parse(str: string) {
        const result = this._grammar.match(str);
        if (result.failed())
            throw new Error("Parse failed");
        return result;
    }

    compile(str: string) {
        return this._semantics(this.parse(str)).eval();
    }

    run<T>(str: string, qable: Qable<T> | QableAsync<T>) {
        return this.compile(str)(qable);
    }
}

export default QlangInterpreter;
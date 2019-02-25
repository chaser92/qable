const QlangInterpreter = require("./qlang");
const interpreter = new QlangInterpreter();

module.exports = function query(Qable) {
    return function(query, qable) {
        return interpreter.run(query, qable);
    }
}
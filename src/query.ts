import QlangInterpreter from "./qlang";
const interpreter = new QlangInterpreter();
import Qable from "./Qable";
import QableAsync from "./QableAsync";

export default function query<T, I extends Qable<T> | QableAsync<T> | T[]>(_query: string, qable: Qable<T> | QableAsync<T>): I {
    return interpreter.run(_query, qable);
}
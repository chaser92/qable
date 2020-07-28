import QlangInterpreter from "./qlang";
const interpreter = new QlangInterpreter();
import Qable from "./Qable";

export default function query<T, I extends Qable<T> | T[]>(_query: string, qable: Qable<T>): I {
    return interpreter.run(_query, qable);
}
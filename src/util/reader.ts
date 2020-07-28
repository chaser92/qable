import Qable from "../Qable";

import rl from "readline";
import { createReadStream } from "fs";
import QableAsync from "../QableAsync";

export default (fileName: string) => {
    return QableAsync.fromAsyncGeneratorFn(async function*() {
        const reader = rl.createInterface(createReadStream(fileName, "utf-8"));
        reader.on("line", () => {
            
        })
    })
}
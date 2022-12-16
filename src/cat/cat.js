import {exists} from "../exists.js";
import fs from "fs";

export const cat = async (path) => {
    if (!await exists(path)) {
        throw new Error('no such file')
    }
    if ((await fs.promises.stat(path)).isDirectory()) {
        throw new Error('is dir')
    }
    const stream = fs.createReadStream(path, { encoding: "utf-8" })
    stream.pipe(process.stdout)
}

import {exists} from "../exists.js";
import fs from "fs";

export const cat = async (path) => new Promise(async (res, rej) => {
    if (!await exists(path)) {
        rej('no such file')
    }
    if ((await fs.promises.stat(path)).isDirectory()) {
        rej('is dir')
    }
    const stream = fs.createReadStream(path, { encoding: "utf-8" })
    stream.pipe(process.stdout)
    stream.on("end", () => {
        res()
    })
    stream.on("error", (err) => {
        rej(err)
    })
})

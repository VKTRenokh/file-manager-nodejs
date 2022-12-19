import {exists} from "../exists.js";
import fs from "fs"
import zlib from "zlib"

export const decompress = async (path, dest) => new Promise(async (res, rej) => {
    if (await exists(dest)) {
        rej()
        return
    }
    if (!await exists(path)) {
        rej()
        return
    }

    const source = fs.createReadStream(path)
    const destination = fs.createWriteStream(dest)
    const brotli = zlib.createBrotliDecompress()

    source.pipe(brotli).pipe(destination).on("end", () => {
        res()
    })
})

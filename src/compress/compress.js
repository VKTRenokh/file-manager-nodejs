import fs from "fs"
import zlib from "zlib"
import {exists} from "../exists.js";

export const compress = async (path, destination) => new Promise(async (res, rej) => {
    if (!await exists(path)) {
        rej()
        return
    }
    if (await exists(destination + '.br')) {
        rej()
        return
    }

    const source = fs.createReadStream(path)
    const dest = fs.createWriteStream(destination + '.br')
    const brotli = zlib.createBrotliCompress()

    source.pipe(brotli).pipe(dest).on("end", () => {
        console.log('\x1b[32m compressed')
        res()
    })
})


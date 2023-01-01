import * as crypto from "crypto";
import fs from "fs"
export const hash = path => new Promise((res, rej) => {
    const stream = fs.createReadStream(path)
    const hash = crypto.createHash('sha256')
    stream.pipe(hash)
    stream.on('error', () => {
        rej()
    })
    stream.on("end", () => {
        console.log(hash.digest('hex'))
        res()
    })
})

import fs from "fs/promises"
import {exists} from "../exists.js";

export const rm = async path => {
    if (!await exists(path)) {
        throw new Error('no such file')
    }

    if ((await fs.stat(path)).isDirectory()) {
        await fs.rm(path, { recursive: true })
        return
    }
    await fs.rm(path, { recursive: false })
}

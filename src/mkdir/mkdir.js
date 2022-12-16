import {exists} from "../exists.js";
import fs from "fs/promises"

export const mkdir = async path => {
    if (await exists(path)) {
        throw new Error('there is already such dir')
    }

    await fs.mkdir(path)
}

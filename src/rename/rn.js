import fs from "fs/promises"
import {exists} from "../exists.js";
export const rn = async (oldPath, newPath) => {
    if (!await exists(oldPath)) {
        throw new Error('no such file')
    }
    if (await exists(newPath)) {
        throw new Error('there is already such file')
    }

    await fs.rename(oldPath, newPath)
}

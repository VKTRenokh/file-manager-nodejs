import {exists} from "../exists.js";
import fs from "fs/promises";

export const size = async path => new Promise(async (res, rej) => {
    if (!await exists(path)) {
        rej()
        return
    }

    const stat = await fs.stat(path)

    console.log(stat.size / 1000000.0)

    res()
})

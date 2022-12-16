import fs from "fs/promises"

const readDir = async (path) => await fs.readdir(path, {withFileTypes: true})

export {
    readDir
}

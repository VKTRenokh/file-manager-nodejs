import fs from "fs/promises"

const ls = async (path) => {
    const files = await fs.readdir(path, {withFileTypes: true})
    return files.map(it => {
        return {
            name: it.name,
            type: it.isFile() ? 'file' : 'dir'
        }
    })
}

export {
    ls
}

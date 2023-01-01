import {exists} from "../exists.js";
import fs from "fs"
import {printGreen, printRed} from "../colors/colors.js";
import path from "path"

export const cp = (basePath, destPath) => new Promise(async (res, rej) => {
    if (!await exists(basePath)) {
        rej()
        return
    }
    if (await exists(destPath)) {
        rej()
        return
    }

    const sourceStream = fs.createReadStream(basePath)
    const destStream = fs.createWriteStream(destPath)
    const copyStream = sourceStream.pipe(destStream)
    sourceStream.on("end", () => {
        printGreen('Copied!')
        res()
    })

    copyStream.on("error", () => {
        printRed('error')
    })
})

export const cpDir = async (basePath, destPath) => {
    return new Promise(async (res, rej) => {
        if (!await exists(basePath)) {
            rej()
        }
        if (await exists(destPath)) {
            rej()
        }

        const dir = await fs.promises.mkdir(destPath, { recursive: true })
        const files = await fs.promises.readdir(basePath, { withFileTypes: true })

        files.forEach(file => {
            const filePath = path.join(basePath, file.name)

            if (file.isFile()) {
                const sourceStream = fs.createReadStream(filePath)

                const destStream = fs.createWriteStream(path.join(destPath, file.name))

                sourceStream.pipe(destStream)

                sourceStream.on("end", () => console.log("end"))
            } else {
                cpDir(filePath, path.join(dir, file.name))
            }
        })
    })
}

import os from "os"
import {ls} from "./ls/ls.js"
import path from "path"
import {cat} from "./cat/cat.js";
import fs from "fs"
import {exists} from "./exists.js";
import {add} from "./add/add.js";
import {rm} from "./rm/rm.js";
import {rn} from "./rename/rn.js";
import {mkdir} from "./mkdir/mkdir.js";
import {hash} from "./hash/hash.js";
import {compress} from "./compress/compress.js";
import {size} from "./size/size.js";
import {decompress} from "./decompress/decompress.js";
import {Os} from "./os/os.js";
import {printCyan, printRed} from "./colors/colors.js";
import {cp, cpDir} from "./cp/cp.js";
class App {
    constructor() {
        const testOs = new Os()

        const commands = {
            ls: async (args) => {
                console.table(await ls(path.join(this.currentPath, args[0] || '')))
            },
            ".exit": () => {
                console.log(`\nThank you for using File Manager, ${this.userName}, goodbye`)
                process.exit()
            },
            up: () => {
                this.currentPath = path.join(this.currentPath, '../')
            },
            cd: async (args) => {
                const newPath = path.join(this.currentPath, args[0])
                if (!args[0].startsWith('/') && await exists(newPath)) {
                    this.currentPath = newPath
                    return
                }
                this.currentPath = args[0]
            },
            cat: async (args) => {
                await cat(path.join(this.currentPath, args[0]))
            },
            add: async (args) => {
                await add(path.join(this.currentPath, args[0]))
            },
            rm: async (args) => {
                await rm(path.join(this.currentPath, args[0]))
            },
            rn: async (args) => {
                await rn(path.join(this.currentPath, args[0]), path.join(this.currentPath, args[1]))
            },
            mkdir: async (args) => {
                await mkdir(path.join(this.currentPath, args[0]))
            },
            hash: async (args) => {
                await hash(path.join(this.currentPath, args[0]))
            },
            compress: async (args) => {
                await compress(path.join(this.currentPath, args[0]), path.join(this.currentPath, args[1] || args[0]))
            },
            workspace: async () => {
                await commands.cd(['/mnt/sda2/aENOKH/WorkSpace/file-manager-nodejs'])
            },
            size: async (args) => {
                await size(path.join(this.currentPath, args[0]))
            },
            decompress: async (args) => {
                await decompress(path.join(this.currentPath, args[0]), path.join(this.currentPath, args[1] || args[0]))
            },
            os: async (args) => {
                testOs[args[0].replace(/--/, "")]()
            },
            cp: async (args = []) => {
                if (args.includes('-r')) {
                    args.splice(args.indexOf('-r'), 1)
                    await cpDir(path.join(this.currentPath, args[0]), path.join(this.currentPath, args[1]))
                    return
                }
                await cp(path.join(this.currentPath, args[0]), path.join(this.currentPath, args[1]))
            }
        }

        this.currentPath = os.homedir()

        this.userName = process.argv.slice(2).find(arg => arg.startsWith('--username='))?.slice(('--username=').length) || os.userInfo().username
        process.stdout.write(`\nWelcome to the File Manager, ${this.userName}!\n`)
        process.stdout.write(`\nYou are currently in ${this.currentPath} \n`)

        process.stdin.on("data", async (chunk) => {
            const command = commands[chunk.toString().trim().split(' ').at(0)] || (() => {
                printRed('unknown command!')
            })

            try {
                await command(chunk.toString().trim().split(' ').slice(1))
            } catch (e) {
                printRed('operation failed :(')
            }

            process.stdout.write(`\nYou are currently in ${this.currentPath} \n`)
        })
        process.on("SIGINT", () => {
            printCyan(`\nThank you for using File Manager, ${this.userName}, goodbye`)
            process.exit()
        })
    }
}

new App()

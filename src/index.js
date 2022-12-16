import os from "os"
import {readDir} from "./ls/ls.js"
import path from "path"
import {cat} from "./cat/cat.js";
import fs from "fs"
import {exists} from "./exists.js";
import {add} from "./add/add.js";
import {rm} from "./rm/rm.js";
import {rn} from "./rename/rn.js";
import {mkdir} from "./mkdir/mkdir.js";
import {hash} from "./hash/hash.js";
class App {
    constructor() {
        const commands = {
            ls: async () => {
                const files = await readDir(this.currentPath)
                console.table(files.map(file => {
                    return {
                        name: file.name,
                        type: file.isFile() ? 'file' : 'dir'
                    }
                }))
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
            }
        }

        this.currentPath = os.homedir()

        this.userName = process.argv.slice(2).find(arg => arg.startsWith('--username='))?.slice(('--username=').length) || os.userInfo().username
        process.stdout.write(`\nWelcome to the File Manager, ${this.userName}!\n`)
        process.stdout.write(`\nYou are currently in ${this.currentPath} \n`)

        process.stdin.on("data", async (chunk) => {
            const command = commands[chunk.toString().trim().split(' ').at(0)] || (() => {
                console.log('unknown command!')
            })

            await command(chunk.toString().trim().split(' ').slice(1))

            process.stdout.write(`\nYou are currently in ${this.currentPath} \n`)
        })
    }
}

new App()

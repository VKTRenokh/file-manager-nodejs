import os from "os"
import {printGreen, printYellow} from "../colors/colors.js";

export class Os {
    EOL() {
        console.log(JSON.stringify(os.EOL))
    }

    homedir() {
        console.log(os.homedir())
    }

    architecture() {
        // console.log(os.)
    }

    cpus() {
        console.table(os.cpus().map(el => {
            return {
                model: el.model,
                speed: el.speed
            }
        }))
    }

    username() {
        printGreen(os.userInfo().username)
    }
}

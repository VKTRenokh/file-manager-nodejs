import path from "path";
import { createHash } from "crypto";
import { exists } from "../utils/exists.js";
import * as os from "os";
import * as fs from "fs";
import * as zlib from "zlib";
import errorMessages from "../constants/constants.js";
import { split } from "../transforms/split.js";

export class FileManager {
  constructor(userName, initialLocation) {
    this.location = initialLocation;
    this.userName = userName;

    console.log(`Welcome to the File Manager, ${userName}!\n`);
    console.log(`You are currently in ${this.location}\n`);

    process.stdin.pipe(split).on("data", async (data) => {
      const parsedCommand = this.parseCommand(data);

      if (!this[parsedCommand.command]) {
        this.error();
        return;
      }

      try {
        await this[parsedCommand.command](parsedCommand.args);
      } catch (e) {
        console.log(e);
      }

      console.log(`\nYou are currently in ${this.location}\n`);
    });

    process.on("SIGINT", () => {
      this[".exit"]();
    });
  }

  parseCommand(command) {
    return {
      command: command[0],
      args: command.slice(1),
    };
  }

  up() {
    this.location =
      this.location === os.homedir()
        ? this.location
        : path.dirname(this.location);
  }

  async cd(args) {
    const newLocation = path.join(this.location, args[0]);

    if (!(await exists(newLocation))) {
      throw new Error(errorMessages.operationFailed);
    }

    this.location = newLocation;
  }

  async hash(args) {
    if (!(await exists(args[0]))) {
      throw new Error(errorMessages.operationFailed);
    }

    fs.createReadStream(args[0])
      .pipe(createHash("sha256").setEncoding("hex"))
      .pipe(process.stdout);
  }

  async ls() {
    const files = await fs.promises.readdir(this.location, {
      withFileTypes: true,
    });

    console.table(
      files
        .map((file) => {
          return {
            name: file.name,
            type: file.isFile() ? "file" : "directory",
          };
        })
        .sort((a, b) => {
          if (a.name < b.name) {
            return -1;
          }

          if (a.name > b.name) {
            return 1;
          }

          return 0;
        })
        .sort((a) => {
          if (a.type === "directory") {
            return -1;
          }

          return 1;
        })
    );
  }

  cat(args) {
    fs.createReadStream(args[0]).pipe(process.stdout);
  }

  async add(args) {
    await fs.promises.writeFile(path.join(this.location, args[0]), "");
  }

  async rn(args) {
    if (!args[0] || args[1]) {
      throw new Error(errorMessages.operationFailed);
    }

    await fs.promises.rename(args[0], args[1]);
  }

  async cp(args) {
    return new Promise(async (res, rej) => {
      if (!(await exists(path.join(this.location, args[0]))) || (await exists(path.join(this.location, args[1])))) {
        rej(errorMessages.operationFailed)
        return
      }

      const readStream = fs.createReadStream(path.join(this.location, args[0]));
      const writeStream = fs.createWriteStream(path.join(this.location, args[1]));

      const copy = readStream.pipe(writeStream)

      copy.on('finish', () => res())
      copy.on('error', () => rej())
    });
  }

  async mv(args) {
    return await this.rn(args);
  }

  async rm(args) {
    if (!(await exists(args[0]))) {
      throw new Error(errorMessages.operationFailed);
    }

    await fs.promises.rm(args[0], {
      force: true,
      recursive: true,
    });
  }

  os(args) {
    const cmds = {
      cpus: () => {
        console.table(
          os.cpus().map((cpu) => {
            return {
              model: cpu.model,
              rate: `${Math.round(cpu.speed / 100) / 10} GHz`,
            };
          })
        );
      },

      EOL: () => {
        console.log(JSON.stringify(os.EOL));
      },

      username: () => {
        console.log(os.userInfo().username);
      },

      architecture: () => {
        console.log(os.arch());
      },

      homedir: () => {
        console.log(os.homedir());
      },
    };

    if (!cmds[args[0].slice(2).trim()]) {
      throw new Error(errorMessages.operationFailed)
    }

    cmds[args[0].slice(2).trim()]();
  }

  async compress(args) {
    if (!(await exists(args[0])) || (await exists(args[1]))) {
      throw new Error(errorMessages.operationFailed);
    }

    fs.createReadStream(args[0])
      .pipe(zlib.createBrotliCompress())
      .pipe(fs.createWriteStream(args[1]));
  }

  async decompress(args) {
    if (!(await exists(args[0])) || (await exists(args[1]))) {
      throw new Error(errorMessages.operationFailed);
    }

    fs.createReadStream(args[0])
      .pipe(zlib.createBrotliDecompress())
      .pipe(fs.createWriteStream(args[1]));
  }

  async mkdir(args) {
    if (await exists(args[0])) {
      throw new Error(errorMessages.operationFailed);
    }

    await fs.promises.mkdir(path.join(this.location, args[0]), {
      recursive: true,
    });
  }

  error() {
    console.log("\nthere no such command\n");
  }

  ".exit"() {
    console.log(
      `\nThank you for using File Manager, ${this.userName}, goodbye!`
    );
    process.exit();
  }
}

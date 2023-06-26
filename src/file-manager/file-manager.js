import path from "path";
import { createHash } from "crypto";
import { exists } from "../utils/exists.js";
import * as os from "os";
import * as fs from "fs";
import * as zlib from "zlib";
import errorMessages from "../constants/constants.js";
import { split } from "../transforms/split.js";
import { nextLine } from "../transforms/nextLine.js";

export class FileManager {
  constructor(userName, initialLocation) {
    this.location = initialLocation;
    this.userName = userName;

    console.log(
      "\x1b[33m%s\x1b[0m",
      `Welcome to the File Manager, ${userName}!\n`
    );
    console.log("\x1b[32m%s\x1b[0m", `You are currently in ${this.location}\n`);

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

      console.log(
        "\x1b[32m%s\x1b[0m",
        `\nYou are currently in ${this.location}\n`
      );
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

  parsePath(str) {
    return path.join(this.location, str);
  }

  up() {
    this.location =
      this.location === os.homedir()
        ? this.location
        : path.dirname(this.location);
  }

  async cd(args) {
    const newLocation = this.parsePath(args[0]);

    if (!(await exists(newLocation))) {
      throw new Error(errorMessages.operationFailed);
    }

    this.location = newLocation;
  }

  async hash(args) {
    return new Promise(async (res, rej) => {
      const parsedPath = this.parsePath(args[0]);

      if (!(await exists(parsedPath))) {
        throw new Error(errorMessages.operationFailed);
      }

      const hash = fs
        .createReadStream(parsedPath)
        .pipe(createHash("sha256").setEncoding("hex"));

      hash.pipe(nextLine).pipe(process.stdout);

      hash.on("finish", () => {
        res();
      });
    });
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

  async cat(args) {
    return new Promise(async (res, rej) => {
      const parsedPath = this.parsePath(args[0]);

      if (!(await exists(parsedPath))) {
        rej(errorMessages.operationFailed);
      }

      const stream = fs.createReadStream(parsedPath);

      stream.on("data", (data) => {
        console.log(data.toString("utf-8"));
      });

      stream.on("end", () => {
        res();
      });

      stream.on("error", () => {
        rej(errorMessages.operationFailed);
      });
    });
  }

  async add(args) {
    await fs.promises.writeFile(this.parsePath(args[0]), "");
  }

  async rn(args) {
    if (
      !(await exists(this.parsePath(args[0]))) ||
      (await exists(this.parsePath(args[1])))
    ) {
      throw new Error(errorMessages.operationFailed);
    }

    await fs.promises.rename(this.parsePath(args[0]), this.parsePath(args[1]));
  }

  async cp(args) {
    return new Promise(async (res, rej) => {
      if (
        !(await exists(this.parsePath(args[0]))) ||
        (await exists(this.parsePath(args[1])))
      ) {
        rej(errorMessages.operationFailed);
        return;
      }

      const readStream = fs.createReadStream(this.parsePath(args[0]));
      const writeStream = fs.createWriteStream(this.parsePath(args[1]));

      const copy = readStream.pipe(writeStream);

      copy.on("finish", () => res());
      copy.on("error", () => rej());
    });
  }

  async mv(args) {
    return await this.rn(args);
  }

  async rm(args) {
    const parsedPath = this.parsePath(args[0]);

    if (!(await exists(parsedPath))) {
      throw new Error(errorMessages.operationFailed);
    }

    await fs.promises.rm(parsedPath, {
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
      throw new Error(errorMessages.operationFailed);
    }

    cmds[args[0].slice(2).trim()]();
  }

  async compress(args) {
    const firstParsedPath = this.parsePath(args[0]);
    const secondParsedPath = this.parsePath(args[1]);

    if (!(await exists(firstParsedPath)) || (await exists(secondParsedPath))) {
      throw new Error(errorMessages.operationFailed);
    }

    fs.createReadStream(firstParsedPath)
      .pipe(zlib.createBrotliCompress())
      .pipe(fs.createWriteStream(secondParsedPath));
  }

  async decompress(args) {
    const firstParsedPath = this.parsePath(args[0]);
    const secondParsedPath = this.parsePath(args[1]);

    if (!(await exists(firstParsedPath)) || (await exists(secondParsedPath))) {
      throw new Error(errorMessages.operationFailed);
    }

    fs.createReadStream(firstParsedPath)
      .pipe(zlib.createBrotliDecompress())
      .pipe(fs.createWriteStream(secondParsedPath));
  }

  async mkdir(args) {
    const parsedPath = this.parsePath(args[0]);

    if (await exists(parsedPath)) {
      throw new Error(errorMessages.operationFailed);
    }

    await fs.promises.mkdir(parsedPath, {
      recursive: true,
    });
  }

  error() {
    console.log("\nthere no such command\n");
  }

  ".exit"() {
    console.log(
      "\x1b[33m%s\x1b[0m",
      `\nThank you for using File Manager, ${this.userName}, goodbye!`
    );
    process.exit();
  }
}

import path from "path";
import { createHash } from "crypto";
import { fileURLToPath } from "url";
import { exists } from "./exists.js";
import * as os from "os";
import * as fs from "fs";
import * as zlib from "zlib";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export class FileManager {
  constructor(userName) {
    this.location = __dirname;
    this.userName = userName;

    console.log(`Welcome to the File Manager, ${userName}!\n`);
    console.log(`You are currently in ${this.location}\n`);

    process.stdin.on("data", async (data) => {
      const command = data.toString("utf-8").trim().split(' ');
      const parsedCommand = this.parseCommand(command);

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
    this.location = path.dirname(this.location);
  }

  async cd(args) {
    const newLocation = path.join(this.location, args.join(' '));

    if (!(await exists(newLocation))) {
      throw new Error("\nthere is no such directory\n");
    }

    this.location = newLocation
  }

  async hash(args) {
    if (!(await exists(args[0]))) {
      throw new Error("\n there is no such file");
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
      throw new Error("to few args");
    }

    await fs.promises.rename(args[0], args[1]);
  }

  async cp(args) {
    if (!(await exists(args[0])) || (await exists(args[1]))) {
      throw new Error("err");
    }

    await fs.promises.cp(args[0], args[1]);
  }

  async mv(args) {
    await this.rn(args);
  }

  async rm(args) {
    if (!(await exists(args[0]))) {
      throw new Error("file doesn't exists");
    }

    await fs.promises.rm(args[0], {
      force: true,
      recursive: true,
    });
  }

  os(args) {
    const cmds = {
      cpus: () => {
        console.log(os.cpus());
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

    cmds[args[0].slice(2).trim()]();
  }

  async compress(args) {
    if (!(await exists(args[0])) || (await exists(args[1]))) {
      throw new Error("compress error");
    }

    fs.createReadStream(args[0])
      .pipe(zlib.createBrotliCompress())
      .pipe(fs.createWriteStream(args[1]));
  }

  async decompress(args) {
    if (!(await exists(args[0])) || (await exists(args[1]))) {
      throw new Error("decompress error");
    }

    fs.createReadStream(args[0])
      .pipe(zlib.createBrotliDecompress())
      .pipe(fs.createWriteStream(args[1]));
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

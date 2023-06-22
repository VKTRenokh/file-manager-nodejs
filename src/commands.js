import crypto from "crypto";
import fs from "fs";
import path from "path";
import { exists } from "./exists.js";

class Commands {
  constructor() {
    this.govnoSranoe = "hi";
  }

  async hash(filePath) {
    return await new Promise(async (res, rej) => {
      if (!(await exists(filePath))) {
        rej("file does not exists!");
      }

      const stream = fs.createReadStream(filePath);
      const hash = crypto.createHash("sha256").setEncoding("hex");

      stream.pipe(hash).pipe(res);
    });
  }

  up(currentLocation) {
    return path.dirname(currentLocation);
  }

  q() {
    console.log("sefsefesfsefsfsd");
  }
}

export { Commands };

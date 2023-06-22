import { FileManager } from "./file-manager.js";

class App {
  constructor() {
    const args = process.argv.slice(2);

    const fileManager = new FileManager(this.getName(args));
  }

  getName(args) {
    const arg = args.find((arg) => {
      return arg.startsWith("--username");
    });

    if (!arg) {
      console.log("no username was given!");
      return;
    }

    return arg.slice(arg.indexOf("=") + 1);
  }
}

new App();

export class User {
  constructor() {
    this.name = this.parseName(process.argv.slice(2))
  }

  parseName(args) {
    const arg = args.find((arg) => {
      return arg.startsWith("--username");
    });

    if (!arg) {
      console.log("no username was given");
      return;
    }

    return arg.slice(arg.indexOf("=") + 1);
  }
}

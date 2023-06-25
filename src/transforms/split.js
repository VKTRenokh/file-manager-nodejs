import { Transform } from "stream";

export const split = new Transform({
  objectMode: true,
  transform(chunk, _, cb) {
    const splitted = chunk
      .toString()
      .trim()
      .split(/ +(?=(?:'[^']*'|[^'])*$)/)
      .map((word) => word.replace(/\'/g, ""));

    cb(null, splitted);
  },
});

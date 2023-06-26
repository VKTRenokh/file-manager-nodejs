import { Transform } from "stream"

export const nextLine = new Transform({
  transform(chunk, _, cb) {
    cb(null, `\n${chunk.toString()}\n`)
  }
})

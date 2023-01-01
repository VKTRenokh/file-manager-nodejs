import fs from "fs/promises";

export const exists = async (path) => fs.stat(path).then(() => true).catch(() => false)

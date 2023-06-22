import fs from "fs/promises";

export const exists = async (path) =>
  await fs
    .stat(path)
    .then(() => true)
    .catch(() => false);

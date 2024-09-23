import fs from "node:fs/promises";
import path from "node:path";

export async function exists(path: string): Promise<boolean> {
  return fs
    .access(path)
    .then(() => true)
    .catch(() => false);
}

import * as fs from 'fs/promises';

export async function appendToFile(filePath: string, content: string) {
  await fs.appendFile(filePath, content + "\n");
}

export async function resetFile(filePath: string) {
  await fs.writeFile(filePath, "");
}
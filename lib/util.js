import { customAlphabet } from "nanoid";
import fs from "fs";
import path from "path";
import url from "url";
const __dirname = url.fileURLToPath(new URL(".", import.meta.url));

export function fixByteCharacters(string) {
  return string.replace(/[]/g, "'"); // invisible character, supposed to be (’)
}

export function makeFilePath(filePath, relative=false) {
  return relative ? path.join(__dirname, filePath) : filePath;
}

export function readFile(filePath, { relative = false }={}) {
  filePath = makeFilePath(filePath, relative);
  const fileContent = fs.readFileSync(filePath, "utf-8");
  return fileContent;
}

export function writeFile(filePath, content, { relative = false }={}) {
  filePath = makeFilePath(filePath, relative);
  const dirPath = filePath.split("/").slice(0, -1).join("/");
  fs.mkdirSync(dirPath, { recursive: true });
  fs.writeFileSync(filePath, content, "utf-8");
}

export function uniqueId() {
  const nanoid = customAlphabet("1234567890abcdef", 6);
  return nanoid();
}

export default {
  readFile,
  writeFile,
  fixByteCharacters,
  uniqueId,
};
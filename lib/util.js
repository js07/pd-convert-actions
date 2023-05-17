import { customAlphabet } from "nanoid";
import fs from "fs";
import path from "path";
import url from "url";
import csv from "csvtojson";

/**
 * Replaces invalid, invisible apostrophe characters with the correct apostrophe
 * character.
 * @param {string} string - The string to be processed.
 * @returns {string} - The processed string with the correct apostrophe
 * character.
 */
export function replaceInvalidApostrophes(string) {
  const INVISIBLE_QUOTE = "";
  const invalidQuoteRegex = new RegExp(`[${INVISIBLE_QUOTE}]`, "g");
  return string.replace(invalidQuoteRegex, "'");
}

/**
 * Constructs a file path.
 * @param {string} filePath - The file path.
 * @param {boolean} relative - Whether the file path should be treated as
 * relative or not.
 * @returns {string} - The constructed file path.
 */
function makeFilePath(filePath, relative=false) {
  return relative ?
    path.join(url.fileURLToPath(new URL(".", import.meta.url)), filePath)
    : filePath;
}

/**
 * Reads the content of a file.
 * @param {string} filePath - The file path.
 * @param {Object} [options={}] - Optional configuration object.
 * @param {boolean} [options.relative=false] - Whether the file path should be
 * treated as relative or not.
 * @returns {string} - The file content.
 */
export function readFile(filePath, { relative = false }={}) {
  const fullFilePath = makeFilePath(filePath, relative);
  const fileContent = fs.readFileSync(fullFilePath, "utf-8");
  return fileContent;
}

/**
 * Write content to a file.
 * @param {string} filePath - The file path.
 * @param {string} content - The content to be written to the file.
 * @param {Object} [options={}] - Optional configuration object.
 * @param {boolean} [options.relative=false] - Whether the file path should be
 * treated as relative or not.
 */
export function writeFile(filePath, content, { relative = false }={}) {
  filePath = makeFilePath(filePath, relative);
  const dirPath = filePath.split("/").slice(0, -1).join("/");
  fs.mkdirSync(dirPath, { recursive: true });
  fs.writeFileSync(filePath, content, "utf-8");
}

export async function csvFileToJson(filePath) {
  return csv().fromFile(filePath);
}

/**
 * Generates a unique ID.
 * @param {Object} [options={}] - Optional configuration object.
 * @param {string} [options.alphabet="1234567890abcdef"] - The alphabet to be
 * used for generating the unique ID.
 * @param {number} [options.length=6] - The length of the unique ID.
 * @returns {string} - The unique ID.
 */
export function uniqueId({ alphabet = "1234567890abcdef", length = 6 }={}) {
  const nanoid = customAlphabet(alphabet, length);
  return nanoid();
}

/**
 * Checks if the code is running in a Node.js environment.
 * @returns {boolean} - Whether the code is running in a Node.js environment or
 * not.
*/
export function isNode() {
  return typeof process !== "undefined" &&
    process.versions != null &&
    process.versions.node != null;
}

export default {
  readFile,
  writeFile,
  replaceInvalidApostrophes,
  uniqueId,
  isNode,
  csvFileToJson
};
const fs = require("fs");
const path = require("path");

function fixByteCharacters(string) {
  return string.replace(/[]/g, "'"); // invisible character, supposed to be (’)
}

function makeFilePath(filePath, relative=false) {
  return relative ? path.join(__dirname, filePath) : filePath;
}

function readFile(filePath, { relative = false }={}) {
  filePath = makeFilePath(filePath, relative);
  const fileContent = fs.readFileSync(filePath, "utf-8");
  return fileContent;
}

function writeFile(filePath, content, { relative = false }={}) {
  filePath = makeFilePath(filePath, relative);
  const dirPath = filePath.split("/").slice(0, -1).join("/");
  fs.mkdirSync(dirPath, { recursive: true });
  fs.writeFileSync(filePath, content, "utf-8");
}

module.exports = {
  readFile,
  writeFile,
  fixByteCharacters
};
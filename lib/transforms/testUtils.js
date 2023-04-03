import fs from "fs";
import path from "path";
import prettier from "prettier";
import testUtils from "jscodeshift/dist/testUtils.js";
const { applyTransform, runInlineTest } = testUtils;

export function applyTransforms(source, transforms) {
  let output = source;
  for (const transform of transforms) {
    output = applyTransform(transform, {}, { source: output });
  }
  return output;
}

function wrapCodeWithFunctionExpr(source) {
  if (source.startsWith("async (")) {
    return source;
  }
  return `async (params, auths) => {${source && `\n${source}\n`}}`;
}

function formatText(source) {
  return prettier.format(source, { parser: "babel" });
}  

// Source: https://bit.ly/3uBzenA
function runTest(dirName, transformName, options, testFilePrefix, testOptions = {}, wrapCode=true) {
  if (!testFilePrefix) {
    testFilePrefix = transformName;
  }

  const extension = "js";
  const fixtureDir = path.join(dirName, "..", "__testfixtures__");
  const inputPath = path.join(fixtureDir, testFilePrefix + `.input.${extension}`);
  let source = fs.readFileSync(inputPath, "utf8");
  let expectedOutput = fs.readFileSync(
    path.join(fixtureDir, testFilePrefix + `.output.${extension}`),
    "utf8"
  );
  if (wrapCode) {
    source = wrapCodeWithFunctionExpr(source);
    expectedOutput = wrapCodeWithFunctionExpr(expectedOutput);
  }
  // Assumes transform is one level up from __tests__ directory
  const module = require(path.join(dirName, "..", transformName));
  runInlineTest(module, options, {
    path: inputPath,
    source
  }, expectedOutput, testOptions);
}

/**
 * Handles some boilerplate around defining a simple jest/Jasmine test for a
 * jscodeshift transform.
 */
export function defineTest(dirName, transformName, options, testFilePrefix, testOptions) {
  const testName = testFilePrefix
    ? `transforms correctly using "${testFilePrefix}" data`
    : "transforms correctly";
  
  describe(transformName, () => {
    it(testName, () => {
      runTest(dirName, transformName, options, testFilePrefix, testOptions);
    });
  });
}

export function defineInlineTest(
  module,
  testOptions,
  input,
  expectedOutput,
  testName, {
    wrapCode = true,
    formatCode = false,
  } = {}) {
  let testInput = input;
  let testExpectedOutput = expectedOutput;
  if (wrapCode) {
    testInput = wrapCodeWithFunctionExpr(testInput);
    testExpectedOutput = wrapCodeWithFunctionExpr(testExpectedOutput);
  }
  if (formatCode) {
    testInput = formatText(testInput);
    testExpectedOutput = formatText(testExpectedOutput);
  }
  it(testName || "transforms correctly", () => {
    runInlineTest(module, testOptions, {
      source: testInput
    }, testExpectedOutput);
  });
}
const fs = require("fs");
const path = require("path");
const testUtils = require("jscodeshift/dist/testUtils");
const { applyTransform, runInlineTest } = testUtils;

function applyTransforms(source, transforms) {
  let output = source;
  for (const transform of transforms) {
    output = applyTransform(transform, {}, { source: output });
  }
  return output;
}
exports.applyTransforms = applyTransforms;

function wrapCodeWithFunctionExpr(source) {
  if (source.startsWith("async (")) {
    return source;
  }
  return `async (params, auths) => {${source && `\n${source}\n`}}`;
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
function defineTest(dirName, transformName, options, testFilePrefix, testOptions) {
  const testName = testFilePrefix
    ? `transforms correctly using "${testFilePrefix}" data`
    : "transforms correctly";
  
  describe(transformName, () => {
    it(testName, () => {
      runTest(dirName, transformName, options, testFilePrefix, testOptions);
    });
  });
}
exports.defineTest = defineTest;

function defineInlineTest(module, options, input, expectedOutput, testName, wrapCode=true) {
  if (wrapCode) {
    input = wrapCodeWithFunctionExpr(input);
    expectedOutput = wrapCodeWithFunctionExpr(expectedOutput);
  }
  it(testName || "transforms correctly", () => {
    runInlineTest(module, options, {
      source: input
    }, expectedOutput);
  });
}
exports.defineInlineTest = defineInlineTest;
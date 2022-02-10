const { ESLint } = require("eslint");
const putout = require("putout");
const eslintConfig = require("../resources/.eslint.json");
const { fixByteCharacters } = require("./util");
const { applyTransforms } = require("./transforms/testUtils");
const undefAssignmentToDeclaration = require("./transforms/undef-assignment-to-declaration");
const removeEmptyObject = require("./transforms/remove-empty-object");
const snakeToCamelCase = require("./transforms/snake-to-camel-case");
const cjsToEsm = require("./transforms/cjs-to-esm");


const eslint = new ESLint({
  baseConfig: eslintConfig,
  useEslintrc: false,
  fix: true,
});

/**
 * Fix some errors that eslint doesn't autofix before linting.
 *
 * Add variable declarations to undeclared variables before removing unused
 * variables. Remove unused variables before removing empty objects. Optionally
 * convert to ESM.
 *
 * @param {string} source
 * @param {object} [options={}]
 * @returns {string}
 */
function preFixErrors(source, { toEsm }={}) {
  let code = applyTransforms(source, [ undefAssignmentToDeclaration ]);
  code = putout(code, {
    plugins: [
      "remove-unused-variables",
      "remove-empty-pattern"
    ],
  }).code;
  code = applyTransforms(code, [
    removeEmptyObject,
    snakeToCamelCase,
    ...(toEsm ? [cjsToEsm] : [])
  ]);
  return code;
}


async function lintAndFix(source) {
  const results = await eslint.lintText(source, { filePath: "components/app_slug/actions/comp_slug/comp_slug.js" });
  const [result] = results;
  const { output, messages } = result;
  for (const message of messages) {
    if (message.fatal) {
      console.log("Fatal error linting code:", message);
    }
  }
  return output;
}

/**
 * 
 * @param {string} source 
 * @param {object} [options={}] 
 * @returns {string}
 */
async function fix(source, { toEsm }={}) {
  let code = fixByteCharacters(source);
  code = preFixErrors(code, { toEsm });
  code = await lintAndFix(code);
  return code;
}

module.exports = fix;
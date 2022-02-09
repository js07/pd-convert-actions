const { ESLint } = require("eslint");
const putout = require("putout");
const eslintConfig = require("../resources/.eslint.json");
const { fixByteCharacters } = require("./util");
const { applyTransforms } = require("./transforms/testUtils");
const undefAssignmentToDeclaration = require("./transforms/undef-assignment-to-declaration");
const removeEmptyObject = require("./transforms/remove-empty-object");


const eslint = new ESLint({
  baseConfig: eslintConfig,
  useEslintrc: false,
  fix: true,
});

function preFixErrors(source) {
  let code = applyTransforms(source, [undefAssignmentToDeclaration]);
  code = putout(code, {
    plugins: ["remove-unused-variables", "remove-empty-pattern"],
  }).code;
  return applyTransforms(code, [removeEmptyObject]);
}


async function lintAndFix(source) {
  const results = await eslint.lintText(source, { filePath: "components/app_slug/actions/comp_slug/comp_slug.js" });
  const [result] = results;
  const { output } = result;
  return output;
}

async function fix(source) {
  let code = fixByteCharacters(source);
  code = preFixErrors(code);
  return lintAndFix(code);
}

module.exports = fix;
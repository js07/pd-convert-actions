const { ESLint } = require("eslint");
const eslintConfig = require("../resources/.eslint.json");
const { fixByteCharacters } = require("./util");
const { applyTransforms } = require("./transforms/testUtils");
const undefAssignmentToDeclaration = require("./transforms/undef-assignment-to-declaration");


const eslint = new ESLint({
  baseConfig: eslintConfig,
  useEslintrc: false,
  fix: true,
});

function preFixErrors(source) {
  return applyTransforms(source, [undefAssignmentToDeclaration]);
}


async function lintAndFix(source) {
  const results = await eslint.lintText(source, { filePath: "components/app_slug/actions/comp_slug/comp_slug.js" });
  const [result] = results;
  if (result.messages.length > 0) {
    console.log("=======");
    console.log("result.output", result.output.slice(0, 100));
    console.log("result.messages", result.messages);
    console.log("=======");
  }
  const { output } = result;
  return output;
}

async function fix(source) {
  let code = fixByteCharacters(source);
  code = preFixErrors(code);
  return lintAndFix(code);
}

module.exports = fix;
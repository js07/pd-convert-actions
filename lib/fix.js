const { ESLint } = require("eslint");
const eslintConfig = require("../resources/.eslint.json");

const eslint = new ESLint({
  baseConfig: eslintConfig,
  useEslintrc: false,
  fix: true,
});


async function lintAndFix(source) {
  const results = await eslint.lintText(source);
  const [result] = results;
  const { output } = result;
  return output;
}

async function fix(source) {
  return lintAndFix(source);
}

module.exports = fix;
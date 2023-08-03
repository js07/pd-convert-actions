import { replaceInvalidApostrophes, isNode } from "./util.js";
import { applyTransforms } from "./transforms/testUtils.js";
import undefAssignmentToDeclaration from "./transforms/undef-assignment-to-declaration.js";
import removeEmptyObject from "./transforms/remove-empty-object.js";
import snakeToCamelCase from "./transforms/snake-to-camel-case.js";
import cjsToEsm from "./transforms/cjs-to-esm.js";

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
async function preFixErrors(source, { toEsm }={}) {
  let code = applyTransforms(source, [ undefAssignmentToDeclaration ]);
  if (isNode()) {
    const { default: putout } = await import("putout");
    code = putout(code, {
      plugins: [
        "remove-unused-variables",
        "remove-empty-pattern"
      ],
    }).code;
  }
  code = applyTransforms(code, [
    removeEmptyObject,
    snakeToCamelCase,
    ...(toEsm ? [cjsToEsm] : []),
  ]);
  return code;
}


async function lintAndFix(source, { configFile="../resources/.eslint-pipedream.json" }={}) {
  const { ESLint } = await import("eslint");
  const { default: eslintConfig } = await import(configFile, { assert: { type: "json" } });
  const eslint = new ESLint({
    useEslintrc: false,
    overrideConfig: eslintConfig,
    fix: true
  });
  const results = await eslint.lintText(source, {
    filePath: "components/app_slug/actions/comp_slug/comp_slug.js"
  });
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
async function fix(source, { toEsm, usePipedreamLintRules = true }={}) {
  let code = replaceInvalidApostrophes(source);
  code = await preFixErrors(code, { toEsm });
  if (isNode()) {
    code = await lintAndFix(code, {
      configFile: usePipedreamLintRules
        ? "../resources/.eslint-pipedream.json"
        : "../resources/.eslint-default.json"
    });
  }
  return code;
}

export default fix;
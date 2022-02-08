const { fromPaths } = require("jscodeshift/dist/Collection");
const { register } = require("../collections/LegacyAction");
register();

// remove `const __a = require("axios")` if __a is unused

module.exports = function(fileInfo, api, options) {
  const j = api.jscodeshift;

  const ast = j(fileInfo.source);

  ast.getRequireCalls("axios")
    .map((path) => path.parent)
    .filter((path) => j.VariableDeclarator.check(path.node))
    .filter((path) => j.Identifier.check(path.value.id))
    .filter((path) => {
      const occurrences = fromPaths([path]).getVariableOccurrences(path.value.id.name);
      return occurrences.length <= 1;
    })
    .remove();

  return ast.toSource();
};
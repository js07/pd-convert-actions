const { fromPaths } = require("jscodeshift/dist/Collection");
const { register } = require("../collections/Node");
register();

// convert $send to $.send

module.exports = function(fileInfo, api, options) {
  const j = api.jscodeshift;

  const ast = j(fileInfo.source);
  const functionExpr = fromPaths([ast.get("program", "body", 0, "expression")], ast);

  functionExpr
    .getVariableOccurences("$send")
    .replaceWith(() => {
      return j.memberExpression(j.identifier("$"), j.identifier("send"));
    });

  return ast.toSource();
};
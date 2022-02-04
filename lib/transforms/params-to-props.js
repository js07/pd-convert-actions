const { fromPaths } = require("jscodeshift/dist/Collection");
const { register } = require("../collections/ArrowFunctionExpression");
register();

module.exports = function(fileInfo, api, options) {
  const j = api.jscodeshift;

  const ast = j(fileInfo.source);
  const functionExpr = fromPaths([ast.get("program", "body", 0, "expression")], ast);

  return functionExpr
    .renameTo(0, "this")
    .toSource();
};
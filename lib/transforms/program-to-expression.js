const { register } = require("../collections/LegacyAction");
register();

module.exports = function(fileInfo, api, options) {
  const j = api.jscodeshift;

  const ast = j(fileInfo.source);
  return j(ast.getFunctionExpression().get("body")).toSource();
};
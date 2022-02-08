const { register } = require("../collections/LegacyAction");
register();

// convert `$respond` to `$.respond`

module.exports = function(fileInfo, api, options) {
  const j = api.jscodeshift;

  const ast = j(fileInfo.source)
    .getFunctionExpression()
    .getVariableOccurrences("$respond")
    .replaceWith(() => {
      return j.memberExpression(j.identifier("$"), j.identifier("respond"));
    });

  return ast.toSource();
};
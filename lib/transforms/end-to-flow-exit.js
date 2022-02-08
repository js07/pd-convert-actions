const { register } = require("../collections/LegacyAction");
register();

// convert `$end` to `$.flow.exit`

module.exports = function(fileInfo, api, options) {
  const j = api.jscodeshift;

  const ast = j(fileInfo.source)
    .getFunctionExpression()
    .getVariableOccurrences("$end")
    .replaceWith(() => {
      return j.memberExpression(
        j.memberExpression(j.identifier("$"), j.identifier("flow")),
        j.identifier("exit")
      );
    });

  return ast.toSource();
};
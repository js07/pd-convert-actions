const { register } = require("../collections/LegacyAction");
register();

// convert `this.$checkpoint` to `this.db.get("$checkpoint")` when not left side
// of assignment expressions

module.exports = function(fileInfo, api, options) {
  const j = api.jscodeshift;

  const ast = j(fileInfo.source);
  ast
    .getCheckpointExpressions()
    .replaceWith(() => {
      // `this.db.get("$checkpoint")`
      return j.callExpression(
        j.memberExpression(
          j.memberExpression(j.thisExpression(), j.identifier("db")), // `this.db`
          j.identifier("get") // `.get`
        ), [ // `(`
          j.literal("$checkpoint"),  // `"$checkpoint",`
        ] // `)`
      );
    });

  return ast.toSource();
};
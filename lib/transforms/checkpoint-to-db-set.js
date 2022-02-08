const { register } = require("../collections/ArrowFunctionExpression");
register();

// convert `this.$checkpoint = __b` to `this.db("$checkpoint", __b)`

module.exports = function(fileInfo, api, options) {
  const j = api.jscodeshift;

  const ast = j(fileInfo.source);
  ast
    .getCheckpointAssignmentExpressions()
    .replaceWith((path) => {
      const value = path.value.right;
      // `this.db.set("$checkpoint", value)`
      return j.callExpression(
        j.memberExpression(
          j.memberExpression(j.thisExpression(), j.identifier("db")), // `this.db`
          j.identifier("set") // `.set`
        ), [ // `(`
          j.literal("$checkpoint"),  // `"$checkpoint",`
          value, // `value`
        ] // `)`
      );
    });

  return ast.toSource();
};
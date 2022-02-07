const { register } = require("../collections/ArrowFunctionExpression");
register();

// convert `this.$checkpoint = __b` to `this.db("$checkpoint", __b)`

module.exports = function(fileInfo, api, options) {
  const j = api.jscodeshift;

  const ast = j(fileInfo.source);
  ast
    .find(j.ThisExpression)
    .filter((path) => {
      const parent = path.parent.node;
      const isObjectThis = j.MemberExpression.check(parent) && parent.object === path.node;
      const isPropertyCheckpoint =
          j.Identifier.check(parent.property)
          && parent.property.name === "$checkpoint";
      return isObjectThis && isPropertyCheckpoint;
    })
    .map((path) => path.parent)
    .filter((path) => {
      const parent = path.parent.node;
      return j.AssignmentExpression.check(parent) && parent.left === path.node;
    })
    .map((path) => path.parent)
    .replaceWith((path) => {
      const value = path.value.right;
      // this.db.set("$checkpoint", value);
      return j.callExpression(
        j.memberExpression(
          j.memberExpression(j.thisExpression(), j.identifier("db")), // this.db
          j.identifier("set") // .set
        ), [ // (
          j.literal("$checkpoint"),  // "$checkpoint",
          value, // value
        ] // )
      );
    });

  return ast.toSource();
};
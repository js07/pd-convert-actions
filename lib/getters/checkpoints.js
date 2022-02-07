const jscodeshift = require("jscodeshift");
const { fromPaths } = require("jscodeshift/dist/Collection");
const { register } = require("../collections/ArrowFunctionExpression");
register();

module.exports = function(fileInfo) {
  const j = jscodeshift;

  const ast = j(fileInfo.source);
  return ast
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
    .nodes()
    .map((n) => n.right);
};

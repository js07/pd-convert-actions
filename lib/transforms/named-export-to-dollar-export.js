import { register } from "../collections/ArrowFunctionExpression.js";
register();

// convert `this.__a = __b` to `$.export(__a, __b)`

export default function(fileInfo, api, options) {
  const j = api.jscodeshift;

  const ast = j(fileInfo.source);
  ast
    .find(j.ThisExpression)
    .filter((path) => {
      const parent = path.parent.node;
      return j.MemberExpression.check(parent) && parent.object === path.node;
    })
    .map((path) => path.parent)
    .filter((path) => {
      const parent = path.parent.node;
      return j.AssignmentExpression.check(parent) && parent.left === path.node;
    })
    .map((path) => path.parent)
    .replaceWith((path) => {
      const exportName = path.value.left.property.name;
      const exportValue = path.value.right;
      return j.callExpression(
        j.memberExpression(j.identifier("$"), j.identifier("export")), [
          j.literal(exportName),
          exportValue,
        ]
      );
    });

  return ast.toSource();
}
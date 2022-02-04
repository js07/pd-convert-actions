const jscodeshift = require("jscodeshift");
const { fromPaths } = require("jscodeshift/dist/Collection");
const { register } = require("../collections/ArrowFunctionExpression");
register();

module.exports = function(fileInfo) {
  const j = jscodeshift;

  const ast = j(fileInfo.source);
  const functionExpr = fromPaths([ast.get("program", "body", 0, "expression")], ast);

  let auths = [];

  // `auths.__a` -> `__a`
  auths = auths.concat(
    functionExpr
      .getVariableInstances(1)
      .map((path) => path.parent)
      .filter((path) => j.MemberExpression.check(path.value))
      .nodes()
      .map((n) => n.property.name)
  );

  // `const { __a: __b } = auths` -> `__a`
  auths = auths.concat(
    functionExpr
      .getVariableInstances(1)
      .map((path) => path.parent)
      .filter((path) => j.VariableDeclarator.check(path.value))
      .filter((path) => path.value.id.properties.length === 1)
      .nodes()
      .map((n) => n.id.properties[0].key.name)
  );

  const uniqueAuths = [...new Set(auths)];

  return uniqueAuths;
};

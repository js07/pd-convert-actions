const { fromPaths } = require("jscodeshift/dist/Collection");
const { register } = require("../collections/ArrowFunctionExpression");
register();

// replace `auths.github` with `this.github.$auth`
// replace `const { __a: __b } = auths` with `const __b = this.__a.$auth`

module.exports = function(fileInfo, api, options) {
  const j = api.jscodeshift;

  const ast = j(fileInfo.source);
  const functionExpr = fromPaths([ast.get("program", "body", 0, "expression")], ast);

  functionExpr
    .getVariableInstances(1)
    .map((path) => path.parent)
    .filter((path) => j.MemberExpression.check(path.value))
    .replaceWith(p => {
      const authKey = p.get("property").value.name;
      return j.memberExpression(j.memberExpression(j.thisExpression(), j.identifier(authKey)), j.identifier("$auth"));
    });

  functionExpr
    .getVariableInstances(1)
    .map((path) => path.parent)
    .filter((path) => j.VariableDeclarator.check(path.value))
    .filter((path) => path.value.id.properties.length === 1)
    .replaceWith(p => {
      const property = p.value.id.properties[0];
      const authKey = property.key.name;
      const varName = property.value.name;
      return j.variableDeclarator(
        j.identifier(varName), 
        j.memberExpression(j.memberExpression(j.thisExpression(), j.identifier(authKey)), j.identifier("$auth"))
      );
    });

  return ast.toSource();
};
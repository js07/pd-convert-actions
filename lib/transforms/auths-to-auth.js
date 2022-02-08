const { register } = require("../collections/LegacyAction");
register();

// replace `auths.__a` with `this.__a.$auth`
// replace `const { __a: __b } = auths` with `const __b = this.__a.$auth`

module.exports = function(fileInfo, api, options) {
  const j = api.jscodeshift;

  const ast = j(fileInfo.source);

  ast.getAuthMemberExpressions()
    .replaceWith(p => {
      const authKey = p.get("property").value.name;
      return j.memberExpression(j.memberExpression(j.thisExpression(), j.identifier(authKey)), j.identifier("$auth"));
    });

  ast.getAuthVariableDeclarators()
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
const jscodeshift = require("jscodeshift/dist/core");
const { register } = require("../collections/LegacyAction");
register();

module.exports = function(fileInfo) {
  const j = jscodeshift;

  const ast = j(fileInfo.source);

  let auths = [];

  // `auths.__a` -> `__a`
  auths = auths.concat(
    ast.getAuthMemberExpressions()
      .nodes()
      .map((n) => n.property.name)
  );

  // `const { __a: __b } = auths` -> `__a`
  auths = auths.concat(
    ast.getAuthVariableDeclarators()
      .nodes()
      .map((n) => n.id.properties[0].key.name)
  );

  const uniqueAuths = [...new Set(auths)];

  return uniqueAuths;
};

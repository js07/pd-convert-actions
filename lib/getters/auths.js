import jscodeshift from "jscodeshift/dist/core.js";
import { register } from "../collections/LegacyAction.js";
register();

export default function(fileInfo) {
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

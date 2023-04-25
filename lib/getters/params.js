import jscodeshift from "jscodeshift/dist/core.js";
import { register } from "../collections/LegacyAction.js";
register();

export default function(fileInfo) {
  const j = jscodeshift;

  const ast = j(fileInfo.source);

  let params = [];

  // `params.__a` -> `__a`
  params = params.concat(
    ast.getParamsMemberExpressions()
      .nodes()
      .map((n) => n.property.name)
  );

  // `const { __a: __b } = params` -> `__a`
  params = params.concat(
    ast.getParamsVariableDeclarators()
      .nodes()
      .map((n) => n.id.properties[0].key.name)
  );

  const uniqueParams = [...new Set(params)];

  return uniqueParams;
}

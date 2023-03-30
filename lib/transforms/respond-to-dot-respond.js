import { register } from "../collections/LegacyAction.js";
register();

// convert `$respond` to `$.respond`

export default function(fileInfo, api, options) {
  const j = api.jscodeshift;

  const ast = j(fileInfo.source)
    .getFunctionExpression()
    .getVariableOccurrences("$respond")
    .replaceWith(() => {
      return j.memberExpression(j.identifier("$"), j.identifier("respond"));
    });

  return ast.toSource();
}
import { register } from "../collections/LegacyAction.js";
register();

// convert `$send` to `$.send`

export default function(fileInfo, api, options) {
  const j = api.jscodeshift;

  const ast = j(fileInfo.source)
    .getFunctionExpression()
    .getVariableOccurrences("$send")
    .replaceWith(() => {
      return j.memberExpression(j.identifier("$"), j.identifier("send"));
    });

  return ast.toSource();
}
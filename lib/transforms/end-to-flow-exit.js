import { register } from "../collections/LegacyAction.js";
register();

// convert `$end` to `$.flow.exit`

export default function(fileInfo, api, options) {
  const j = api.jscodeshift;

  const ast = j(fileInfo.source)
    .getFunctionExpression()
    .getVariableOccurrences("$end")
    .replaceWith(() => {
      return j.memberExpression(
        j.memberExpression(j.identifier("$"), j.identifier("flow")),
        j.identifier("exit")
      );
    });

  return ast.toSource();
}
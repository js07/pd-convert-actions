import { register } from "../collections/LegacyAction.js";
register();

// replace `event` with `steps.trigger.event`

export default function(fileInfo, api, options) {
  const j = api.jscodeshift;

  const ast = j(fileInfo.source);

  ast
    .getLegacyCodeCellVars("event")
    .replaceWith(() => j.memberExpression(
      j.memberExpression(
        j.identifier("steps"),
        j.identifier("trigger")
      ),
      j.identifier("event"),
    ));

  return ast.toSource();
}
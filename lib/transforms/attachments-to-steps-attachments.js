// replace `$attachments` with `steps.trigger.context.attachments`

export default function(fileInfo, api, options) {
  const j = api.jscodeshift;

  const ast = j(fileInfo.source);

  ast
    .getLegacyCodeCellVars("$attachments")
    .replaceWith(() => j.memberExpression(
      j.memberExpression(
        j.memberExpression(
          j.identifier("steps"),
          j.identifier("trigger")
        ),
        j.identifier("context")
      ),
      j.identifier("attachments")
    ));

  return ast.toSource();
}
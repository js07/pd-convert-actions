// replace `$attachments` with `steps.trigger.context.attachments`

export default function(fileInfo, api, options) {
  const j = api.jscodeshift;

  const ast = j(fileInfo.source);

  ast
    .find(j.Identifier)
    .filter((path) => {
      return path.node.name === "$attachments";
    })
    .filter((path) => {
      const parent = path.parent.node;
      const isMemberProperty = j.MemberExpression.check(parent) && parent.property === path.node;
      // $attachments must not be a property (e.g., foo.$attachments)
      return !isMemberProperty;
    })
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
// replace `event` with `steps.trigger.event`

export default function(fileInfo, api, options) {
  const j = api.jscodeshift;

  const ast = j(fileInfo.source);

  ast
    .find(j.Identifier)
    .filter((path) => {
      return path.node.name === "event";
    })
    .filter((path) => {
      const parent = path.parent.node;
      const isMemberProperty = j.MemberExpression.check(parent) && parent.property === path.node;
      // event must not be a property (e.g., foo.event)
      return !isMemberProperty;
    })
    .replaceWith(() => j.memberExpression(
      j.memberExpression(
        j.identifier("steps"),
        j.identifier("trigger")
      ),
      j.identifier("event"),
    ));

  return ast.toSource();
}
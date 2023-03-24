import { register } from "../collections/LegacyAction.js";
register();

// convert `run({}) => {` to `run() => {`

export default function(fileInfo, api, options) {
  const j = api.jscodeshift;

  const ast = j(fileInfo.source);

  ast.find(j.ObjectPattern)
    .filter((path) => {
      return path.value.properties.length === 0 && (
        j.FunctionExpression.check(path.parent.value)
        || j.FunctionDeclaration.check(path.parent.value)
      );
    })
    .remove();

  return ast.toSource();
}
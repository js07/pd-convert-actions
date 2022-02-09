const { register } = require("../collections/LegacyAction");
register();

// convert `run({}) => {` to `run() => {`

module.exports = function(fileInfo, api, options) {
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
};